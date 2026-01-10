"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Lock, Sparkles, X } from 'lucide-react';

interface Badge {
  type: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  points: number;
  earned: boolean;
  earnedAt?: string;
}

interface BadgesDisplayProps {
  userId?: string;
  showAll?: boolean;
  compact?: boolean;
}

export default function BadgesDisplay({ userId, showAll = false, compact = false }: BadgesDisplayProps) {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [newBadges, setNewBadges] = useState<Badge[]>([]);
  const [showNewBadgeModal, setShowNewBadgeModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBadges();
  }, [userId]);

  const fetchBadges = async () => {
    try {
      const url = userId ? `/api/badges?userId=${userId}` : '/api/badges';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setBadges(data.allBadges || []);
        setTotalPoints(data.totalPoints || 0);
        
        if (data.newBadges?.length > 0) {
          setNewBadges(data.newBadges);
          setShowNewBadgeModal(true);
        }
      }
    } catch (error) {
      console.error('Error fetching badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const earnedBadges = badges.filter(b => b.earned);
  const lockedBadges = badges.filter(b => !b.earned);
  const displayBadges = showAll ? badges : earnedBadges;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {earnedBadges.slice(0, 5).map((badge) => (
          <motion.div
            key={badge.type}
            whileHover={{ scale: 1.1 }}
            className={`w-10 h-10 ${badge.color} rounded-full flex items-center justify-center text-lg shadow-lg cursor-pointer`}
            title={`${badge.name}: ${badge.description}`}
          >
            {badge.icon}
          </motion.div>
        ))}
        {earnedBadges.length > 5 && (
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-sm font-bold text-gray-600">
            +{earnedBadges.length - 5}
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      {/* New Badge Celebration Modal */}
      <AnimatePresence>
        {showNewBadgeModal && newBadges.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
            onClick={() => setShowNewBadgeModal(false)}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full text-center relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowNewBadgeModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
              
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-6xl mb-4"
              >
                🎉
              </motion.div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                New Badge Unlocked!
              </h2>
              
              <div className="space-y-4 mt-6">
                {newBadges.map((badge, index) => (
                  <motion.div
                    key={badge.type}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: index * 0.2 }}
                    className={`${badge.color} rounded-xl p-4 text-white`}
                  >
                    <div className="text-4xl mb-2">{badge.icon}</div>
                    <h3 className="text-xl font-bold">{badge.name}</h3>
                    <p className="text-sm opacity-90">{badge.description}</p>
                    <div className="mt-2 flex items-center justify-center gap-1">
                      <Sparkles className="w-4 h-4" />
                      <span className="font-bold">+{badge.points} points</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Badges Display */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Award className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Achievements & Badges</h2>
              <p className="text-sm text-gray-500">
                {earnedBadges.length} of {badges.length} badges earned
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-amber-600">{totalPoints}</div>
            <div className="text-sm text-gray-500">Total Points</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(earnedBadges.length / badges.length) * 100}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-amber-400 to-amber-600"
            />
          </div>
        </div>

        {/* Earned Badges */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">
            Earned Badges
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
            {earnedBadges.map((badge) => (
              <motion.div
                key={badge.type}
                whileHover={{ scale: 1.05, y: -5 }}
                className="group relative"
              >
                <div className={`${badge.color} rounded-xl p-4 text-center shadow-lg cursor-pointer`}>
                  <div className="text-3xl mb-1">{badge.icon}</div>
                  <div className="text-xs font-medium text-white truncate">{badge.name}</div>
                </div>
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                  <div className="font-bold">{badge.name}</div>
                  <div className="text-gray-300">{badge.description}</div>
                  <div className="text-amber-400 mt-1">+{badge.points} pts</div>
                  {badge.earnedAt && (
                    <div className="text-gray-400 text-[10px] mt-1">
                      Earned: {new Date(badge.earnedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            {earnedBadges.length === 0 && (
              <div className="col-span-full text-center text-gray-500 py-8">
                No badges earned yet. Start donating to unlock achievements!
              </div>
            )}
          </div>
        </div>

        {/* Locked Badges */}
        {showAll && lockedBadges.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Locked Badges
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
              {lockedBadges.map((badge) => (
                <motion.div
                  key={badge.type}
                  whileHover={{ scale: 1.05 }}
                  className="group relative"
                >
                  <div className="bg-gray-200 rounded-xl p-4 text-center cursor-pointer opacity-60">
                    <div className="text-3xl mb-1 grayscale">{badge.icon}</div>
                    <div className="text-xs font-medium text-gray-500 truncate">{badge.name}</div>
                    <Lock className="w-4 h-4 text-gray-400 mx-auto mt-1" />
                  </div>
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                    <div className="font-bold">{badge.name}</div>
                    <div className="text-gray-300">{badge.description}</div>
                    <div className="text-amber-400 mt-1">+{badge.points} pts</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
