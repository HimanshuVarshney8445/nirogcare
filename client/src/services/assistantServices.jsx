import { api } from "../api/apiClient";

export async function updateAssistantProfile({ doctorLicense, hospitalLicense }) {
  const response = await api.post("/api/assistant/update-profile", {
    doctorLicense,
    hospitalLicense,
  });
  return response.data;
}

export async function getAssistantProfile() {
  const response = await api.get("/api/assistant/get-profile");
  return response.data;
}
