import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import Reminder from '@/models/Reminder';
import Appointment from '@/models/Appointment';
import User from '@/models/User';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { sendEmail } from '@/lib/email';

// Calculate next eligible donation date (56 days from last donation)
function getNextEligibleDate(lastDonationDate: Date): Date {
  const nextDate = new Date(lastDonationDate);
  nextDate.setDate(nextDate.getDate() + 56);
  return nextDate;
}

// GET - Get user's reminders
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const query: any = { userId: session.user.id };
    if (status) query.status = status;

    const reminders = await Reminder.find(query)
      .sort({ scheduledFor: 1 })
      .limit(20);

    // Also calculate when user can donate next
    const lastDonation = await Appointment.findOne({
      donor: session.user.id,
      status: 'completed',
    }).sort({ date: -1 });

    let nextEligibleDate = null;
    let daysUntilEligible = 0;

    if (lastDonation) {
      nextEligibleDate = getNextEligibleDate(new Date(lastDonation.date));
      daysUntilEligible = Math.max(
        0,
        Math.ceil((nextEligibleDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      );
    }

    return NextResponse.json({
      reminders,
      eligibility: {
        lastDonation: lastDonation?.date || null,
        nextEligibleDate,
        daysUntilEligible,
        canDonateNow: daysUntilEligible <= 0,
      },
    });
  } catch (error) {
    console.error('Error fetching reminders:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST - Create a reminder or update preferences
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const data = await req.json();

    if (data.action === 'setup_donation_reminder') {
      // Find last completed donation
      const lastDonation = await Appointment.findOne({
        donor: session.user.id,
        status: 'completed',
      }).sort({ date: -1 });

      if (lastDonation) {
        const nextEligibleDate = getNextEligibleDate(new Date(lastDonation.date));
        
        // Create reminder for 3 days before eligible
        const reminderDate = new Date(nextEligibleDate);
        reminderDate.setDate(reminderDate.getDate() - 3);

        // Check if reminder already exists
        const existing = await Reminder.findOne({
          userId: session.user.id,
          type: 'donation_due',
          scheduledFor: { $gte: new Date() },
          status: 'pending',
        });

        if (!existing) {
          await Reminder.create({
            userId: session.user.id,
            type: 'donation_due',
            title: 'Time to Donate Again! 🩸',
            message: `You're now eligible to donate blood again. Your last donation was on ${new Date(lastDonation.date).toLocaleDateString()}. Schedule your next appointment today!`,
            scheduledFor: reminderDate,
            channel: data.channel || 'email',
          });
        }
      }

      return NextResponse.json({ success: true, message: 'Donation reminder set up' });
    }

    if (data.action === 'create_appointment_reminder') {
      const { appointmentId, reminderTime } = data;
      
      const appointment = await Appointment.findById(appointmentId).populate('bloodBank');
      if (!appointment) {
        return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
      }

      const reminderDate = new Date(appointment.date);
      reminderDate.setHours(reminderDate.getHours() - (reminderTime || 24));

      await Reminder.create({
        userId: session.user.id,
        type: 'appointment_reminder',
        title: 'Donation Appointment Tomorrow 📅',
        message: `Don't forget your blood donation appointment at ${appointment.bloodBank?.name || 'Blood Bank'} on ${new Date(appointment.date).toLocaleDateString()} at ${appointment.timeSlot}.`,
        scheduledFor: reminderDate,
        channel: data.channel || 'email',
        metadata: { appointmentId },
      });

      return NextResponse.json({ success: true, message: 'Appointment reminder created' });
    }

    if (data.action === 'create_post_donation_reminder') {
      // Create reminders for post-donation care
      const reminders = [
        {
          delay: 0, // Immediately
          title: 'Post-Donation Care Tips 💪',
          message: 'Thank you for donating! Remember to: 1) Rest for 15 minutes 2) Drink plenty of fluids 3) Avoid heavy exercise today 4) Eat iron-rich foods',
        },
        {
          delay: 24 * 60 * 60 * 1000, // 24 hours
          title: 'How are you feeling? 🩺',
          message: 'It\'s been 24 hours since your donation. Make sure you\'re drinking enough water and eating well. If you feel dizzy or unwell, please rest.',
        },
        {
          delay: 7 * 24 * 60 * 60 * 1000, // 1 week
          title: 'Your Blood is Saving Lives! ❤️',
          message: 'Your donated blood has likely already been processed and may have helped save up to 3 lives! Thank you for being a hero.',
        },
      ];

      for (const reminder of reminders) {
        await Reminder.create({
          userId: session.user.id,
          type: 'post_donation_care',
          title: reminder.title,
          message: reminder.message,
          scheduledFor: new Date(Date.now() + reminder.delay),
          channel: 'in_app',
        });
      }

      return NextResponse.json({ success: true, message: 'Post-donation reminders created' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error creating reminder:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE - Cancel a reminder
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const reminderId = searchParams.get('id');

    if (!reminderId) {
      return NextResponse.json({ error: 'Reminder ID required' }, { status: 400 });
    }

    const reminder = await Reminder.findOne({
      _id: reminderId,
      userId: session.user.id,
    });

    if (!reminder) {
      return NextResponse.json({ error: 'Reminder not found' }, { status: 404 });
    }

    reminder.status = 'cancelled';
    await reminder.save();

    return NextResponse.json({ success: true, message: 'Reminder cancelled' });
  } catch (error) {
    console.error('Error cancelling reminder:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
