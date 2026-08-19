import { api } from "../api/apiClient";

export async function notifyViaFCM(userId, title, body) {
  const response = await api.post("/api/firebase/send-notification", {
    title: title || "Appointment Update",
    body: body || "Your appointment status has been updated. Please check your dashboard.",
    userId,
  });
  return response.data;
}

