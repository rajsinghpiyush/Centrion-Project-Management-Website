import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './model/userModel.js';
import fs from 'fs';

dotenv.config();

const debugUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/task-management-website');
        console.log('Connected to MongoDB');

        const users = await User.find({}).select('+password');
        let output = `Found ${users.length} users:\n`;
        users.forEach(u => {
            output += `- Name: ${u.name}, Email: ${u.email}, Provider: ${u.authProvider}, HasPassword: ${!!u.password}, IsActive: ${u.isActive}\n`;
        });

        fs.writeFileSync('users_debug.txt', output);
        console.log('Output written to users_debug.txt');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

debugUsers();
