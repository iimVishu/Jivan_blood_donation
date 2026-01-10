import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { name, email: rawEmail, password, role, bloodGroup, phone, address } = await req.json();
    const email = rawEmail.toLowerCase();

    await dbConnect();

    // Sanitize bloodGroup: set to undefined if empty string
    const validBloodGroup = bloodGroup && bloodGroup !== "" ? bloodGroup : undefined;

    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.isVerified) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // ALWAYS Log OTP to console for easier local testing
    console.log("\n==================================================");
    console.log(`🔐 DEVELOPMENT OTP for ${email}: ${otp}`);
    console.log("==================================================\n");

    if (existingUser && !existingUser.isVerified) {
      // Update existing unverified user
      existingUser.name = name;
      existingUser.password = hashedPassword;
      existingUser.role = role || "donor";
      existingUser.bloodGroup = validBloodGroup;
      existingUser.phone = phone;
      existingUser.address = address;
      existingUser.location = { type: 'Point', coordinates: [0, 0] }; // Default location to satisfy 2dsphere index
      existingUser.otp = otp;
      existingUser.otpExpiry = otpExpiry;
      await existingUser.save();
    } else {
      // Create new user
      await User.create({
        name,
        email,
        password: hashedPassword,
        role: role || "donor",
        bloodGroup: validBloodGroup,
        phone,
        address,
        location: { type: 'Point', coordinates: [0, 0] }, // Default location to satisfy 2dsphere index
        otp,
        otpExpiry,
        isVerified: false,
      });
    }

    // Send OTP Email
    try {
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS && !process.env.EMAIL_USER.includes('your-gmail')) {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: email,
          subject: "Verify your email - Blood Donation System",
          html: `
            <h1>Email Verification</h1>
            <p>Your OTP for registration is: <strong>${otp}</strong></p>
            <p>This OTP is valid for 10 minutes.</p>
          `,
        });
      } else {
        console.log("⚠️ Email credentials not configured. Check terminal for OTP.");
      }
    } catch (emailError) {
      console.error("Failed to send email:", emailError);
      // Continue execution so user can still verify using console OTP
    }

    return NextResponse.json(
      { message: "OTP sent to email", email },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
