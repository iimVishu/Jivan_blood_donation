import mongoose from 'mongoose';

const EmergencyAlertSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // Can be anonymous or unauthenticated if needed, but usually authenticated
  },
  location: {
    lat: Number,
    lng: Number,
    address: String,
  },
  status: {
    type: String,
    enum: ['active', 'resolved', 'false_alarm'],
    default: 'active',
  },
  contactNumber: {
    type: String,
  },
  message: {
    type: String,
    default: 'Emergency SOS triggered!',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  resolvedAt: {
    type: Date,
  },
});

export default (mongoose.models.EmergencyAlert || mongoose.model('EmergencyAlert', EmergencyAlertSchema)) as mongoose.Model<any>;
