import { api } from "../api/apiClient";

export async function getAllDoctorsbyHospitals(hospitalId) {
  const response = await api.get("/api/doctor/getAllDoctors", { params: { hospitalId } });
  return response.data;
}

export async function registerHospital(formData) {
  const response = await api.post("/api/hospital/register", formData);
  return response.data;
}

export async function getHospital() {
  const response = await api.get("/api/hospital/profile");
  return response.data;
}

export async function getPatientsByHospital() {
  const response = await api.get("/api/hospital/stats");
  return response.data;
}

export async function getAllHospitalPatients() {
  const response = await api.get("/api/hospital/patients");
  return response.data;
}

export async function getAllAssistantsForHospital() {
  const response = await api.get("/api/hospital/all-assistants");
  return response.data;
}
