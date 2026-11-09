import axios from "axios";

const rawBase =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  "/api";
const normalizedBase = rawBase.toString().replace(/\/+$/, "");
const apiBase =
  normalizedBase === "/api" || normalizedBase.endsWith("/api")
    ? normalizedBase
    : `${normalizedBase}/api`;

const api = axios.create({
  baseURL: apiBase,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
