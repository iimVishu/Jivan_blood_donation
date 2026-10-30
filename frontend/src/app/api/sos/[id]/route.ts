import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import EmergencyAlert from '@/models/EmergencyAlert';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { objectId, errorResponse } from '@/lib/api-validation';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await dbConnect();
    const { id } = await params;
    objectId(id);
    const { status } = await req.json();

    if (!['active', 'resolved', 'false_alarm'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const existing = await EmergencyAlert.findById(id);
    if (!existing) return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
    if (!['admin', 'hospital'].includes(session.user.role) && existing.user?.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
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
    const { message, status } = errorResponse(error);
    return NextResponse.json({ error: message }, { status });
  }
}
