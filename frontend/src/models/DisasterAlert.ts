import mongoose from 'mongoose';

const DisasterAlertSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  radius: {
    type: Number, // in kilometers
    default: 10,
  },
  requiredBloodGroups: [{
    type: String,
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }
});

export default (mongoose.models.DisasterAlert || mongoose.model('DisasterAlert', DisasterAlertSchema)) as mongoose.Model<any>;
