import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import EmergencyAlert from '@/models/EmergencyAlert';
import User from '@/models/User';

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    await dbConnect();

    const data = await req.json();
    const { location, contactNumber } = data;

    let userId = null;
    if (session?.user?.email) {
      const user = await User.findOne({ email: session.user.email });
      if (user) {
        userId = user._id;
      }
    }

    const alert = await EmergencyAlert.create({
      user: userId,
      location,
      contactNumber,
      status: 'active',
    });

    return NextResponse.json({ success: true, alertId: alert._id }, { status: 201 });
  } catch (error) {
    console.error('SOS Error:', error);
    return NextResponse.json({ error: 'Failed to trigger SOS' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    await dbConnect();
    // Fetch active alerts, sorted by newest first
    // Populate user details if available
    const alerts = await EmergencyAlert.find({ status: 'active' })
      .sort({ createdAt: -1 })
      .populate('user', 'name email phone bloodType');

    return NextResponse.json(alerts);
  } catch (error) {
    console.error('Fetch SOS Error:', error);
    return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 });
  }
}
