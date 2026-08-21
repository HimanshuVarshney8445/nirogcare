import admin from "./firebaseAdmin.js";
import User from "../models/User.js";

export const notificationService = async ({ userId, title, body }) => {
  try {

    if (!admin.apps.length) {
      throw new Error("Firebase Admin SDK is not initialized. Check server environment configuration.");
    }

    const user = await User.findById(userId);
    if (!user || !user.fcmToken) {
      // User has no registered device — skip push notification silently
      return { success: false, error: "FCM token not found for user" };
    }

    // Build FCM message
    const message = {
      token: user.fcmToken,
      notification: {
        title: title || "NirogCare Notification",
        body: body || "You have a new update regarding your appointment.",
      },
      data: {
        title: title || "NirogCare Notification",
        body: body || "You have a new update regarding your appointment.",
        timestamp: new Date().toISOString(),
      },
    };

    // Send push notification
    const response = await admin.messaging().send(message);
    return {
      success: true,
      messageId: response,
    };
  } catch (err) {
    console.error("Notification error:", err);
    return {
      success: false,
      error: err.message || "Something went wrong",
    };
  }
};

import Notification from "../models/Notification.js";

export const createAndSendNotification = async ({ userId, title, body }) => {
  try {
    if (!userId) return null;

    const newNotification = await Notification.create({
      userId,
      title: title || "NirogCare Notification",
      body: body || "You have a new update regarding your appointment.",
    });

    let pushResult = { success: false };
    try {
      pushResult = await notificationService({ userId, title, body });
    } catch (err) {
      console.warn("FCM push notification error (non-fatal):", err);
    }

    return {
      notification: newNotification,
      pushResult,
    };
  } catch (error) {
    console.error("Error in createAndSendNotification:", error);
    return null;
  }
};
