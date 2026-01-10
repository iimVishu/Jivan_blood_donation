import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import EmergencyAlert from '@/models/EmergencyAlert';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const { status } = await req.json();

    if (!['active', 'resolved', 'false_alarm'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const alert = await EmergencyAlert.findByIdAndUpdate(
      id,
      { 
        status,
        resolvedAt: status === 'resolved' || status === 'false_alarm' ? new Date() : undefined
      },
      { new: true }
    );

    if (!alert) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
    }

    return NextResponse.json(alert);
  } catch (error) {
    console.error('Update SOS Error:', error);
    return NextResponse.json({ error: 'Failed to update alert' }, { status: 500 });
  }
}
