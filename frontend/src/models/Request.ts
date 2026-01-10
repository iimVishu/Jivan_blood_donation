import mongoose, { Schema, model, models } from 'mongoose';

const RequestSchema = new Schema({
  requester: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  patientName: { type: String, required: true },
  bloodGroup: { 
    type: String, 
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: true
  },
  units: { type: Number, required: true },
  hospitalName: { type: String }, // Where the patient is admitted
  contactNumber: { type: String },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number],
  },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'fulfilled', 'rejected'], 
    default: 'pending' 
  },
  urgency: { 
    type: String, 
    enum: ['normal', 'urgent', 'critical', 'emergency'], 
    default: 'normal' 
  },
  fulfilledBy: { type: Schema.Types.ObjectId, ref: 'BloodBank' }, // Or Donor
  createdAt: { type: Date, default: Date.now },
});

const Request = (models.Request || model('Request', RequestSchema)) as mongoose.Model<any>;

export default Request;
