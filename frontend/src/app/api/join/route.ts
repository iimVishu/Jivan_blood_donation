import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import dbConnect from "@/lib/db";
import Volunteer from "@/models/Volunteer";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const { name, email, phone, address, reason } = body;

    // Log the application details (for debugging/backup)
    console.log("New Volunteer Application:", body);

    // Save to MongoDB
    try {
      await Volunteer.create({
        name,
        email,
        phone,
        address,
        reason
      });
    } catch (dbError) {
      console.error("Error saving to database:", dbError);
      return NextResponse.json({ message: "Failed to save application" }, { status: 500 });
    }

    // Check if email credentials are configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn("Email credentials not found in .env.local. Simulating email send.");
      return NextResponse.json({ message: "Application received (Simulation Mode)" });
    }

    // Configure email transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: "vishal14142004@gmail.com", // The receiver email specified by the user
      subject: `New Volunteer Application: ${name}`,
      html: `
        <h2>New Volunteer Application</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Address:</strong> ${address}</p>
        <p><strong>Reason for Joining:</strong></p>
        <p>${reason}</p>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: "Application sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    // Return success even if email fails, so the user isn't blocked.
    // In a real app, you might want to save to DB as backup.
    return NextResponse.json(
      { message: "Application received (Email failed to send - check server logs)" },
      { status: 200 }
    );
  }
}
