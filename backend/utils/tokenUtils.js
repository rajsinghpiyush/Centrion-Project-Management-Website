import jwt from 'jsonwebtoken';

export const generateAccessToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'secret', {
        expiresIn: process.env.JWT_EXPIRE || '7d',
    });
};

export const generateRefreshToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET || 'refresh_secret', {
        expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d',
    });
};

export const verifyRefreshToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'refresh_secret');
    } catch (error) {
        throw new Error('Invalid or expired refresh token');
    }
};

export const sendTokenResponse = async (user, statusCode, res, additionalData = {}) => {
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshTokens.push({ token: refreshToken });
    await user.save({ validateBeforeSave: false });

    const cookieOptions = {
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
    };

    const userObject = user.toObject();
    delete userObject.password;
    delete userObject.refreshTokens;
    delete userObject.resetPasswordToken;
    delete userObject.resetPasswordExpire;
    delete userObject.emailVerificationToken;
    delete userObject.emailVerificationExpire;

    res.status(statusCode).cookie('refreshToken', refreshToken, cookieOptions).json({
        success: true,
        accessToken,
        refreshToken,
        user: userObject,
        ...additionalData,
    });
};
