import mongoose, { Schema, model, models } from 'mongoose';

const BloodBankSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  address: {
    street: String,
    city: String,
    state: String,
    zip: String,
  },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number], // [longitude, latitude]
  },
  stock: {
    'A+': { type: Number, default: 0 },
    'A-': { type: Number, default: 0 },
    'B+': { type: Number, default: 0 },
    'B-': { type: Number, default: 0 },
    'AB+': { type: Number, default: 0 },
    'AB-': { type: Number, default: 0 },
    'O+': { type: Number, default: 0 },
    'O-': { type: Number, default: 0 },
  },
  admins: [{ type: Schema.Types.ObjectId, ref: 'User' }], // Users who manage this bank
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Out of Stock'],
    default: 'Active'
  },
  createdAt: { type: Date, default: Date.now },
});

BloodBankSchema.index({ location: '2dsphere' });

const BloodBank = (models.BloodBank || model('BloodBank', BloodBankSchema)) as mongoose.Model<any>;

export default BloodBank;
