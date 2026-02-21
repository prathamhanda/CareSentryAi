import axios from "axios";

const apiBase = (
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  "http://localhost:3000"
)
  .toString()
  .replace(/\/$/, "");

export default axios.create({
  baseURL: `${apiBase}/api`,
  withCredentials: true,
});
