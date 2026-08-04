import { api } from "../api/apiClient";

export async function notifyViaFCM(userId) {
  const response = await api.post("/api/firebase/send-notification", {
    title: "Appointment Confirmation",
    body: "Your appointment is confirmed! We kindly request you to arrive at the hospital within 30 minutes.",
    userId,
  });
  return response.data;
}
