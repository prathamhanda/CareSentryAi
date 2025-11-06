import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Container } from "./index";
import { Sparkles } from "lucide-react";

export default function Header() {
  const navigate = useNavigate();
  const authStatus = useSelector((state) => state.auth.status);
  const [isDark, setIsDark] = useState(false);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldBeDark = stored ? stored === "dark" : prefersDark;
    setIsDark(shouldBeDark);
    document.documentElement.classList.toggle("dark", shouldBeDark);
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  const navItems = [
    { name: "Home", path: "/" },
    {
      name: "Prediction",
      external: "https://diseasepred-a12r.onrender.com/",
    },
    { name: "Login", path: "/login", auth: false },
    { name: "Register", path: "/register", auth: false },
    { name: "Upload", path: "/upload", auth: true },
    { name: "Prescriptions", path: "/prescriptions", auth: true },
    { name: "Create Schedule", path: "/schedule", auth: true },
  ];

  return (
    <header className="py-4 shadow bg-gray-900 text-gray-100 border-b border-gray-700">
      <Container>
        {/* Logo / Title */}
        <div className="flex items-center justify-between">
          <div
            className="flex items-center text-2xl font-bold cursor-pointer mx-auto text-blue-400"
            onClick={() => navigate("/")}
          >
            <Sparkles className="text-blue-400 w-8 h-8 mr-2" />
            CareSentry AI
          </div>
        </div>

        {/* Navigation Bar */}
        <nav className="mt-3">
          <ul className="flex justify-center space-x-8">
            {navItems
              .filter((item) =>
                authStatus ? item.auth !== false : item.auth !== true
              )
              .map((item) => (
                <li key={item.name}>
                  <button
                    onClick={() => {
                      if (item.external) {
                        window.open(item.external, "_blank");
                      } else {
                        navigate(item.path);
                      }
                    }}
                    className="hover:text-blue-400 transition-colors"
                  >
                    {item.name}
                  </button>
                </li>
              ))}
          </ul>
        </nav>
      </Container>
    </header>
  );
}
