import User from "../models/User.js";
import RegistrationOtp from "../models/RegistrationOtp.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { randomInt } from "node:crypto";
import { sendRegistrationOtpEmail } from "../services/email.js";

const OTP_TTL_MS = 5 * 60 * 1000;
const OTP_RESEND_COOLDOWN_MS = 60 * 1000;
const OTP_MAX_ATTEMPTS = 5;
const PENDING_REGISTRATION_TTL_MS = 24 * 60 * 60 * 1000;
const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET_KEY,
    { expiresIn: "3d" }
  );
};

const normalizeEmail = (email) =>
  typeof email === "string" ? email.trim().toLowerCase() : "";

const secondsUntil = (date, now = new Date()) =>
  Math.max(0, Math.ceil((date - now) / 1000));

const validateRegistration = ({ name, email, phone, password }) => {
  if (typeof name !== "string" || name.trim().length < 2) {
    return "Enter a valid name.";
  }
  if (!EMAIL_PATTERN.test(email)) {
    return "Enter a valid email address.";
  }
  if (typeof phone !== "string" || !/^[6-9]\d{9}$/.test(phone.trim())) {
    return "Enter a valid 10-digit Indian phone number.";
  }
  if (typeof password !== "string" || password.length < 6) {
    return "Password must be at least 6 characters long.";
  }
  return null;
};

const sendOtpEmail = async (pendingRegistration, otp) => {
  try {
    await sendRegistrationOtpEmail({
      to: pendingRegistration.email,
      name: pendingRegistration.name,
      otp,
    });
  } catch (error) {
    console.error("Registration OTP email delivery failed:", error.code || "mail-delivery-error");
    throw error;
  }
};

export const registerUser = async (req, res) => {
  try {
    const body = req.body || {};
    const { name, phone, password } = body;
    const email = normalizeEmail(body.email);
    const validationError = validateRegistration({ name, email, phone, password });
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const existing = await User.findOne({ email }).select("_id");
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const existingPending = await RegistrationOtp.findOne({ email });
    if (existingPending) {
      return res.status(202).json({
        message: "Email verification is already in progress.",
        resendAfterSeconds: secondsUntil(existingPending.resendAvailableAt),
      });
    }

    const now = new Date();
    const otp = String(randomInt(100000, 1000000));
    const [hashedPassword, otpHash] = await Promise.all([
      bcrypt.hash(password, 10),
      bcrypt.hash(otp, 10),
    ]);

    let pendingRegistration;
    try {
      pendingRegistration = await RegistrationOtp.create({
        name: name.trim(),
        email,
        phone: phone.trim(),
        password: hashedPassword,
        otpHash,
        expiresAt: new Date(now.getTime() + OTP_TTL_MS),
        resendAvailableAt: new Date(now.getTime() + OTP_RESEND_COOLDOWN_MS),
        purgeAt: new Date(now.getTime() + PENDING_REGISTRATION_TTL_MS),
      });
    } catch (error) {
      if (error.code === 11000) {
        const pending = await RegistrationOtp.findOne({ email });
        if (pending) {
          return res.status(202).json({
            message: "Email verification is already in progress.",
            resendAfterSeconds: secondsUntil(pending.resendAvailableAt),
          });
        }
      }
      throw error;
    }

    try {
      await sendOtpEmail(pendingRegistration, otp);
    } catch {
      return res.status(503).json({
        message: "We couldn't send the verification email. Please try again later.",
        verificationPending: true,
        resendAfterSeconds: OTP_RESEND_COOLDOWN_MS / 1000,
      });
    }

    return res.status(202).json({
      message: "Verification code sent to your email.",
      resendAfterSeconds: OTP_RESEND_COOLDOWN_MS / 1000,
    });
  } catch (err) {
    console.error("Register Error:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const verifyRegistrationOtp = async (req, res) => {
  try {
    const body = req.body || {};
    const email = normalizeEmail(body.email);
    const { otp } = body;
    if (!EMAIL_PATTERN.test(email) || typeof otp !== "string" || !/^\d{6}$/.test(otp)) {
      return res.status(400).json({ message: "Enter a valid email address and 6-digit code." });
    }

    const now = new Date();
    const pending = await RegistrationOtp.findOneAndUpdate(
      { email, expiresAt: { $gt: now }, attempts: { $lt: OTP_MAX_ATTEMPTS } },
      { $inc: { attempts: 1 } },
      { new: true },
    );

    if (!pending) {
      const current = await RegistrationOtp.findOne({ email });
      if (!current) {
        return res.status(404).json({ message: "No pending registration was found. Please register again." });
      }
      if (current.expiresAt <= now) {
        return res.status(410).json({ message: "This verification code has expired. Request a new code." });
      }
      return res.status(429).json({ message: "Too many incorrect attempts. Request a new code." });
    }

    const isMatch = await bcrypt.compare(otp, pending.otpHash);
    if (!isMatch) {
      const attemptsRemaining = Math.max(0, OTP_MAX_ATTEMPTS - pending.attempts);
      return res.status(attemptsRemaining === 0 ? 429 : 400).json({
        message: attemptsRemaining === 0
          ? "Too many incorrect attempts. Request a new code."
          : "The verification code is incorrect.",
        attemptsRemaining,
      });
    }

    const existingUser = await User.findOne({ email }).select("_id");
    if (existingUser) {
      await RegistrationOtp.deleteOne({ _id: pending._id });
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    try {
      await User.create({
        name: pending.name,
        email: pending.email,
        phone: pending.phone,
        password: pending.password,
        role: null,
        emailVerified: true,
      });
    } catch (error) {
      if (error.code === 11000) {
        await RegistrationOtp.deleteOne({ _id: pending._id });
        return res.status(409).json({ message: "An account with this email already exists." });
      }
      throw error;
    }

    await RegistrationOtp.deleteOne({ _id: pending._id });
    return res.status(200).json({ message: "Email verified. You can now sign in." });
  } catch (err) {
    console.error("Verify Registration OTP Error:", err.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const resendRegistrationOtp = async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    if (!EMAIL_PATTERN.test(email)) {
      return res.status(400).json({ message: "Enter a valid email address." });
    }

    const now = new Date();
    const otp = String(randomInt(100000, 1000000));
    const otpHash = await bcrypt.hash(otp, 10);
    const pending = await RegistrationOtp.findOneAndUpdate(
      { email, resendAvailableAt: { $lte: now } },
      {
        $set: {
          otpHash,
          expiresAt: new Date(now.getTime() + OTP_TTL_MS),
          resendAvailableAt: new Date(now.getTime() + OTP_RESEND_COOLDOWN_MS),
          purgeAt: new Date(now.getTime() + PENDING_REGISTRATION_TTL_MS),
          attempts: 0,
        },
      },
      { new: true },
    );

    if (!pending) {
      const current = await RegistrationOtp.findOne({ email });
      if (!current) {
        return res.status(404).json({ message: "No pending registration was found. Please register again." });
      }

      const resendAfterSeconds = secondsUntil(current.resendAvailableAt, now);
      return res.status(429).json({
        message: "Please wait before requesting another code.",
        resendAfterSeconds,
      });
    }

    try {
      await sendOtpEmail(pending, otp);
    } catch {
      return res.status(503).json({
        message: "We couldn't send the verification email. Please try again later.",
        resendAfterSeconds: OTP_RESEND_COOLDOWN_MS / 1000,
      });
    }

    return res.status(200).json({
      message: "A new verification code was sent.",
      resendAfterSeconds: OTP_RESEND_COOLDOWN_MS / 1000,
    });
  } catch (err) {
    console.error("Resend Registration OTP Error:", err.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};


export const loginUser = async (req, res) => {
  try {
    const body = req.body || {};
    const email = normalizeEmail(body.email);
    const { password } = body;
    if (!EMAIL_PATTERN.test(email) || typeof password !== "string") {
      return res.status(400).json({ message: "Enter a valid email address and password." });
    }

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    if (user.emailVerified === false) {
      return res.status(403).json({ message: "Please verify your email before signing in." });
    }

    const token = generateToken(user);
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 3 * 24 * 60 * 60 * 1000,
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      secure: process.env.NODE_ENV === "production",
    });

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token,
      },
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};



export const selectRole = async (req, res) => {
  try {
    const userId = req.user.id;
    const { role, fcmToken } = req.body;

    if (!role) {
      return res.status(400).json({ message: "Role is required" });
    }

    const updateData = { role };

    if (role === "patient" && fcmToken) {
      updateData.fcmToken = fcmToken;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const token = generateToken(updatedUser);
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 3 * 24 * 60 * 60 * 1000,
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      secure: process.env.NODE_ENV === "production",
    });

    res.status(200).json({
      message: "Role selected successfully",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        token,
      },
    });
  } catch (err) {
    console.error("Select Role Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};



export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ user });
  } catch (err) {
    console.error("GetMe Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const logoutUser = async (req, res) => {
  try {
  
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout Error:", error);
    return res.status(500).json({ error: "Logout failed" });
  }
};

export const updateFcmToken = async (req, res) => {
  try {
    const { fcmToken } = req.body;
    if (!fcmToken) {
      return res.status(400).json({ message: "FCM token is required" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { fcmToken },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "FCM token updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error("Update FCM Token Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
