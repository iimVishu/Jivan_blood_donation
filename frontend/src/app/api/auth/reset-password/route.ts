import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { createHash } from 'node:crypto';

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    if (typeof token !== "string" || !/^[a-f0-9]{64}$/.test(token) || typeof password !== "string") {
      return NextResponse.json({ error: 'Token and password are required' }, { status: 400 });
    }

    if (password.length < 6 || Buffer.byteLength(password, "utf8") > 72) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 });
    }

    await connectDB();

    // Find the user by token and ensure the token hasn't expired
    const user = await User.findOne({
      resetPasswordToken: createHash('sha256').update(token).digest('hex'),
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return NextResponse.json({ error: 'Password reset token is invalid or has expired' }, { status: 400 });
    }

    // Hash the new password and update the user doc
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user.password = hashedPassword;
    user.provider = 'credentials';
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return NextResponse.json({ message: 'Password has been successfully reset. You can now log in.' }, { status: 200 });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
