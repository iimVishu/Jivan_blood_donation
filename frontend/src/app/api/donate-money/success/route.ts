import { NextResponse } from "next/server";
import { sendDonationThankYouEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { email, amount, paymentId } = await req.json();

    if (!email || !amount || !paymentId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await sendDonationThankYouEmail(email, amount, paymentId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error sending donation email:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
