import express from 'express';
import {
  loginUser,
  registerUser,
  verifyRegistrationOtp,
  resendRegistrationOtp,
  selectRole,
  getMe,
  logoutUser,
  updateFcmToken,
} from '../controllers/auth.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { otpRateLimit } from '../middlewares/otpRateLimit.middleware.js';


const router = express.Router();

router.post(
  "/register",
  otpRateLimit({ scope: "registration", limit: 5, windowMs: 15 * 60 * 1000 }),
  registerUser,
);
router.post(
  "/register/verify-otp",
  otpRateLimit({ scope: "registration-verify", limit: 10, windowMs: 15 * 60 * 1000 }),
  verifyRegistrationOtp,
);
router.post(
  "/register/resend-otp",
  otpRateLimit({ scope: "registration-resend", limit: 5, windowMs: 15 * 60 * 1000 }),
  resendRegistrationOtp,
);
router.post("/login", loginUser);
router.patch("/select-role", protect, selectRole);
router.patch("/update-fcm-token", protect, updateFcmToken);
router.get("/me", protect, getMe);
router.post("/logout", logoutUser)

export default router;

