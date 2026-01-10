import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import Badge, { BadgeInfo } from '@/models/Badge';
import Appointment from '@/models/Appointment';
import User from '@/models/User';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Check and award badges based on user activity
async function checkAndAwardBadges(userId: string) {
  await dbConnect();
  
  const user = await User.findById(userId);
  if (!user) return [];

  const completedDonations = await Appointment.countDocuments({
    donor: userId,
    status: 'completed',
  });

  const newBadges: string[] = [];

  // Donation count badges
  const donationBadges = [
    { count: 1, type: 'first_donation' },
    { count: 5, type: 'five_donations' },
    { count: 10, type: 'ten_donations' },
    { count: 25, type: 'twenty_five_donations' },
    { count: 50, type: 'fifty_donations' },
    { count: 100, type: 'hundred_donations' },
  ];

  for (const badge of donationBadges) {
    if (completedDonations >= badge.count) {
      const existing = await Badge.findOne({ userId, badgeType: badge.type });
      if (!existing) {
        await Badge.create({ userId, badgeType: badge.type });
        newBadges.push(badge.type);
      }
    }
  }

  // Rare blood type badge
  const rareBloodTypes = ['AB-', 'B-', 'O-'];
  if (rareBloodTypes.includes(user.bloodType) && completedDonations >= 1) {
    const existing = await Badge.findOne({ userId, badgeType: 'rare_blood_hero' });
    if (!existing) {
      await Badge.create({ userId, badgeType: 'rare_blood_hero' });
      newBadges.push('rare_blood_hero');
    }
  }

  // Weekend warrior badge
  const weekendDonations = await Appointment.countDocuments({
    donor: userId,
    status: 'completed',
    date: { $exists: true },
  }).then(async () => {
    const appointments = await Appointment.find({ donor: userId, status: 'completed' });
    return appointments.filter(apt => {
      const day = new Date(apt.date).getDay();
      return day === 0 || day === 6;
    }).length;
  });

  if (weekendDonations >= 5) {
    const existing = await Badge.findOne({ userId, badgeType: 'weekend_warrior' });
    if (!existing) {
      await Badge.create({ userId, badgeType: 'weekend_warrior' });
      newBadges.push('weekend_warrior');
    }
  }

  return newBadges;
}

// GET user badges
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || session.user.id;

    // Check for new badges
    const newBadges = await checkAndAwardBadges(userId);

    // Get all badges for user
    const userBadges = await Badge.find({ userId }).sort({ earnedAt: -1 });

    // Map to include badge info
    const badgesWithInfo = userBadges.map(badge => ({
      ...badge.toObject(),
      info: BadgeInfo[badge.badgeType],
    }));

    // Calculate total points
    const totalPoints = badgesWithInfo.reduce((sum, badge) => sum + (badge.info?.points || 0), 0);

    // Get all possible badges
    const allBadges = Object.entries(BadgeInfo).map(([type, info]) => ({
      type,
      ...info,
      earned: userBadges.some(b => b.badgeType === type),
      earnedAt: userBadges.find(b => b.badgeType === type)?.earnedAt,
    }));

    return NextResponse.json({
      badges: badgesWithInfo,
      allBadges,
      totalPoints,
      newBadges: newBadges.map(type => ({ type, ...BadgeInfo[type] })),
    });
  } catch (error) {
    console.error('Error fetching badges:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST - Manually award a badge (admin only)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { userId, badgeType } = await req.json();

    if (!BadgeInfo[badgeType]) {
      return NextResponse.json({ error: 'Invalid badge type' }, { status: 400 });
    }

    const existing = await Badge.findOne({ userId, badgeType });
    if (existing) {
      return NextResponse.json({ error: 'Badge already awarded' }, { status: 400 });
    }

    const badge = await Badge.create({ userId, badgeType });

    return NextResponse.json({
      badge: {
        ...badge.toObject(),
        info: BadgeInfo[badgeType],
      },
    });
  } catch (error) {
    console.error('Error awarding badge:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
