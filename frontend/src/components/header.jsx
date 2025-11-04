import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Container, LogoutBtn } from "./index";

export default function Header() {
  const navigate = useNavigate();
  const authStatus = useSelector((state) => state.auth.status);
  const [isDark, setIsDark] = useState(false);

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
    { name: "Prediction", path: "/prediction" },
    { name: "Login", path: "/login", auth: false },
    { name: "Register", path: "/register", auth: false },
    { name: "Upload", path: "/upload", auth: true },
    { name: "Prescriptions", path: "/prescriptions", auth: true },
    { name: "Create Schedule", path: "/schedule", auth: true },
  ];

  return (
    <header className="py-4 shadow bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
      <Container>
        <div className="flex items-center justify-between">
          <h1
            className="text-2xl font-bold cursor-pointer mx-auto"
            onClick={() => navigate("/")}
          >
            CareSentry
          </h1>
        </div>

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
                      if (item.name === "Prediction") {
                        // 👇 open external ML app in a new tab
                        window.open("https://diseasepred-a12r.onrender.com/", "_blank");
                      } else {
                        navigate(item.path);
                      }
                    }}
                    className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
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