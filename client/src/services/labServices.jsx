import { api } from "../api/apiClient";

export async function getAllLabAppointmentbyLab(labId) {
  const response = await api.get(`/api/lab/all-lab-appointments/${labId}`);
  return response.data;
}

export async function bookLabAppointment(data) {
  const response = await api.post("/api/lab/book-appointment", data);
  return response.data;
}

export async function uploadLabReport(appointmentId, reportPDF) {
  const response = await api.post(`/api/lab/lab-appointments/${appointmentId}/upload-report`, { reportPDF });
  return response.data;
}

export async function updateLab(formData) {
  const response = await api.put("/api/lab/profile", formData);
  return response.data;
}

export async function registerLab(data) {
  const response = await api.post("/api/lab/register", data);
  return response.data;
}

export async function getLabProfile() {
  const response = await api.get("/api/lab/profile");
  return response.data;
}

export async function getAllLabReport() {
  const response = await api.get("/api/patient/lab-reports");
  return response.data;
}

export async function getTodayLabAppointments(labId) {
  const response = await api.get(`/api/lab/labs/${labId}/today-appointments`);
  return response.data;
}

export async function getTodayLabAppointmentCount() {
  const response = await api.get("/api/lab/today-appointments/count");
  return response.data;
}
