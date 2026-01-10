import mongoose, { Schema, model, models } from 'mongoose';

const VolunteerSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  reason: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  createdAt: { type: Date, default: Date.now },
});

const Volunteer = (models.Volunteer || model('Volunteer', VolunteerSchema)) as mongoose.Model<any>;

export default Volunteer;
