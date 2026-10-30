import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    const { email: rawEmail, otp } = await req.json();
    if (typeof rawEmail !== "string" || typeof otp !== "string" || !/^\d{6}$/.test(otp)) {
      return NextResponse.json({ message: "Valid email and six-digit OTP required" }, { status: 400 });
    }
    const email = rawEmail.trim().toLowerCase();

    await dbConnect();


    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }


    if (user.isVerified) {
      return NextResponse.json(
        { message: "User already verified" },
        { status: 400 }
      );
    }

    if (!user.otp || user.otp !== otp) {
      return NextResponse.json(
        { message: "Invalid OTP" },
        { status: 400 }
      );
    }

    if (!user.otpExpiry || new Date(user.otpExpiry) <= new Date()) {
      return NextResponse.json(
        { message: "OTP expired" },
        { status: 400 }
      );
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    return NextResponse.json(
      { message: "Email verified successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
