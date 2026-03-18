import crypto from 'crypto';
import User from '../model/userModel.js';
import { sendTokenResponse, verifyRefreshToken, generateAccessToken } from '../utils/tokenUtils.js';
import {
    sendVerificationEmail,
    sendPasswordResetEmail,
    sendWelcomeEmail,
} from '../utils/emailService.js';

// Custom error handler placeholder
const AppError = (msg, code) => {
    const err = new Error(msg);
    err.statusCode = code;
    return err;
};

export const register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        const user = await User.create({ name, email, password, authProvider: 'local' });
        const verificationToken = user.generateEmailVerificationToken();
        await user.save({ validateBeforeSave: false });

        await sendVerificationEmail({ email: user.email, name: user.name, verificationToken });
        await sendWelcomeEmail({ email: user.email, name: user.name });

        sendTokenResponse(user, 201, res, {
            message: 'Registration successful. Please verify your email.',
        });
    } catch (error) {
        next(error);
    }
};

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }).select('+password');

        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        if (!user.isActive) {
            return res.status(401).json({ success: false, message: 'Account deactivated' });
        }

        sendTokenResponse(user, 200, res, { message: 'Login successful' });
    } catch (error) {
        next(error);
    }
};

export const logout = async (req, res, next) => {
    try {
        const { refreshToken } = req.cookies;
        if (refreshToken) {
            await User.findByIdAndUpdate(req.user._id, {
                $pull: { refreshTokens: { token: refreshToken } },
            });
        }
        res.clearCookie('refreshToken');
        res.status(200).json({ success: true, message: 'Logged out' });
    } catch (error) {
        next(error);
    }
};

export const refreshToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.cookies;
        if (!refreshToken) return res.status(400).json({ success: false, message: 'Token required' });

        const decoded = verifyRefreshToken(refreshToken);
        const user = await User.findOne({ _id: decoded.id, 'refreshTokens.token': refreshToken });

        if (!user) return res.status(401).json({ success: false, message: 'Invalid token' });

        const accessToken = generateAccessToken(user._id);
        res.status(200).json({ success: true, accessToken });
    } catch (error) {
        res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }
};

export const getMe = async (req, res) => {
    res.status(200).json({ success: true, user: req.user });
};

// OAuth Callbacks
export const oauthSuccess = (req, res) => {
    // Passport handles the user object in req.user
    sendTokenResponse(req.user, 200, res, { message: 'OAuth successful' });
};
