import mongoose from 'mongoose';

const BadgeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  badgeType: {
    type: String,
    enum: [
      'first_donation',
      'five_donations',
      'ten_donations',
      'twenty_five_donations',
      'fifty_donations',
      'hundred_donations',
      'rare_blood_hero',
      'emergency_responder',
      'streak_3_months',
      'streak_6_months',
      'streak_1_year',
      'camp_organizer',
      'referral_champion',
      'life_saver',
      'plasma_donor',
      'platelet_donor',
      'weekend_warrior',
      'early_bird',
      'community_leader',
    ],
    required: true,
  },
  earnedAt: {
    type: Date,
    default: Date.now,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
});

// Ensure unique badge per user
BadgeSchema.index({ userId: 1, badgeType: 1 }, { unique: true });

export const BadgeInfo: Record<string, { name: string; description: string; icon: string; color: string; points: number }> = {
  first_donation: {
    name: 'First Drop',
    description: 'Completed your first blood donation',
    icon: '🩸',
    color: 'bg-red-500',
    points: 100,
  },
  five_donations: {
    name: 'Regular Donor',
    description: 'Donated blood 5 times',
    icon: '⭐',
    color: 'bg-yellow-500',
    points: 250,
  },
  ten_donations: {
    name: 'Dedicated Donor',
    description: 'Donated blood 10 times',
    icon: '🌟',
    color: 'bg-orange-500',
    points: 500,
  },
  twenty_five_donations: {
    name: 'Silver Heart',
    description: 'Donated blood 25 times',
    icon: '🥈',
    color: 'bg-gray-400',
    points: 1000,
  },
  fifty_donations: {
    name: 'Golden Heart',
    description: 'Donated blood 50 times',
    icon: '🥇',
    color: 'bg-yellow-400',
    points: 2500,
  },
  hundred_donations: {
    name: 'Platinum Legend',
    description: 'Donated blood 100 times',
    icon: '💎',
    color: 'bg-purple-500',
    points: 5000,
  },
  rare_blood_hero: {
    name: 'Rare Blood Hero',
    description: 'Donated rare blood type (AB-, B-, O-)',
    icon: '🦸',
    color: 'bg-indigo-500',
    points: 300,
  },
  emergency_responder: {
    name: 'Emergency Responder',
    description: 'Responded to an emergency blood request',
    icon: '🚨',
    color: 'bg-red-600',
    points: 400,
  },
  streak_3_months: {
    name: '3 Month Streak',
    description: 'Donated every 3 months for a year',
    icon: '🔥',
    color: 'bg-orange-600',
    points: 600,
  },
  streak_6_months: {
    name: '6 Month Streak',
    description: 'Maintained regular donations for 6 months',
    icon: '💪',
    color: 'bg-green-500',
    points: 400,
  },
  streak_1_year: {
    name: 'Year of Giving',
    description: 'Active donor for 1 full year',
    icon: '🏆',
    color: 'bg-amber-500',
    points: 1000,
  },
  camp_organizer: {
    name: 'Camp Organizer',
    description: 'Organized a blood donation camp',
    icon: '🎪',
    color: 'bg-blue-500',
    points: 500,
  },
  referral_champion: {
    name: 'Referral Champion',
    description: 'Referred 5 new donors',
    icon: '👥',
    color: 'bg-teal-500',
    points: 350,
  },
  life_saver: {
    name: 'Life Saver',
    description: 'Your blood directly saved a life',
    icon: '❤️‍🩹',
    color: 'bg-pink-500',
    points: 500,
  },
  plasma_donor: {
    name: 'Plasma Pioneer',
    description: 'Donated plasma',
    icon: '💛',
    color: 'bg-yellow-300',
    points: 300,
  },
  platelet_donor: {
    name: 'Platelet Pro',
    description: 'Donated platelets',
    icon: '🧬',
    color: 'bg-cyan-500',
    points: 300,
  },
  weekend_warrior: {
    name: 'Weekend Warrior',
    description: 'Donated on weekends 5 times',
    icon: '🌅',
    color: 'bg-rose-500',
    points: 200,
  },
  early_bird: {
    name: 'Early Bird',
    description: 'Donated before 9 AM 3 times',
    icon: '🌅',
    color: 'bg-sky-500',
    points: 150,
  },
  community_leader: {
    name: 'Community Leader',
    description: 'Top donor in your city',
    icon: '👑',
    color: 'bg-violet-500',
    points: 1000,
  },
};

export default (mongoose.models.Badge || mongoose.model('Badge', BadgeSchema)) as mongoose.Model<any>;
