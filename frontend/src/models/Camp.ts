import mongoose, { Schema, model, models } from 'mongoose';

const CampSchema = new Schema({
  organizerName: { type: String, required: true },
  organizationName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  expectedDonors: { type: Number, required: true },
  proposedDate: { type: Date, required: true },
  venue: { type: String, required: true },
  city: { type: String, required: true },
  message: { type: String },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected', 'completed'], 
    default: 'pending' 
  },
  createdAt: { type: Date, default: Date.now },
});

const Camp = (models.Camp || model('Camp', CampSchema)) as mongoose.Model<any>;

export default Camp;
