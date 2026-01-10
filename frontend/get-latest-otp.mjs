import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb://localhost:27017/blood-donation';

async function getLatestOtp() {
  try {
    await mongoose.connect(MONGODB_URI);
    
    // Define a minimal schema just to read the data
    const UserSchema = new mongoose.Schema({
      email: String,
      otp: String,
      createdAt: Date
    });
    
    // Use the existing collection 'users'
    const User = mongoose.models.User || mongoose.model('User', UserSchema);
    
    const users = await User.find({}).sort({ createdAt: -1 });
    
    console.log(`Found ${users.length} users.`);
    
    users.forEach(user => {
        console.log(`- ${user.email} (Verified: ${user.isVerified}, OTP: ${user.otp || 'None'})`);
    });
    
    const userWithOtp = users.find(u => u.otp);
    
    if (userWithOtp) {
      console.log('\n==================================================');
      console.log(`📧 Email: ${userWithOtp.email}`);
      console.log(`🔑 OTP:   ${userWithOtp.otp}`);
      console.log('==================================================\n');
    } else {
      console.log('\nNo users with active OTP found.');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

getLatestOtp();
