import { api } from "../api/apiClient";

export async function doctorProfileApi(formData) {
  const response = await api.post("/api/doctor/profile", formData);
  return response.data;
}

export async function getDoctorProfileApi() {
  const response = await api.get("/api/doctor/get-profile");
  return response.data;
}

export async function todaysPatientsApi() {
  const response = await api.get("/api/doctor/getAllDrAppointments");
  return response.data;
}

export async function todaysOnlinePatientsApi() {
  const response = await api.get("/api/doctor/getOnlineAppointments");
  return response.data;
}
