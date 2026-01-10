import mongoose from 'mongoose';

const ReminderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['donation_due', 'appointment_reminder', 'post_donation_care', 'eligibility_restored', 'campaign'],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  scheduledFor: {
    type: Date,
    required: true,
  },
  sentAt: {
    type: Date,
    default: null,
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'failed', 'cancelled'],
    default: 'pending',
  },
  channel: {
    type: String,
    enum: ['email', 'push', 'sms', 'in_app'],
    default: 'email',
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for efficient querying of pending reminders
ReminderSchema.index({ status: 1, scheduledFor: 1 });
ReminderSchema.index({ userId: 1, type: 1 });

export default (mongoose.models.Reminder || mongoose.model('Reminder', ReminderSchema)) as mongoose.Model<any>;
