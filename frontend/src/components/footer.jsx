import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Heart, Lock } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-[rgba(0,0,0,0.08)] bg-[#ffffff] bg-clinical-pattern text-[#000000] pt-16 pb-12 mt-20 relative overflow-hidden">
      {/* Soft gradient accent at top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#244cff] via-[#c3aeff] to-[#00c978]" />

      {/* Organic Halftone Wave Ambient Background in Footer */}
      <div
        className="pointer-events-none absolute -bottom-10 right-0 w-[500px] h-[220px] opacity-15 overflow-hidden z-0 select-none hidden sm:block"
        aria-hidden="true"
      >
        <img
          src="/assets/backgrounds/halftone-accent-wave.svg"
          alt=""
          className="w-full h-full object-cover"
        />
      </div>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 pb-12 border-b border-[rgba(0,0,0,0.08)]">
          {/* Col 1: Brand & Identity */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[#1d1f21] flex items-center justify-center text-white shrink-0 shadow-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-[#244cff]" />
              </div>
              <span className="font-['Inter'] font-bold text-[18px] text-[#000000]">
                CareSentry
              </span>
            </div>
            <p className="font-['Inter'] text-[13px] text-[#2b2b2b] leading-relaxed">
              Turn prescriptions into simple daily schedules and receive friendly medication reminders on Telegram.
            </p>
            <div className="pt-1 flex flex-wrap gap-2">
              <span className="badge-ice text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#244cff]" />
                <span>Always in control</span>
              </span>
              <span className="badge-parchment text-[11px]">
                <Lock className="w-3 h-3 text-[#00c978]" />
                <span>Private & Secure</span>
              </span>
            </div>
          </div>

          {/* Col 2: Platform Navigation */}
          <div>
            <h4 className="font-['Inter'] text-[12px] font-semibold text-[#878787] uppercase tracking-wider mb-4">
              Features
            </h4>
            <ul className="space-y-2.5 font-['Inter'] text-[14px]">
              <li>
                <Link to="/upload" className="text-[#2b2b2b] hover:text-[#244cff] transition-colors flex items-center gap-1">
                  <span>Scan prescription</span>
                </Link>
              </li>
              <li>
                <Link to="/prescriptions" className="text-[#2b2b2b] hover:text-[#244cff] transition-colors flex items-center gap-1">
                  <span>My prescriptions</span>
                </Link>
              </li>
              <li>
                <Link to="/schedule" className="text-[#2b2b2b] hover:text-[#244cff] transition-colors flex items-center gap-1">
                  <span>Medication schedule</span>
                </Link>
              </li>
              <li>
                <Link to="/set-reminder" className="text-[#2b2b2b] hover:text-[#244cff] transition-colors flex items-center gap-1">
                  <span>Create reminder</span>
                </Link>
              </li>
              <li>
                <Link to="/prediction" className="text-[#2b2b2b] hover:text-[#244cff] transition-colors flex items-center gap-1">
                  <span>Check symptoms</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: How It Works */}
          <div>
            <h4 className="font-['Inter'] text-[12px] font-semibold text-[#878787] uppercase tracking-wider mb-4">
              How it works
            </h4>
            <ul className="space-y-2.5 font-['Inter'] text-[13.5px] text-[#2b2b2b]">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#244cff]" />
                <span>Photo prescription scanner</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00c978]" />
                <span>Telegram reminder notifications</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#9e770b]" />
                <span>Side-by-side medicine review</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#c3aeff]" />
                <span>Educational symptom exploration</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Safety & Disclaimer */}
          <div>
            <h4 className="font-['Inter'] text-[12px] font-semibold text-[#878787] uppercase tracking-wider mb-4">
              Health Notice
            </h4>
            <p className="font-['Inter'] text-[13px] text-[#878787] leading-relaxed">
              CareSentry is designed to help you organize your daily medicines. Always verify your dosages with your doctor or pharmacist.
            </p>
            <div className="mt-3.5 p-2.5 bg-[#f7f7f1] rounded-[6px] border border-[rgba(0,0,0,0.06)] text-[11px] text-[#878787]">
              Service Status: <span className="text-[#00c978] font-semibold">Online & Ready</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] text-[#878787] font-['Inter']">
          <p>© {new Date().getFullYear()} CareSentry. All rights reserved.</p>
          <p className="flex items-center gap-2 text-[#2b2b2b]">
            <span className="w-2 h-2 rounded-full bg-[#00c978]" />
            <span>Helping you stay on schedule</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
