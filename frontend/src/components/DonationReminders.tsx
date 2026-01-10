"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellOff, Calendar, Clock, Check, X, AlertCircle, Droplet } from 'lucide-react';

interface Reminder {
  _id: string;
  type: string;
  title: string;
  message: string;
  scheduledFor: string;
  status: string;
}

interface Eligibility {
  lastDonation: string | null;
  nextEligibleDate: string | null;
  daysUntilEligible: number;
  canDonateNow: boolean;
}

export default function DonationReminders() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [eligibility, setEligibility] = useState<Eligibility | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [reminderPrefs, setReminderPrefs] = useState({
    donationDue: true,
    appointmentReminder: true,
    postDonationCare: true,
  });

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    try {
      const res = await fetch('/api/reminders');
      if (res.ok) {
        const data = await res.json();
        setReminders(data.reminders || []);
        setEligibility(data.eligibility);
      }
    } catch (error) {
      console.error('Error fetching reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupDonationReminder = async () => {
    try {
      const res = await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'setup_donation_reminder' }),
      });
      if (res.ok) {
        fetchReminders();
      }
    } catch (error) {
      console.error('Error setting up reminder:', error);
    }
  };

  const cancelReminder = async (id: string) => {
    try {
      const res = await fetch(`/api/reminders?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchReminders();
      }
    } catch (error) {
      console.error('Error cancelling reminder:', error);
    }
  };

  const pendingReminders = reminders.filter(r => r.status === 'pending');
  const pastReminders = reminders.filter(r => r.status === 'sent');

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Bell className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">My Donation Reminders</h2>
              <p className="text-sm text-gray-500">Stay on track with your donations</p>
            </div>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Bell className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Eligibility Status */}
      {eligibility && (
        <div className={`p-4 ${eligibility.canDonateNow ? 'bg-green-50' : 'bg-amber-50'}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${eligibility.canDonateNow ? 'bg-green-100' : 'bg-amber-100'}`}>
              <Droplet className={`w-5 h-5 ${eligibility.canDonateNow ? 'text-green-600' : 'text-amber-600'}`} />
            </div>
            <div className="flex-1">
              {eligibility.canDonateNow ? (
                <>
                  <p className="font-medium text-green-800">You're eligible to donate!</p>
                  <p className="text-sm text-green-600">
                    {eligibility.lastDonation 
                      ? `Last donation: ${new Date(eligibility.lastDonation).toLocaleDateString()}`
                      : 'Ready for your first donation'}
                  </p>
                </>
              ) : (
                <>
                  <p className="font-medium text-amber-800">
                    {eligibility.daysUntilEligible} days until you can donate
                  </p>
                  <p className="text-sm text-amber-600">
                    Eligible on: {eligibility.nextEligibleDate 
                      ? new Date(eligibility.nextEligibleDate).toLocaleDateString()
                      : 'N/A'}
                  </p>
                </>
              )}
            </div>
            {eligibility.canDonateNow && (
              <a
                href="/donate"
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
              >
                Donate Now
              </a>
            )}
          </div>
        </div>
      )}

      {/* Countdown Timer (if not eligible) */}
      {eligibility && !eligibility.canDonateNow && eligibility.daysUntilEligible > 0 && (
        <div className="p-6 border-b border-gray-100">
          <div className="text-center">
            <div className="text-5xl font-bold text-gray-900 mb-2">
              {eligibility.daysUntilEligible}
            </div>
            <div className="text-gray-500">days remaining</div>
          </div>
          <div className="mt-4">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, ((56 - eligibility.daysUntilEligible) / 56) * 100)}%` }}
                transition={{ duration: 1 }}
                className="h-full bg-red-600"
              />
            </div>
          </div>
          {!pendingReminders.some(r => r.type === 'donation_due') && (
            <button
              onClick={setupDonationReminder}
              className="mt-4 w-full py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 flex items-center justify-center gap-2"
            >
              <Bell className="w-4 h-4" />
              Remind me when I can donate
            </button>
          )}
        </div>
      )}

      {/* Pending Reminders */}
      {pendingReminders.length > 0 && (
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wider">
            Upcoming Reminders
          </h3>
          <div className="space-y-3">
            {pendingReminders.map((reminder) => (
              <motion.div
                key={reminder._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <Calendar className="w-4 h-4 text-red-500" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{reminder.title}</p>
                  <p className="text-sm text-gray-500 mt-1">{reminder.message}</p>
                  <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(reminder.scheduledFor).toLocaleDateString()} at{' '}
                    {new Date(reminder.scheduledFor).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <button
                  onClick={() => cancelReminder(reminder._id)}
                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                  title="Cancel reminder"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* No Reminders State */}
      {pendingReminders.length === 0 && (
        <div className="p-8 text-center">
          <BellOff className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No upcoming reminders</p>
          <p className="text-sm text-gray-400 mt-1">
            We'll remind you when it's time to donate again
          </p>
        </div>
      )}

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-gray-100 overflow-hidden"
          >
            <div className="p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wider">
                Notification Preferences
              </h3>
              <div className="space-y-3">
                {[
                  { key: 'donationDue', label: 'Donation eligibility reminders', desc: 'Get notified when you can donate again' },
                  { key: 'appointmentReminder', label: 'Appointment reminders', desc: '24 hours before your scheduled donation' },
                  { key: 'postDonationCare', label: 'Post-donation care tips', desc: 'Helpful tips after you donate' },
                ].map((pref) => (
                  <label
                    key={pref.key}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{pref.label}</p>
                      <p className="text-sm text-gray-500">{pref.desc}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={reminderPrefs[pref.key as keyof typeof reminderPrefs]}
                      onChange={(e) => setReminderPrefs({ ...reminderPrefs, [pref.key]: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                  </label>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
