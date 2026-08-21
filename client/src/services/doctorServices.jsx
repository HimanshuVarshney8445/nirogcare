import { api } from "../api/apiClient";

export async function doctorProfileApi(formData) {
  const response = await api.post("/api/doctor/profile", formData);
  return response.data;
}

export async function getDoctorProfileApi() {
  const response = await api.get("/api/doctor/get-profile");
  return response.data;
}

export async function getDoctorRequestsApi() {
  const response = await api.get("/api/doctor/requests");
  return response.data;
}

export async function updateDoctorRequestApi(doctorId, status) {
  const response = await api.patch(
    `/api/doctor/requests/${doctorId}`,
    { status }
  );

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
