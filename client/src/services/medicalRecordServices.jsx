import { api } from "../api/apiClient";

export async function addMedicalRecordAPI(formData) {
  const response = await api.post("/api/record/medical-record", formData);
  return response.data;
}

export async function getMedicalRecordsAPI() {
  const response = await api.get("/api/record/get-medical-record");
  return response.data;
}
