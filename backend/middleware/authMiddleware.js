import jwt from 'jsonwebtoken';
import User from '../model/userModel.js';

export const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({ success: false, message: 'User not found' });
            }

            if (!req.user.isActive) {
                return res.status(401).json({ success: false, message: 'User account is deactivated' });
            }

            req.user.lastActive = Date.now();
            await req.user.save({ validateBeforeSave: false });

            next();
        } catch (error) {
            console.error('Token verification failed:', error.message);
            return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
        }
    } else {
        // Check cookies for refreshToken if Bearer is missing (RS style)
        const refreshToken = req.cookies.refreshToken;
        if (refreshToken) {
            // We could handle auto-refresh here or just rely on Bearer.
            // For now, stick to Bearer as primary for simplicity, but acknowledge RS style.
        }
        return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }
};

export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `User role '${req.user.role}' is not authorized to access this route`,
            });
        }

        next();
    };
};

export const optionalAuth = async (req, res, next) => {
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
            req.user = await User.findById(decoded.id).select('-password');
        } catch (error) {
            req.user = null;
        }
    }
    next();
};
