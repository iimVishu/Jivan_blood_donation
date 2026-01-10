import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Volunteer from "@/models/Volunteer";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import nodemailer from "nodemailer";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    const updatedVolunteer = await Volunteer.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedVolunteer) {
      return NextResponse.json({ message: "Volunteer application not found" }, { status: 404 });
    }

    // Send email notification if status is approved or rejected
    if (status === 'approved' || status === 'rejected') {
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        try {
          const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS,
            },
          });

          const subject = status === 'approved' 
            ? "Volunteer Application Approved - Jeevan Blood Donation"
            : "Update on your Volunteer Application - Jeevan Blood Donation";
          
          const html = status === 'approved'
            ? `
              <h2>Congratulations ${updatedVolunteer.name}!</h2>
              <p>We are pleased to inform you that your application to join Jeevan Blood Donation as a volunteer has been <strong>APPROVED</strong>.</p>
              <p>We are excited to have you on board. Our team will contact you shortly with further details.</p>
              <p>Thank you for your commitment to saving lives!</p>
              <br/>
              <p>Best Regards,</p>
              <p>The Jeevan Team</p>
            `
            : `
              <h2>Hello ${updatedVolunteer.name},</h2>
              <p>Thank you for your interest in volunteering with Jeevan Blood Donation.</p>
              <p>After careful review, we regret to inform you that we are unable to move forward with your application at this time.</p>
              <p>We appreciate your willingness to help and encourage you to apply again in the future.</p>
              <br/>
              <p>Best Regards,</p>
              <p>The Jeevan Team</p>
            `;

          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: updatedVolunteer.email,
            subject: subject,
            html: html,
          });
          console.log(`Email sent to ${updatedVolunteer.email} regarding ${status} status.`);
        } catch (emailError) {
          console.error("Error sending status email:", emailError);
          // Don't fail the request if email fails, just log it
        }
      } else {
        console.warn("Email credentials missing, skipping notification email.");
      }
    }

    return NextResponse.json(updatedVolunteer);
  } catch (error) {
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;

    const deletedVolunteer = await Volunteer.findByIdAndDelete(id);

    if (!deletedVolunteer) {
      return NextResponse.json({ message: "Volunteer application not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Volunteer application deleted successfully" });
  } catch (error) {
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
