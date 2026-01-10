import mongoose from 'mongoose';
// import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const MONGODB_URI = "mongodb+srv://vishal14142004_db_user:JqAsi3ATsxerBXGu@cluster0.kovkqdt.mongodb.net/blood-donation?appName=Cluster0";

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

    const email = 'admin@jeevan.com';
    const password = 'admin'; // Simple password for testing
    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.log('User already exists. Updating password...');
      existingUser.password = hashedPassword;
      existingUser.role = 'admin';
      existingUser.isVerified = true;
      await existingUser.save();
      console.log('User updated successfully.');
    } else {
      console.log('Creating new admin user...');
      await User.create({
        name: 'Super Admin',
        email,
        password: hashedPassword,
        role: 'admin',
        isVerified: true,
        bloodGroup: 'O+',
        phone: '1234567890',
        address: 'Admin HQ'
      });
      console.log('User created successfully.');
    }
    
    console.log(`\nLogin Credentials:\nEmail: ${email}\nPassword: ${password}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

createAdmin();
