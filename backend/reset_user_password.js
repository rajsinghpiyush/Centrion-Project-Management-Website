import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './model/userModel.js';

dotenv.config();

const resetPassword = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/task-management-website');
        console.log('Connected to MongoDB');

        const email = 'rajsinghpiyush3@gmail.com';
        const newPassword = 'Password123!';

        const user = await User.findOne({ email });
        if (!user) {
            console.log('User not found');
            process.exit(1);
        }

        user.password = newPassword;
        await user.save();

        console.log(`Password reset successfully for ${email}`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

resetPassword();
