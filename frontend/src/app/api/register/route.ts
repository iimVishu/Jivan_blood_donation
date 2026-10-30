import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { randomInt } from "node:crypto";
import { sendEmail } from "@/lib/email";
import { BLOOD_GROUPS, errorResponse } from "@/lib/api-validation";

export async function POST(req: Request) {
  try {
    const { name, email: rawEmail, password, role, bloodGroup, phone, address } = await req.json();
    if (typeof name !== 'string' || !name.trim() || typeof rawEmail !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail.trim()) || typeof password !== 'string' || password.length < 6 || Buffer.byteLength(password, 'utf8') > 72) {
      return NextResponse.json({ message: 'Enter a name, valid email and password of 6 to 72 bytes' }, { status: 400 });
    }
    if (role && !['donor', 'recipient'].includes(role)) {
      return NextResponse.json({ message: 'Staff accounts must be assigned by an administrator' }, { status: 403 });
    }
    if (bloodGroup && !BLOOD_GROUPS.includes(bloodGroup)) {
      return NextResponse.json({ message: 'Invalid blood group' }, { status: 400 });
    }
    const email = rawEmail.trim().toLowerCase();

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
    const otp = randomInt(100000, 1000000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

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

    await sendEmail(email, "Verify your email - Jeevan", `<h1>Email Verification</h1><p>Your registration OTP is <strong>${otp}</strong>. It expires in 10 minutes.</p>`);

    return NextResponse.json(
      { message: "OTP sent to email", email },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: errorResponse(error).message },
      { status: errorResponse(error).status }
    );
  }
}
