import React from "react";

export default function PageFadeWrapper({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-gray-100 px-6 py-12 animate-fadeIn">
      {children}

      {/* Reuse same fade animation from landing */}
      <style>{`
        .animate-fadeIn {
          animation: fadeIn 0.8s ease-in-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
