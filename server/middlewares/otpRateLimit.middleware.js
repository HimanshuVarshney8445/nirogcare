import { createHash } from "node:crypto";
import OtpRateLimit from "../models/OtpRateLimit.js";

export const otpRateLimit = ({ scope, limit, windowMs }) => async (req, res, next) => {
  const now = new Date();
  const resetAt = new Date(now.getTime() + windowMs);
  const key = createHash("sha256")
    .update(`${scope}:${req.ip}`)
    .digest("hex");

  try {
    const record = await OtpRateLimit.findOneAndUpdate(
      { key },
      [
        {
          $set: {
            count: {
              $cond: [
                { $gt: ["$resetAt", now] },
                { $add: [{ $ifNull: ["$count", 0] }, 1] },
                1,
              ],
            },
            resetAt: {
              $cond: [{ $gt: ["$resetAt", now] }, "$resetAt", resetAt],
            },
          },
        },
      ],
      { new: true, upsert: true },
    );

    if (record.count > limit) {
      const retryAfter = Math.max(1, Math.ceil((record.resetAt - now) / 1000));
      res.set("Retry-After", String(retryAfter));
      return res.status(429).json({
        message: "Too many requests. Please try again later.",
        resendAfterSeconds: retryAfter,
      });
    }

    return next();
  } catch (error) {
    return next(error);
  }
};
