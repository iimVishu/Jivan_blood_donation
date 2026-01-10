import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import DisasterAlert from '@/models/DisasterAlert';
import User from '@/models/User';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
  try {
    await dbConnect();
    const activeAlert = await DisasterAlert.findOne({ isActive: true }).sort({ createdAt: -1 });
    return NextResponse.json({ activeAlert: activeAlert || null });
  } catch (error) {
    console.error('Error fetching disaster alert:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const data = await req.json();

    // If we are creating a new alert, deactivate all previous ones
    if (data.action === 'create') {
      await DisasterAlert.updateMany({}, { isActive: false });
      
      const newAlert = await DisasterAlert.create({
        title: data.title,
        description: data.description,
        location: data.location,
        radius: data.radius,
        requiredBloodGroups: data.requiredBloodGroups,
        isActive: true,
        createdBy: session.user.id // Assuming session has id, if not we might need to fetch user
      });

      // Broadcast disaster alert to eligible donors via email
      try {
        const eligibleDonors = await User.find({
          role: 'donor',
          isAvailable: true,
          bloodGroup: { $in: data.requiredBloodGroups || [] }
        }).select('email name bloodGroup');

        // Import email utility dynamically to avoid issues
        const { sendEmail } = await import('@/lib/email');
        
        // Send emails to eligible donors (batch processing)
        const emailPromises = eligibleDonors.slice(0, 50).map((donor: any) =>
          sendEmail(
            donor.email,
            `🚨 URGENT: ${newAlert.title}`,
            `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #dc2626, #b91c1c); padding: 20px; text-align: center;">
                  <h1 style="color: white; margin: 0;">🚨 Emergency Blood Alert</h1>
                </div>
                <div style="padding: 20px; background: #fff;">
                  <h2 style="color: #dc2626;">${newAlert.title}</h2>
                  <p style="color: #374151; font-size: 16px;">${newAlert.description}</p>
                  <p style="color: #6b7280;"><strong>Location:</strong> ${newAlert.location}</p>
                  <p style="color: #6b7280;"><strong>Your Blood Type (${donor.bloodGroup}) is urgently needed!</strong></p>
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.NEXTAUTH_URL}/donate" 
                       style="background: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                      Respond to Emergency
                    </a>
                  </div>
                  <p style="color: #9ca3af; font-size: 12px;">Thank you for being a lifesaver, ${donor.name}!</p>
                </div>
              </div>
            `
          ).catch((err: any) => console.error('Failed to send to:', donor.email, err))
        );

        await Promise.allSettled(emailPromises);
        console.log(`BROADCAST SENT to ${eligibleDonors.length} donors for: ${newAlert.title}`);
      } catch (broadcastError) {
        console.error('Broadcast error:', broadcastError);
        // Don't fail the request if broadcast fails
      }

      return NextResponse.json({ alert: newAlert });
    } 
    
    // If we are resolving the alert
    if (data.action === 'resolve') {
      await DisasterAlert.updateMany({}, { isActive: false });
      return NextResponse.json({ message: 'All alerts resolved' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Error managing disaster alert:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
