import React from "react";

export default function PageWrapper({ children, className = "" }) {
  return (
    <div className={`relative max-w-[1200px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 overflow-hidden ${className}`}>
      {/* Restrained decorative halftone wave crest */}
      <div
        className="pointer-events-none absolute -top-8 -right-16 w-[420px] h-[340px] opacity-20 overflow-hidden z-0 select-none hidden lg:block"
        aria-hidden="true"
      >
        <img
          src="/assets/backgrounds/halftone-corner-crest.svg"
          alt=""
          className="w-full h-full object-contain halftone-wave-drift"
        />
      </div>

      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
