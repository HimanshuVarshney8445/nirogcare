import { api } from "../api/apiClient";

export async function getMe() {
  const response = await api.get("/api/auth/me");
  return response.data;
}
