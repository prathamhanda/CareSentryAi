import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import { useAuth } from "../context/useAuth.jsx";
import { User, Lock, ArrowRight, ShieldCheck, AlertCircle, Scan, Bell, CheckCircle2 } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!formData.username.trim() || !formData.password) return;
    try {
      setSubmitting(true);
      const res = await api.post("/users/login", formData);
      const data = res?.data || {};
      if (data.status === 200 && data.user) {
        if (data.token) {
          localStorage.setItem("accessToken", data.token);
        }
        setUser(data.user);
        navigate("/upload", { replace: true });
      } else {
        setError(data.message || "Invalid credentials. Please verify your login details.");
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Authentication failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-160px)] flex items-center justify-center py-10 px-4 sm:px-6">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Visual Companion Showcase (5 Cols) */}
        <div className="hidden lg:flex lg:col-span-5 flex-col justify-between p-8 rounded-[12px] bg-[#ffffff] border border-[rgba(0,0,0,0.08)] shadow-sm space-y-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#e8f8ff] rounded-full text-xs font-semibold text-[#244cff] mb-4">
              <span className="w-2 h-2 rounded-full bg-[#244cff]" />
              <span>CareSentry</span>
            </div>
            <h3 className="font-['Inter'] text-2xl font-normal text-[#000000] tracking-tight">
              Never miss a dose
            </h3>
            <p className="font-['Inter'] text-xs text-[#2b2b2b] mt-2 leading-relaxed">
              Scan your prescriptions, organize your medication times, and get friendly reminders sent to Telegram.
            </p>
          </div>

          <div className="w-full flex justify-center py-2 animate-float-slow">
            <img
              src="/assets/illustrations/auth-companion.svg"
              alt="CareSentry Companion"
              className="w-48 h-auto drop-shadow-md"
            />
          </div>

          <div className="space-y-2.5 pt-4 border-t border-[rgba(0,0,0,0.06)] text-xs text-[#2b2b2b]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#00c978]" />
              <span>Scan handwritten or printed prescriptions</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#00c978]" />
              <span>Daily reminder alerts sent to Telegram</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#00c978]" />
              <span>Review your schedule before saving</span>
            </div>
          </div>
        </div>

        {/* Right Column: Authentication Card (7 Cols) */}
        <div className="lg:col-span-7 card-snow bg-clinical-pattern p-8 sm:p-10 space-y-6 shadow-sm">
          {/* Header */}
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#e8f8ff] rounded-full text-xs font-semibold text-[#244cff] mb-1">
              <span className="w-2 h-2 rounded-full bg-[#244cff]" />
              <span>Sign In</span>
            </div>
            <h2 className="font-['Inter'] text-2xl sm:text-3xl font-normal text-[#000000] tracking-tight">
              Welcome Back
            </h2>
            <p className="font-['Inter'] text-sm text-[#2b2b2b]">
              Sign in to view your prescriptions and reminder schedules.
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="p-3.5 rounded-[6px] bg-[#fcc2cd]/20 border border-[#fcc2cd] text-[#ff2b3a] text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-[#ff2b3a] shrink-0 mt-0.5" />
              <span className="font-medium text-[#000000]">{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-xs font-semibold text-[#000000] mb-1.5"
              >
                Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#878787] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  placeholder="Enter your username"
                  className="input-mage has-left-icon pl-11"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-[#000000] mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#878787] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••••••"
                  className="input-mage has-left-icon pl-11"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full btn-cobalt disabled:opacity-50 interactive-pill"
                style={{ height: "42px" }}
              >
                <span>{submitting ? "Authenticating..." : "Sign In to Account"}</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </button>
            </div>
          </form>

          {/* Footer Link & Security Notice */}
          <div className="pt-4 border-t border-[rgba(0,0,0,0.08)] text-center text-xs text-[#878787] space-y-3">
            <p>
              Don't have an account yet?{" "}
              <Link
                to="/register"
                className="font-medium text-[#244cff] hover:underline"
              >
                Create free account
              </Link>
            </p>

            <p className="flex items-center justify-center gap-1.5 text-[11px] text-[#878787] pt-2">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00c978]" />
              <span>Your health information is kept private and secure</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}