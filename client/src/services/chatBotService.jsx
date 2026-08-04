import { api } from "../api/apiClient";

export async function sendChatMessage(userMessage, userData) {
  const response = await api.post("/api/ai/chat", { userMessage, userData });
  return response.data;
}
