import crypto from "crypto";
import User from "../model/userModel.js";
import {
  sendTokenResponse,
  verifyRefreshToken,
  generateAccessToken,
  generateRefreshToken,
} from "../utils/tokenUtils.js";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
} from "../utils/emailService.js";

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
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    const user = await User.create({
      name,
      email,
      password,
      authProvider: "local",
    });
    const verificationToken = user.generateEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    await sendVerificationEmail({
      email: user.email,
      name: user.name,
      verificationToken,
    });
    await sendWelcomeEmail({ email: user.email, name: user.name });

    sendTokenResponse(user, 201, res, {
      message: "Registration successful. Please verify your email.",
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    if (!user.isActive) {
      return res
        .status(401)
        .json({ success: false, message: "Account deactivated" });
    }

    sendTokenResponse(user, 200, res, { message: "Login successful" });
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
    res.clearCookie("refreshToken");
    res.status(200).json({ success: true, message: "Logged out" });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken)
      return res
        .status(400)
        .json({ success: false, message: "Token required" });

    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findOne({
      _id: decoded.id,
      "refreshTokens.token": refreshToken,
    });

    if (!user)
      return res.status(401).json({ success: false, message: "Invalid token" });

    const accessToken = generateAccessToken(user._id);
    res.status(200).json({ success: true, accessToken });
  } catch (error) {
    res.status(401).json({ success: false, message: "Invalid refresh token" });
  }
};

export const getMe = async (req, res) => {
  res.status(200).json({ success: true, user: req.user });
};

// OAuth Callbacks
export const oauthSuccess = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "No user from OAuth" });

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshTokens.push({ token: refreshToken });
    await user.save({ validateBeforeSave: false });

    const cookieOptions = {
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    };

    const redirectBase = (
      process.env.CLIENT_URL || "http://localhost:5173"
    ).split(",")[0];
    const redirectUrl = `${redirectBase.replace(/\/$/, "")}/auth/callback#accessToken=${accessToken}`;

    // Set refreshToken cookie and redirect to frontend with accessToken in fragment
    res
      .cookie("refreshToken", refreshToken, cookieOptions)
      .redirect(302, redirectUrl);
  } catch (error) {
    next(error);
  }
};
