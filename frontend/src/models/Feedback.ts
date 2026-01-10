import mongoose, { Schema, model, models } from 'mongoose';

const FeedbackSchema = new Schema({
  donor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  appointment: { type: Schema.Types.ObjectId, ref: 'Appointment', required: true },
  rating: { 
    type: Number, 
    required: true,
    min: 1,
    max: 5
  },
  experience: {
    type: String,
    enum: ['excellent', 'good', 'average', 'poor'],
    required: true
  },
  staffBehavior: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  cleanliness: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  waitTime: {
    type: String,
    enum: ['less_than_15', '15_to_30', '30_to_60', 'more_than_60'],
    required: true
  },
  wouldRecommend: {
    type: Boolean,
    required: true
  },
  comments: { type: String },
  suggestions: { type: String },
  createdAt: { type: Date, default: Date.now },
});

// Ensure one feedback per appointment
FeedbackSchema.index({ appointment: 1 }, { unique: true });

const Feedback = (models.Feedback || model('Feedback', FeedbackSchema)) as mongoose.Model<any>;

export default Feedback;
