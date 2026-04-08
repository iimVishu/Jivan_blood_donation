import { NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { sendEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({ email });

    if (!user) {
      // Return 200 even if user not found to prevent email enumeration
      return NextResponse.json({ message: 'If that email address is in our database, we will send you an email to reset your password.' }, { status: 200 });
    }

    // Generate a reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    // Construct the reset URL
    const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    // Send the email
    const subject = '🔐 Password Reset Request - Jeevan Blood Donation';
    const html = `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
        <div style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">Password Reset Request</h1>
        </div>
        
        <div style="padding: 40px 30px; background-color: #ffffff;">
          <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">Dear <strong>${user.name}</strong>,</p>
          
          <p style="color: #4b5563; line-height: 1.6; font-size: 15px; margin-bottom: 30px;">
            We received a request to reset the password for your Jeevan Blood Donation account. 
            If you made this request, please click the button below to set a new password:
          </p>
          
          <div style="text-align: center; margin: 35px 0;">
            <a href="${resetUrl}" style="background-color: #dc2626; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 2px 4px rgba(220, 38, 38, 0.3);">Reset My Password</a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <strong>Note:</strong> This link will expire in 1 hour for your security.
          </p>
          
          <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin-bottom: 0;">
            If you did not request a password reset, please ignore this email. Your password will remain unchanged and your account is secure.
          </p>
        </div>
        
        <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            &copy; ${new Date().getFullYear()} Jeevan Blood Donation. All rights reserved.
          </p>
        </div>
      </div>
    `;

    await sendEmail(user.email, subject, html);

    return NextResponse.json({ message: 'If that email address is in our database, we will send you an email to reset your password.' }, { status: 200 });

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
