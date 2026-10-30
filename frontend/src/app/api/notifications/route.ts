import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const url = process.env.SOCKET_SERVER_URL;
  const token = process.env.NOTIFICATION_API_TOKEN;
  if (!url || !token) return NextResponse.json({ error: 'Live notifications are not configured' }, { status: 503 });
  try {
    const body = await req.json();
    const response = await fetch(`${url.replace(/\/$/, '')}/api/notify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return NextResponse.json({ error: 'Notification server rejected the broadcast' }, { status: 502 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Could not send live notification' }, { status: 502 });
  }
}
