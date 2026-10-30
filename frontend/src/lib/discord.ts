type DiscordAppointmentEvent = {
  appointmentId?: string;
  title: string;
  description: string;
  donorName: string;
  bloodGroup?: string;
  appointmentDate?: string | Date;
  appointmentTime?: string;
  bloodBankName?: string;
  status: string;
  trackingStatus?: string;
};

type DiscordButton = {
  type: 2;
  style: 1 | 2 | 3 | 4 | 5;
  label: string;
  custom_id?: string;
  url?: string;
};

function actionButton(appointmentId: string, action: string, label: string, style: DiscordButton["style"]): DiscordButton {
  return { type: 2, style, label, custom_id: `appointment:${appointmentId}:${action}` };
}

function getAppointmentComponents(appointmentId: string, status: string, trackingStatus?: string) {
  if (status === "pending") {
    return [
      {
        type: 1,
        components: [
          actionButton(appointmentId, "confirm", "Approve", 3),
          actionButton(appointmentId, "reject", "Reject", 4),
          actionButton(appointmentId, "cancel", "Cancel", 2),
          actionButton(appointmentId, "reschedule", "Reschedule", 1),
        ],
      },
    ];
  }

  if (status === "confirmed") {
    return [
      {
        type: 1,
        components: [
          actionButton(appointmentId, "complete", "Mark complete", 3),
          actionButton(appointmentId, "cancel", "Cancel", 4),
          actionButton(appointmentId, "reschedule", "Reschedule", 1),
        ],
      },
      {
        type: 1,
        components: [
          actionButton(appointmentId, "tracking:collected", "Collected", trackingStatus === "collected" ? 3 : 2),
          actionButton(appointmentId, "tracking:testing", "Testing", trackingStatus === "testing" ? 3 : 2),
          actionButton(appointmentId, "tracking:processing", "Processing", trackingStatus === "processing" ? 3 : 2),
          actionButton(appointmentId, "tracking:ready", "Ready", trackingStatus === "ready" ? 3 : 2),
          actionButton(appointmentId, "tracking:transfused", "Transfused", trackingStatus === "transfused" ? 3 : 2),
        ],
      },
    ];
  }

  return [];
}

export async function sendDiscordAppointmentUpdate({
  appointmentId,
  title,
  description,
  donorName,
  bloodGroup,
  appointmentDate,
  bloodBankName,
  status,
  appointmentTime,
  trackingStatus,
}: DiscordAppointmentEvent) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl && !(process.env.DISCORD_BOT_TOKEN && process.env.DISCORD_CHANNEL_ID)) {
    console.info('Discord webhook not configured. Skipping appointment notification.');
    return { success: false, reason: 'DISCORD_WEBHOOK_URL missing' };
  }

  const colorMap: Record<string, number> = {
    pending: 0xf59e0b,
    confirmed: 0x22c55e,
    completed: 0x2563eb,
    cancelled: 0xef4444,
    rejected: 0xef4444,
  };

  const payload = {
    username: 'Jeevan Admin Bot',
    embeds: [
      {
        title,
        description,
        color: colorMap[status] ?? 0x111827,
        fields: [
          { name: 'Donor', value: donorName || 'Unknown donor', inline: true },
          { name: 'Blood Group', value: bloodGroup || 'Not provided', inline: true },
          { name: 'Appointment Date', value: appointmentDate ? new Date(appointmentDate).toLocaleString() : 'Not set', inline: true },
          ...(appointmentTime ? [{ name: 'Time', value: appointmentTime, inline: true }] : []),
          { name: 'Blood Bank', value: bloodBankName || 'Not assigned', inline: false },
          { name: 'Status', value: status || 'pending', inline: true },
          ...(trackingStatus ? [{ name: 'Donation tracking', value: trackingStatus, inline: true }] : []),
        ],
        timestamp: new Date().toISOString(),
      },
    ],
    components: appointmentId ? getAppointmentComponents(appointmentId, status, trackingStatus) : [],
  };

  try {
    const botToken = process.env.DISCORD_BOT_TOKEN;
    const channelId = process.env.DISCORD_CHANNEL_ID;
    const usesBot = Boolean(botToken && channelId);
    const endpoint = usesBot
      ? `https://discord.com/api/v10/channels/${channelId}/messages`
      : `${webhookUrl}${webhookUrl.includes("?") ? "&" : "?"}with_components=true`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(usesBot ? { Authorization: `Bot ${botToken}` } : {}),
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok && usesBot && webhookUrl) {
      console.error(`Discord bot message failed: ${response.status}`);
      const fallbackResponse = await fetch(`${webhookUrl}${webhookUrl.includes("?") ? "&" : "?"}with_components=true`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(5000),
      });

      if (fallbackResponse.ok) {
        return { success: true, mode: 'webhook-fallback' };
      }
    }

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Discord notification failed: ${response.status} ${text}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Discord notification failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
