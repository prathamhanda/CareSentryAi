import axios from "axios";

export default axios.create({
  baseURL: "https://medicreminder-production.up.railway.app/api",
  withCredentials: true,
});
