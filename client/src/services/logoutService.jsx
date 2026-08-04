import { api } from "../api/apiClient";

export async function logoutUser() {
  return api.post("/api/auth/logout", {});
}
