import mongoose, { Schema, model, models } from 'mongoose';

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true }, // Hashed
  role: { 
    type: String, 
    enum: ['donor', 'recipient', 'admin', 'hospital'], 
    default: 'donor' 
  },
  provider: { type: String, default: 'credentials' },
  phone: { type: String },
  bloodGroup: { 
    type: String, 
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] 
  },
  address: { type: String },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number], // [longitude, latitude]
  },
  // Donor specific fields
  isAvailable: { type: Boolean, default: true },
  lastDonationDate: { type: Date },
  healthConditions: { type: String },
  donationCount: { type: Number, default: 0 },
  points: { type: Number, default: 0 },
  
  // Hospital specific fields (if role is hospital, link to BloodBank or store details here)
  hospitalIds: [{ type: Schema.Types.ObjectId, ref: 'BloodBank' }],
  // Legacy field support (optional, can be removed if migration is done)
  hospitalId: { type: Schema.Types.ObjectId, ref: 'BloodBank' },

  // Auth fields
  isVerified: { type: Boolean, default: false },
  otp: { type: String },
  otpExpiry: { type: Date },

  createdAt: { type: Date, default: Date.now },
});

UserSchema.index({ location: '2dsphere' });

// Prevent Mongoose OverwriteModelError and ensure schema updates in dev
if (process.env.NODE_ENV === 'development') {
  delete models.User;
}

const User = (models.User || model('User', UserSchema)) as mongoose.Model<any>;

export default User;
