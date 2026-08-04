import { api } from "../api/apiClient";

export async function getAllApointments() {
  const response = await api.get("/api/appointment/all-appointments");
  return response.data;
}

export async function getOnlineApointments() {
  const response = await api.get("/api/appointment/online-appointment");
  return response.data;
}

export async function updateAppointmentStatus(appointmentId, status) {
  const response = await api.patch(`/api/appointment/${appointmentId}/status`, { status });
  return response.data;
}
