import axios from "axios";

export default axios.create({
  baseURL: "https://caresentryai-production.up.railway.app/api",
  withCredentials: true,
});
