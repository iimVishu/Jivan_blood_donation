import mongoose, { Schema, model, models } from 'mongoose';

const AppointmentSchema = new Schema({
  donor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  bloodBank: { type: Schema.Types.ObjectId, ref: 'BloodBank', required: true },
  date: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'completed', 'cancelled'], 
    default: 'pending' 
  },
  trackingStatus: {
    type: String,
    enum: ['collected', 'testing', 'processing', 'ready', 'transfused'],
    default: 'collected'
  },
  notes: { type: String },
  healthStats: {
    bloodPressure: { type: String },
    hemoglobin: { type: String },
    weight: { type: String },
    pulse: { type: String },
    temperature: { type: String },
  },
  feedbackSubmitted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const Appointment = (models.Appointment || model('Appointment', AppointmentSchema)) as mongoose.Model<any>;

export default Appointment;
