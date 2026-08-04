import axios from "axios";

const configuredBaseUrl = import.meta.env.VITE_API_URL?.trim();

// An empty base URL is intentional in local development (Vite proxies /api).
// Deployed clients on Vercel must set VITE_API_URL to their Render backend URL.
export const api = axios.create({
  baseURL: configuredBaseUrl || "/",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

export function getApiError(error) {
  const payload = error.response?.data;
  const message = payload?.message || payload?.error || error.message || "Request failed";
  const normalized = new Error(message);
  normalized.status = error.response?.status;
  normalized.data = payload;
  return normalized;
}

api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(getApiError(error))
);
