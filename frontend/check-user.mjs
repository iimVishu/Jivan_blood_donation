import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

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
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function checkUser() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const email = process.argv[2];

    if (!email) {
      console.error('\n❌ Please provide an email address to check.');
      console.log('Usage: node check-user.mjs <email>\n');
      process.exit(1);
    }

    const user = await User.findOne({ email });

    if (user) {
      console.log('\n✅ User found:');
      console.log('Email:', user.email);
      console.log('Role:', user.role);
      console.log('Is Verified:', user.isVerified);
      console.log('Password Hash:', user.password ? 'Exists' : 'Missing', '\n');
    } else {
      console.log(`\n❌ User with email "${email}" not found.\n`);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkUser();
