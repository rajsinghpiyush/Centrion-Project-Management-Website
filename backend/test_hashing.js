import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './model/userModel.js';

dotenv.config();

const testHashing = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/task-management-website');
        console.log('Connected to MongoDB');

        // Clean up test user
        await User.deleteMany({ email: 'doublehash@test.com' });

        const password = 'TestPassword123!';

        // 1. Create user (should hash password once)
        const user = await User.create({ name: 'Test', email: 'doublehash@test.com', password, authProvider: 'local' });
        const hash1 = user.password;
        console.log('Hash after create:', hash1);

        // 2. Modify something else and save
        user.name = 'Test Modified';
        await user.save({ validateBeforeSave: false });
        const hash2 = user.password;
        console.log('Hash after second save:', hash2);

        if (hash1 === hash2) {
            console.log('SUCCESS: Hash did not change.');
        } else {
            console.log('FAILURE: Hash changed! Double hashing detected.');
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

testHashing();
