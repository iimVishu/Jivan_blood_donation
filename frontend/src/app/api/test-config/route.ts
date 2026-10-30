import { NextResponse } from 'next/server';
import { verifySmtpConnection } from '@/lib/email';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'admin') return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  const result = await verifySmtpConnection();
  
  const envCheck = {
    SMTP_HOST: !!(process.env.SMTP_HOST || 'smtp.gmail.com'),
    SMTP_PORT: !!(process.env.SMTP_PORT || '587'),
    SMTP_USER: !!(process.env.SMTP_USER || process.env.EMAIL_USER),
    SMTP_PASS: !!(process.env.SMTP_PASS || process.env.EMAIL_PASS),
    GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
    MONGODB_URI: !!process.env.MONGODB_URI,
    NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
  };

  return NextResponse.json({ 
    connection: result,
    environmentVariables: envCheck
  });
}
