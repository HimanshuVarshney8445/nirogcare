import { api } from "../api/apiClient";

export async function updateAssistantProfile({ doctorId, hospitalId }) {
  const response = await api.post("/api/assistant/update-profile", { doctorId, hospitalId });
  return response.data;
}

export async function getAssistantProfile() {
  const response = await api.get("/api/assistant/get-profile");
  return response.data;
}
