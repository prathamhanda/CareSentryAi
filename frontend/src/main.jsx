import React from "react";
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store/index.js";
import "./index.css";
import App from "./App.jsx";
import LoginPage from "./pages/Login.jsx";
import RegisterPage from "./pages/Register.jsx";
import Prescription from "./pages/Prescription.jsx";
import PrescriptionsPage from "./pages/Prescriptions.jsx";
import SchedulePage from "./pages/Schedule.jsx";
import PredictionPage from "./pages/Prediction.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import RedirectIfAuth from "./components/RedirectAuth.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import Landing from "./pages/Landing.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <AuthProvider>
        <App />
      </AuthProvider>
    ),
    children: [
      {
        index: true,
        element: (
          <RedirectIfAuth>
            <Landing />
          </RedirectIfAuth>
        ),
      },
      {
        path: "login",
        element: (
          <RedirectIfAuth>
            <LoginPage />
          </RedirectIfAuth>
        ),
      },
      {
        path: "register",
        element: (
          <RedirectIfAuth>
            <RegisterPage />
          </RedirectIfAuth>
        ),
      },
      {
        path: "upload",
        element: (
          <ProtectedRoute>
            <Prescription />
          </ProtectedRoute>
        ),
      },
      {
        path: "prediction",
        element: <PredictionPage />,
      },
      {
        path: "schedule",
        element: (
          <ProtectedRoute>
            <SchedulePage />
          </ProtectedRoute>
        ),
      },
      {
        path: "prescriptions",
        element: (
          <ProtectedRoute>
            <PrescriptionsPage />
          </ProtectedRoute>
        ),
      },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>
);
