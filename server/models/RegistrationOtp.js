import mongoose from "mongoose";

const registrationOtpSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    otpHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    resendAvailableAt: { type: Date, required: true },
    purgeAt: { type: Date, required: true },
    attempts: { type: Number, default: 0 },
  },
  { timestamps: true },
);

registrationOtpSchema.index({ purgeAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("RegistrationOtp", registrationOtpSchema);
