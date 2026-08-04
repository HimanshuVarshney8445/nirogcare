import { api } from "../api/apiClient";

export async function updatePatient(formData = {}) {
  const response = await api.post("/api/patient/profile", formData);
  return response.data;
}

export async function getAllNearbyHospitals(params = {}) {
  const response = await api.post("/api/patient/near-hospitals", params);
  return response.data;
}

export async function getAllNearbyLabs(params = {}) {
  const response = await api.post("/api/patient/near-labs", params);
  return response.data;
}

export async function createAppointment(appointmentData) {
  const response = await api.post("/api/patient/book-appointment", appointmentData);
  return response.data;
}

export async function getMyAppointment() {
  const response = await api.get("/api/patient/appointments");
  return response.data;
}

export async function createAppointmentLab(appointmentData) {
  const response = await api.post("/api/lab/book-appointment", appointmentData);
  return response.data;
}

export async function getMyLabAppointment() {
  const response = await api.get("/api/lab/appointments");
  return response.data;
}

export async function updateVitalsForUser(formData, appointmentId) {
  const response = await api.patch("/api/patient/update-vitals", { ...formData, appointmentId });
  return response.data;
}

export async function getVitalsForUser() {
  const response = await api.get("/api/patient/vitals");
  return response.data;
}
