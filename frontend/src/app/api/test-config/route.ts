import { NextResponse } from 'next/server';
import { verifySmtpConnection } from '@/lib/email';

export async function GET() {
  const result = await verifySmtpConnection();
  
  const envCheck = {
    SMTP_HOST: !!process.env.SMTP_HOST,
    SMTP_PORT: !!process.env.SMTP_PORT,
    SMTP_USER: !!process.env.SMTP_USER,
    SMTP_PASS: !!process.env.SMTP_PASS,
    GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
    MONGODB_URI: !!process.env.MONGODB_URI,
    NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
  };

  return NextResponse.json({ 
    connection: result,
    environmentVariables: envCheck
  });
}
