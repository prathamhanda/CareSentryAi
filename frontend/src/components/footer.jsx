import React from "react";

export default function Footer() {
  return (
    <footer className="py-6 bg-gray-900 text-center text-sm text-gray-300 mt-8 border-t border-gray-700 transition-colors">
      <div className="max-w-7xl mx-auto px-4">
        © {new Date().getFullYear()} CareSentryAI. All rights reserved.
      </div>
    </footer>
  );
}
