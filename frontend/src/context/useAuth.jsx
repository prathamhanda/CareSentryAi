import { useContext } from "react";
import { AuthContext } from "./AuthContextInstance.jsx";

export const useAuth = () => useContext(AuthContext);
