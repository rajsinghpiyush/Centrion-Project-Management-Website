import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './model/userModel.js';
import fs from 'fs';

dotenv.config();

const checkHashes = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/task-management-website');
        console.log('Connected to MongoDB');

        const users = await User.find({}).select('+password');
        let output = `Checking password hashes for ${users.length} users:\n`;
        users.forEach(u => {
            const isHashed = u.password && (u.password.startsWith('$2a$') || u.password.startsWith('$2b$'));
            output += `- Email: ${u.email}, IsHashed: ${isHashed}, PasswordLength: ${u.password ? u.password.length : 0}\n`;
            if (!isHashed && u.password) {
                output += `  WARNING: Password for ${u.email} is NOT HASHED! Value: ${u.password}\n`;
            }
        });

        fs.writeFileSync('password_debug.txt', output);
        console.log('Output written to password_debug.txt');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkHashes();
