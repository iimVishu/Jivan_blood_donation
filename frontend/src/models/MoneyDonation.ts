import mongoose, { Schema, models, model } from 'mongoose';

const schema = new Schema({
  orderId: { type: String, required: true, unique: true },
  paymentId: String,
  email: { type: String, required: true },
  amount: { type: Number, required: true, min: 5000 },
  currency: { type: String, default: 'INR' },
  status: { type: String, enum: ['pending', 'paid'], default: 'pending' },
  receiptSent: { type: Boolean, default: false },
}, { timestamps: true });

export default (models.MoneyDonation || model('MoneyDonation', schema)) as mongoose.Model<any>;
