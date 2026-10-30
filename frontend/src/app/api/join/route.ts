import { NextResponse } from "next/server";
import { sendEmail, escapeHtml } from "@/lib/email";
import { errorResponse } from "@/lib/api-validation";
import dbConnect from "@/lib/db";
import Volunteer from "@/models/Volunteer";

export async function POST(req: Request) {
  try {
    const { name, email, phone, address, reason } = await req.json();
    if (![name, email, phone, address, reason].every(value => typeof value === 'string' && value.trim())) {
      return NextResponse.json({ message: 'All application fields are required' }, { status: 400 });
    }
    await dbConnect();
    await Volunteer.create({ name, email, phone, address, reason });
    let emailSent = false;
    try {
      const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER || process.env.EMAIL_USER;
      if (adminEmail) {
        await sendEmail(adminEmail, `New Volunteer Application: ${name}`, `
          <h2>Volunteer Application</h2><p>${escapeHtml(name)} (${escapeHtml(email)})</p>
          <p>${escapeHtml(phone)}</p><p>${escapeHtml(address)}</p><p>${escapeHtml(reason)}</p>
        `);
        emailSent = true;
      }
    } catch (error) {
      console.error('Volunteer application saved; admin email failed:', error);
    }
    return NextResponse.json({ message: 'Application received', emailSent }, { status: 201 });
  } catch (error) {
    const { message, status } = errorResponse(error);
    return NextResponse.json({ message }, { status });
  }
}
