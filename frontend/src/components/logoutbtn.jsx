import React from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function LogoutBtn() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleLogout = async () => {
    try {
      await api.post("/users/logout", {}, { withCredentials: true });
      setUser(null); // 🧠 clear context
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
      alert("Failed to logout. Try again.");
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="inline-block px-6 py-2 duration-200 bg-red-600 hover:bg-red-700 rounded-full text-white"
    >
      Logout
    </button>
  );
}
