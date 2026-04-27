import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Please define the MONGODB_URI environment variable inside .env.local');
  process.exit(1);
}

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  isVerified: Boolean,
  bloodGroup: String,
  phone: String,
  address: String,
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function createAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get credentials from environment variables or command line arguments
    const email = process.env.ADMIN_EMAIL || process.argv[2];
    const password = process.env.ADMIN_PASSWORD || process.argv[3];

    if (!email || !password) {
      console.error('\n❌ Please provide email and password.');
      console.log('Usage: node create-admin.mjs <email> <password>');
      console.log('Or set ADMIN_EMAIL and ADMIN_PASSWORD in .env.local\n');
      process.exit(1);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.log(`User ${email} already exists. Updating password and ensuring admin role...`);
      existingUser.password = hashedPassword;
      existingUser.role = 'admin';
      existingUser.isVerified = true;
      await existingUser.save();
      console.log('Admin user updated successfully.');
    } else {
      console.log(`Creating new admin user: ${email}...`);
      await User.create({
        name: 'Admin',
        email,
        password: hashedPassword,
        role: 'admin',
        isVerified: true,
        bloodGroup: 'O+',
        phone: '1234567890',
        address: 'Admin HQ'
      });
      console.log('Admin user created successfully.');
    }
    
    console.log(`\n✅ Success! You can now login with:\nEmail: ${email}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

createAdmin();
