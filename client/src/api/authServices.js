import { api } from "./apiClient";

export async function callAuthRegisterApi(formData) {
  const response = await api.post("/api/auth/register", formData);
  return response.data;
}

export async function callAuthLoginApi(email, password) {
  const response = await api.post("/api/auth/login", { email, password });
  return response.data;
}

export async function callRoleApi(role, fcmToken = null) {
  const response = await api.patch("/api/auth/select-role", { role, fcmToken });
  return response.data;
}

export async function updateFcmTokenApi(fcmToken) {
  const response = await api.patch("/api/auth/update-fcm-token", { fcmToken });
  return response.data;
}

