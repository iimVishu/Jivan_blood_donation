import { NextResponse } from "next/server";
import { sendEmail, escapeHtml } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    const supportEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER || process.env.EMAIL_USER;
    if (!supportEmail) return NextResponse.json({ message: 'Contact email is not configured' }, { status: 503 });
    await sendEmail(supportEmail, `New Contact Form Submission: ${subject}`, `
      <h3>New Contact Message</h3>
      <p>Name: ${escapeHtml(name)}</p><p>Email: ${escapeHtml(email)}</p>
      <p>Subject: ${escapeHtml(subject)}</p><p>${escapeHtml(message)}</p>
    `);

    return NextResponse.json(
      { message: "Message sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { message: "Failed to send message" },
      { status: 500 }
    );
  }
}
