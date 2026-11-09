import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, ArrowRight, ShieldCheck, CheckCircle2, Bell, Sparkles, Eye, Pill } from "lucide-react";
import ProcessPipelineBar from "../components/ProcessPipelineBar.jsx";
import gsap from "gsap";

export default function Landing() {
  const navigate = useNavigate();
  const heroRef = useRef(null);

  // GSAP Coordinated Entrance
  useEffect(() => {
    const prefersReduced =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced || !heroRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
      tl.from(".hero-text-col", { opacity: 0, y: 16, duration: 0.7 })
        .from(".hero-art-col", { opacity: 0, scale: 0.96, duration: 0.7 }, "-=0.5")
        .from(".process-bar-section", { opacity: 0, y: 12, duration: 0.5 }, "-=0.3")
        .from(".feature-grid-item", { opacity: 0, y: 15, stagger: 0.08, duration: 0.5 }, "-=0.3");
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={heroRef} className="min-h-screen bg-[#f7f7f1] text-[#000000]">
      {/* =========================================================================
          Hero Section: Editorial 2-Column Split matching Mage Style Reference
          ========================================================================= */}
      <section className="bg-clinical-pattern relative border-b border-[rgba(0,0,0,0.06)] overflow-hidden">
        {/* Organic 3D Halftone Wave Mesh Decorative Background */}
        <div
          className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none flex items-center justify-end opacity-65"
          aria-hidden="true"
        >
          <img
            src="/assets/backgrounds/halftone-hero-mesh.svg"
            alt=""
            className="w-full h-full object-cover object-right halftone-wave-drift max-w-none"
          />
        </div>

        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 pb-16 sm:pb-24 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Column (~50%): Clear Title, Subhead, and Clean Primary CTAs */}
            <div className="hero-text-col lg:col-span-6 space-y-6">
              {/* Display Headline */}
              <h1 className="font-['Inter'] text-4xl sm:text-5xl lg:text-[54px] font-normal text-[#000000] leading-[1.14] tracking-[-0.03em]">
                Turn prescriptions into medication schedules
              </h1>

              <p className="font-['Inter'] text-[16px] sm:text-[18px] text-[#2b2b2b] leading-[1.6] max-w-[500px]">
                Upload a photo of your prescription to organize your medicines and get daily reminder alerts sent directly to Telegram.
              </p>

              {/* Clean CTAs: Single Prominent Primary Action + Text Link */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => navigate("/upload")}
                  className="btn-cobalt text-sm font-medium interactive-pill shadow-xs"
                  style={{ height: "46px", padding: "0 24px" }}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  <span>Scan a prescription</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/prediction")}
                  className="btn-ghost-link text-sm font-medium"
                >
                  Check your symptoms →
                </button>
              </div>
            </div>

            {/* Right Column (~50%): Contained & Balanced Central Medical Beacon Artwork */}
            <div className="hero-art-col lg:col-span-6 flex items-center justify-center relative select-none w-full">
              <div className="relative w-full max-w-[360px] sm:max-w-[420px] aspect-square flex items-center justify-center mx-auto">
                {/* Soft decorative background tint halos */}
                <div className="absolute w-60 h-60 rounded-full bg-[#e8f8ff] blur-2xl opacity-70 pointer-events-none" />
                <div className="absolute w-60 h-60 rounded-full bg-[#c3aeff] blur-2xl opacity-40 pointer-events-none" />

                {/* Central Clinical Medical Beacon SVG Artwork — 100% contained within bounds */}
                <svg
                  viewBox="0 0 420 420"
                  className="w-full h-full relative z-10 drop-shadow-sm"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Concentric Orbital Guide Rings */}
                  <circle cx="210" cy="210" r="148" stroke="#d6f2ff" strokeWidth="1.5" strokeDasharray="5 7" />
                  <circle cx="210" cy="210" r="106" stroke="#e8f8ff" strokeWidth="2" />
                  <circle cx="210" cy="210" r="68" fill="#ffffff" stroke="#244cff" strokeWidth="1.5" strokeOpacity="0.25" />

                  {/* Central Blue Medical Sphere Beacon */}
                  <circle cx="210" cy="210" r="48" fill="#244cff" fillOpacity="0.12" />
                  <circle cx="210" cy="210" r="38" fill="#244cff" />
                  <circle cx="210" cy="210" r="32" fill="#3056ff" />

                  {/* Medical Cross in Core */}
                  <rect x="205" y="194" width="10" height="32" rx="2.5" fill="#ffffff" />
                  <rect x="194" y="205" width="32" height="10" rx="2.5" fill="#ffffff" />

                  {/* Orbiting Capsule Satellites — carefully positioned away from viewBox edges */}
                  {/* 1. Top-Left: Morning Station */}
                  <g transform="translate(28, 78)">
                    <rect width="134" height="34" rx="17" fill="#ffffff" stroke="#fced9f" strokeWidth="1.5" />
                    <circle cx="17" cy="17" r="8" fill="#fced9f" />
                    <text x="32" y="21" fill="#1d1f21" fontSize="11" fontWeight="600" fontFamily="'Inter', sans-serif">Morning · 8 AM</text>
                  </g>

                  {/* 2. Top-Right: Scan Prescription */}
                  <g transform="translate(258, 78)">
                    <rect width="114" height="34" rx="17" fill="#e8f8ff" stroke="#244cff" strokeWidth="1.5" />
                    <circle cx="18" cy="17" r="5" fill="#244cff" />
                    <text x="32" y="21" fill="#244cff" fontSize="11" fontWeight="600" fontFamily="'Inter', sans-serif">Prescription</text>
                  </g>

                  {/* 3. Bottom-Left: Evening Station */}
                  <g transform="translate(28, 298)">
                    <rect width="134" height="34" rx="17" fill="#ffffff" stroke="#c3aeff" strokeWidth="1.5" />
                    <circle cx="17" cy="17" r="8" fill="#c3aeff" />
                    <text x="32" y="21" fill="#1d1f21" fontSize="11" fontWeight="600" fontFamily="'Inter', sans-serif">Evening · 8 PM</text>
                  </g>

                  {/* 4. Bottom-Right: Daily Reminder Alerts */}
                  <g transform="translate(258, 298)">
                    <rect width="114" height="34" rx="17" fill="#ffffff" stroke="#00c978" strokeWidth="1.5" />
                    <circle cx="18" cy="17" r="5" fill="#00c978" />
                    <text x="32" y="21" fill="#1d1f21" fontSize="11" fontWeight="600" fontFamily="'Inter', sans-serif">Daily Alerts</text>
                  </g>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          Process Pipeline Execution Bar
          ========================================================================= */}
      <section className="process-bar-section w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 my-14 overflow-hidden min-w-0">
        <div className="mb-3 text-center sm:text-left">
          <span className="font-['Inter'] text-xs font-semibold text-[#878787] tracking-wider uppercase">
            How it works
          </span>
        </div>
        <ProcessPipelineBar currentStage={3} />
      </section>

      {/* =========================================================================
          2x2 Feature Grid: Friendly, Human, and Clear
          ========================================================================= */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="mb-10 text-center sm:text-left">
          <h2 className="font-['Inter'] text-3xl sm:text-[38px] font-normal text-[#000000] tracking-[-0.02em] mb-2">
            Everything you need to stay on track
          </h2>
          <p className="font-['Inter'] text-[16px] text-[#2b2b2b]">
            From reading handwriting to daily reminders, CareSentry helps you manage your daily medications.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Prescription Scanning */}
          <div className="feature-grid-item card-ice flex flex-col justify-between interactive-card shadow-xs">
            <div className="space-y-4">
              <span className="badge-cobalt">Prescription Scanning</span>
              <h3 className="font-['Inter'] text-[24px] font-normal text-[#000000]">
                Scan your prescriptions
              </h3>
              <p className="font-['Inter'] text-[15px] text-[#2b2b2b] leading-relaxed">
                Take a clear picture of your paper prescription. We read handwritten and printed medicines, dosages, and instructions so you don't have to type them.
              </p>
              <ul className="space-y-2 text-xs text-[#2b2b2b] pt-2">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#244cff]" />
                  <span>Reads medicine names, dosages, and durations</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#244cff]" />
                  <span>Review and edit details before saving</span>
                </li>
              </ul>
            </div>
            <div className="pt-6 border-t border-[rgba(36,76,255,0.15)] mt-6">
              <button
                type="button"
                onClick={() => navigate("/upload")}
                className="text-xs font-semibold text-[#244cff] hover:underline cursor-pointer"
              >
                Scan a prescription →
              </button>
            </div>
          </div>

          {/* Card 2: Telegram Reminders */}
          <div className="feature-grid-item card-snow bg-[#c3aeff]/10 border border-[#c3aeff]/30 flex flex-col justify-between interactive-card shadow-xs">
            <div className="space-y-4">
              <span className="badge-lavender">Telegram Reminders</span>
              <h3 className="font-['Inter'] text-[24px] font-normal text-[#000000]">
                Daily reminder alerts
              </h3>
              <p className="font-['Inter'] text-[15px] text-[#2b2b2b] leading-relaxed">
                Connect your Telegram account in seconds. Get friendly, reliable notifications on your phone whenever it is time to take a pill.
              </p>
              <ul className="space-y-2 text-xs text-[#2b2b2b] pt-2">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1d1f21]" />
                  <span>Direct alerts via @RemindMyMedicineBot</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1d1f21]" />
                  <span>Morning, noon, evening, and bedtime reminders</span>
                </li>
              </ul>
            </div>
            <div className="pt-6 border-t border-[rgba(0,0,0,0.08)] mt-6">
              <button
                type="button"
                onClick={() => navigate("/schedule")}
                className="text-xs font-semibold text-[#1d1f21] hover:underline cursor-pointer"
              >
                View medication schedule →
              </button>
            </div>
          </div>

          {/* Card 3: Safety & Human Review */}
          <div className="feature-grid-item card-snow bg-[#fced9f]/15 border border-[#fced9f]/40 flex flex-col justify-between interactive-card shadow-xs">
            <div className="space-y-4">
              <span className="badge-parchment bg-white">Safety First</span>
              <h3 className="font-['Inter'] text-[24px] font-normal text-[#000000]">
                You're always in control
              </h3>
              <p className="font-['Inter'] text-[15px] text-[#2b2b2b] leading-relaxed">
                Always review extracted medicines against your physical paper slip. Confirm your schedule before turning on reminders, and consult your doctor or pharmacist if anything looks uncertain.
              </p>
              <ul className="space-y-2 text-xs text-[#2b2b2b] pt-2">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00c978]" />
                  <span>Check medicine names and quantities side-by-side</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00c978]" />
                  <span>Keep your doctor and pharmacy details organized</span>
                </li>
              </ul>
            </div>
            <div className="pt-6 border-t border-[rgba(0,0,0,0.08)] mt-6">
              <button
                type="button"
                onClick={() => navigate("/prescriptions")}
                className="text-xs font-semibold text-[#2b2b2b] hover:underline cursor-pointer"
              >
                View my prescriptions →
              </button>
            </div>
          </div>

          {/* Card 4: Symptom Checker */}
          <div className="feature-grid-item card-snow bg-[#d6f2ff]/20 border border-[#d6f2ff]/60 flex flex-col justify-between interactive-card shadow-xs">
            <div className="space-y-4">
              <span className="badge-ice">Symptom Checker</span>
              <h3 className="font-['Inter'] text-[24px] font-normal text-[#000000]">
                Check your symptoms
              </h3>
              <p className="font-['Inter'] text-[15px] text-[#2b2b2b] leading-relaxed">
                Choose the symptoms you're experiencing to see possible causes and helpful health guidance. Always consult a healthcare professional for diagnosis and medical care.
              </p>
              <ul className="space-y-2 text-xs text-[#2b2b2b] pt-2">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#244cff]" />
                  <span>Explore symptoms by body area</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#244cff]" />
                  <span>Clear health guidance and care recommendations</span>
                </li>
              </ul>
            </div>
            <div className="pt-6 border-t border-[rgba(36,76,255,0.15)] mt-6">
              <button
                type="button"
                onClick={() => navigate("/prediction")}
                className="text-xs font-semibold text-[#244cff] hover:underline cursor-pointer"
              >
                Check symptoms now →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Decorative Organic Halftone Wave Divider Ribbon */}
      <div
        className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 -mt-6 -mb-8 pointer-events-none opacity-25 overflow-hidden select-none"
        aria-hidden="true"
      >
        <img
          src="/assets/backgrounds/halftone-accent-wave.svg"
          alt=""
          className="w-full h-auto max-h-[120px] object-cover"
        />
      </div>

      {/* =========================================================================
          Clinical Walkthrough Video Section
          ========================================================================= */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="card-snow p-6 sm:p-8">
          <div className="max-w-xl mb-6">
            <span className="badge-ice mb-3">Video Guide</span>
            <h3 className="font-['Inter'] text-2xl sm:text-3xl font-normal text-[#000000] tracking-tight mb-2">
              See how CareSentry works
            </h3>
            <p className="font-['Inter'] text-sm text-[#2b2b2b]">
              Watch a quick two-minute walkthrough showing how to scan a prescription, set up reminders, and check your schedule.
            </p>
          </div>

          <div className="aspect-video rounded-[12px] overflow-hidden bg-[#1d1f21] border border-[rgba(0,0,0,0.1)]">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/CoUkLlziQEg"
              title="CareSentry Walkthrough"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
