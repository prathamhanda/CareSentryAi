import React from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-gray-100 flex flex-col items-center px-6 py-16">
      {/* Header */}
      <div className="flex items-center mb-6 animate-fadeIn">
        <Sparkles className="text-blue-400 w-8 h-8 mr-2" />
        <h1 className="text-4xl md:text-5xl font-bold text-blue-400 tracking-wide">
          LifeAura AI
        </h1>
      </div>

      {/* Tagline */}
      <p className="text-gray-300 text-lg max-w-2xl text-center mb-12 leading-relaxed animate-fadeIn delay-100">
        Empowering healthcare through AI-driven prescription management and
        smart scheduling. Upload your prescriptions, extract medicines
        instantly, and manage your daily medical routine effortlessly.
      </p>

      {/* YouTube Preview */}
      <div className="w-full max-w-3xl aspect-video mb-12 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-blue-500/20 hover:ring-blue-400/40 transition">
        <iframe
          width="100%"
          height="100%"
          src="https://www.youtube.com/embed/CoUkLlziQEg"
          title="LifeAura AI Demo"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="rounded-2xl"
        ></iframe>
      </div>

      {/* Buttons */}
      <div className="flex gap-6 mb-16">
        <button
          onClick={() => navigate("/login")}
          className="px-8 py-3 bg-blue-500 hover:bg-blue-600 rounded-full font-semibold transition transform hover:scale-105"
        >
          Get Started
        </button>

        <button
          onClick={() => navigate("/register")}
          className="px-8 py-3 border border-blue-400 hover:bg-blue-400 hover:text-gray-900 rounded-full font-semibold transition transform hover:scale-105"
        >
          Create Account
        </button>
      </div>

      {/* Feature Cards */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-5xl w-full">
        {[
          {
            title: "AI Prescription Extraction",
            desc: "Upload prescriptions — our AI extracts medicines, dosages, and schedules automatically.",
            icon: "💊",
          },
          {
            title: "Smart Medication Schedule",
            desc: "Set reminders and track your doses easily with Telegram and WhatsApp integration.",
            icon: "⏰",
          },
          {
            title: "AI Symptom Analyzer",
            desc: "Get instant predictions of possible diseases by simply entering your symptoms — powered by intelligent machine learning",
            icon: "🧠",
          },
        ].map((f, i) => (
          <div
            key={i}
            className="bg-gray-900/60 border border-gray-700 hover:border-blue-500/50 rounded-2xl p-6 text-center transition-all hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="text-4xl mb-3">{f.icon}</div>
            <h3 className="text-xl font-semibold text-blue-400 mb-2">
              {f.title}
            </h3>
            <p className="text-gray-400 text-sm">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* Simple Tailwind fade animation */}
      <style>{`
        .animate-fadeIn {
          animation: fadeIn 1s ease-in forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
