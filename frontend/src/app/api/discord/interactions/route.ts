import { createPublicKey, verify } from "node:crypto";
import { NextResponse, after } from "next/server";
import { updateAppointmentWorkflow } from "@/lib/appointment-workflow";
import { objectId } from "@/lib/api-validation";

export const runtime = "nodejs";
export const maxDuration = 120;

type DiscordInteraction = {
  type: number;
  application_id?: string;
  token?: string;
  data?: {
    custom_id?: string;
    components?: Array<{ components?: Array<{ value?: string }> }>;
  };
  member?: { user?: { id?: string }; roles?: string[] };
  user?: { id?: string };
};

function verifySignature(rawBody: string, signature: string | null, timestamp: string | null) {
  const publicKey = process.env.DISCORD_PUBLIC_KEY;
  if (!publicKey || !signature || !timestamp || !/^[a-f0-9]{64}$/i.test(publicKey)) return false;

  try {
    const key = createPublicKey({
      key: Buffer.concat([
        Buffer.from("302a300506032b6570032100", "hex"),
        Buffer.from(publicKey, "hex"),
      ]),
      format: "der",
      type: "spki",
    });
    return verify(
      null,
      Buffer.from(timestamp + rawBody),
      key,
      Buffer.from(signature, "hex"),
    );
  } catch {
    return false;
  }
}

function isAuthorizedAdmin(interaction: DiscordInteraction) {
  const userId = interaction.member?.user?.id || interaction.user?.id;
  const roles = interaction.member?.roles || [];
  const allowedUsers = (process.env.DISCORD_ADMIN_USER_IDS || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const allowedRoles = (process.env.DISCORD_ADMIN_ROLE_IDS || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  return Boolean(
    (userId && allowedUsers.includes(userId)) ||
    roles.some((roleId) => allowedRoles.includes(roleId)),
  );
}

function response(content: string, ephemeral = true) {
  return NextResponse.json({
    type: 4,
    data: { content, flags: ephemeral ? 64 : 0 },
  });
}

function deferredResponse(interaction: DiscordInteraction, operation: () => Promise<string>) {
  if (!interaction.application_id || !/^\d+$/.test(interaction.application_id) || !interaction.token) {
    return response('Missing interaction response details.');
  }
  const endpoint = `https://discord.com/api/v10/webhooks/${interaction.application_id}/${encodeURIComponent(interaction.token)}/messages/@original`;
  // Acknowledge immediately; database, mail and webhook work can exceed Discord's response deadline.
  after(async () => {
    let content: string;
    try {
      content = await operation();
    } catch (error) {
      console.error('Discord appointment operation failed:', error);
      content = 'Could not update this appointment. Check the dashboard and try again.';
    }
    try {
      const result = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, allowed_mentions: { parse: [] } }),
        signal: AbortSignal.timeout(5000),
      });
      if (!result.ok) console.error('Discord interaction response failed:', result.status);
    } catch (error) {
      console.error('Discord interaction response failed:', error);
    }
  });
  return NextResponse.json({ type: 5, data: { flags: 64 } });
}

function modal(appointmentId: string) {
  return NextResponse.json({
    type: 9,
    data: {
      custom_id: `appointment_reschedule:${appointmentId}`,
      title: "Reschedule appointment",
      components: [
        {
          type: 1,
          components: [{ type: 4, custom_id: "date", label: "Date (YYYY-MM-DD)", style: 1, required: true, max_length: 10 }],
        },
        {
          type: 1,
          components: [{ type: 4, custom_id: "time", label: "Time", style: 1, required: true, max_length: 40 }],
        },
      ],
    },
  });
}

function getModalValues(interaction: DiscordInteraction) {
  const values = interaction.data?.components?.flatMap((row) => row.components || []) || [];
  return {
    date: values[0]?.value || "",
    time: values[1]?.value || "",
  };
}

export async function POST(req: Request) {
  const rawBody = await req.text();
  if (!verifySignature(rawBody, req.headers.get("x-signature-ed25519"), req.headers.get("x-signature-timestamp"))) {
    return NextResponse.json({ message: "Invalid request signature" }, { status: 401 });
  }

  let interaction: DiscordInteraction;
  try {
    interaction = JSON.parse(rawBody) as DiscordInteraction;
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }

  if (interaction.type === 1) return NextResponse.json({ type: 1 });
  if (![3, 5].includes(interaction.type) || !isAuthorizedAdmin(interaction)) {
    return response("You are not authorized to manage appointments from Discord.");
  }

  const customId = interaction.data?.custom_id || "";
  const mongoAdminId = process.env.DISCORD_ADMIN_MONGODB_USER_ID;
  if (!mongoAdminId) return response("Discord actions are not configured: missing admin account mapping.");
  const appointmentIdFromAction = customId.split(':')[1];
  try {
    objectId(appointmentIdFromAction);
    objectId(mongoAdminId);
  } catch {
    return response('Invalid appointment or admin account ID.');
  }
  if (interaction.type === 3 && customId === `appointment:${appointmentIdFromAction}:reschedule`) {
    return modal(appointmentIdFromAction);
  }

  if (customId.startsWith("appointment_reschedule:")) {
    const appointmentId = customId.split(":")[1];
    const { date, time } = getModalValues(interaction);
    const parsedDate = new Date(`${date}T00:00:00`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(parsedDate.getTime()) || parsedDate.getFullYear() !== Number(date.slice(0, 4)) || parsedDate.getMonth() + 1 !== Number(date.slice(5, 7)) || parsedDate.getDate() !== Number(date.slice(8, 10)) || !time.trim()) {
      return response("Use a valid date in YYYY-MM-DD format.");
    }

    return deferredResponse(interaction, async () => {
      await updateAppointmentWorkflow({
        id: appointmentId,
        date: parsedDate,
        timeSlot: time,
        performedBy: mongoAdminId,
        performedByRole: "admin",
        userAgent: "Discord interaction",
      });
      return `Appointment rescheduled to ${date} at ${time}.`;
    });
  }

  if (interaction.type !== 3 || !customId.startsWith("appointment:")) {
    return response("Unsupported Discord action.");
  }

  const actionParts = customId.split(":");
  const appointmentId = actionParts[1];
  const action = actionParts.slice(2).join(":");
  const statusByAction: Record<string, string> = {
    confirm: "confirmed",
    reject: "rejected",
    complete: "completed",
    cancel: "cancelled",
  };
  const status = statusByAction[action];
  const trackingStatus = action.startsWith("tracking:") ? action.split(":")[1] : undefined;

  if (!status && !trackingStatus) return response("Unsupported appointment action.");

  return deferredResponse(interaction, async () => {
    await updateAppointmentWorkflow({
      id: appointmentId,
      status,
      trackingStatus,
      performedBy: mongoAdminId,
      performedByRole: "admin",
      userAgent: "Discord interaction",
    });
    const label = status ? status.charAt(0).toUpperCase() + status.slice(1) : `Tracking updated to ${trackingStatus}`;
    return `Appointment ${label.toLowerCase()} successfully.`;
  });
}
