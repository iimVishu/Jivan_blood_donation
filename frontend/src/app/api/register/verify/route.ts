import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    const { email: rawEmail, otp } = await req.json();
    const email = rawEmail.toLowerCase();

    await dbConnect();

    console.log(`Verifying OTP for ${email}. Received OTP: ${otp}`);

    const user = await User.findOne({ email });

    if (!user) {
      console.log("User not found during verification");
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    console.log(`User found: ${user.email}, stored OTP: ${user.otp}`);

    if (user.isVerified) {
      return NextResponse.json(
        { message: "User already verified" },
        { status: 400 }
      );
    }

    if (String(user.otp) !== String(otp)) {
      console.log(`OTP mismatch. Expected: ${user.otp}, Received: ${otp}`);
      return NextResponse.json(
        { message: "Invalid OTP" },
        { status: 400 }
      );
    }

    if (user.otpExpiry && new Date(user.otpExpiry) < new Date()) {
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
