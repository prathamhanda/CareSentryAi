import React from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import { useAuth } from "../context/useAuth.jsx";
import { LogOut } from "lucide-react";

export default function LogoutBtn() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleLogout = async () => {
    try {
      await api.post("/users/logout", {}, { withCredentials: true });
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      localStorage.removeItem("accessToken");
      setUser(null);
      navigate("/login");
    }
  };

  return (
    <button
      onClick={handleLogout}
      type="button"
      className="btn-obsidian text-xs"
      style={{ height: "36px", padding: "0 16px" }}
    >
      <LogOut className="w-3.5 h-3.5 mr-1" />
      <span>Sign Out</span>
    </button>
  );
}