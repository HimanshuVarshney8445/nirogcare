import { notificationService } from "../services/notification.js";
import { Assistant } from "../models/Assistant.js";
import { Appointment } from "../models/Appointment.js";
import Notification from "../models/Notification.js";

export const sendFirebaseNotification = async (req, res) => {
  try {
    const { userId, title, body } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    const assistant = await Assistant.findOne({ userId: req.user.id });
    const appointment = assistant && await Appointment.findOne({
      $or: [{ bookedBy: userId }, { patientId: userId }],
      doctorId: assistant.doctorId,
      hospitalId: assistant.hospitalId,
    });

    if (!appointment && req.user.role === "assistant") {
      return res.status(403).json({ success: false, message: "You cannot notify this patient" });
    }

    const notificationTitle =
      title || "Appointment Status Update";

    const notificationBody =
      body || "Your appointment status has been updated by the clinic.";

    // Save notification in database
    const newNotification = await Notification.create({
      userId,
      title: notificationTitle,
      body: notificationBody,
    });

    // Attempt push notification via FCM
    let pushResponse = { success: false };
    try {
      pushResponse = await notificationService({
        userId,
        title: notificationTitle,
        body: notificationBody,
      });
    } catch (err) {
      console.warn("FCM push notification error (non-fatal):", err);
    }

    return res.status(200).json({
      success: true,
      message: pushResponse.success
        ? "Notification sent successfully"
        : "Notification saved to patient tab",
      notification: newNotification,
      pushSuccess: pushResponse.success,
    });

  } catch (error) {
    console.log("Error in firebase controller", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Error in firebase controller",
    });
  }
};
