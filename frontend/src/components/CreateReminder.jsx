import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api/axios.js";
import { 
  Plus, 
  Trash2, 
  Send, 
  Clock, 
  Sparkles, 
  ShieldCheck, 
  Sun, 
  Sunset, 
  Moon, 
  Compass, 
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Calendar,
  X
} from "lucide-react";
import ProcessPipelineBar from "./ProcessPipelineBar.jsx";

export default function CreateReminder({ extracted: propExtracted = null }) {
  const navigate = useNavigate();
  const location = useLocation();
  const extracted = propExtracted || location.state?.prefill || null;

  const [chatId, setChatId] = useState(() => localStorage.getItem("medic_telegram_chat_id") || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // New medication creation draft form
  const [medicines, setMedicines] = useState([
    {
      id: 1,
      name: "",
      dosage: "",
      time: "08:00",
      duration: "7 days",
    },
  ]);

  // Sync Telegram Chat ID with localStorage
  const handleChatIdChange = (val) => {
    setChatId(val);
    localStorage.setItem("medic_telegram_chat_id", val);
  };

  // Auto-fill medicines from extracted scan data (name, dosage, duration)
  useEffect(() => {
    if (!extracted) return;

    const isFormEmpty =
      medicines.length === 1 &&
      !medicines[0].name &&
      !medicines[0].dosage;

    if (!isFormEmpty) return;

    const raw = Array.isArray(extracted?.prescription)
      ? extracted.prescription
      : Array.isArray(extracted?.medications)
      ? extracted.medications
      : [];

    if (raw.length > 0) {
      const mapped = raw.map((item, idx) => {
        let suggestedTime = "08:00";
        const freq = String(item.frequency || item.freq || "").toLowerCase();
        if (freq.includes("night") || freq.includes("bed")) suggestedTime = "22:00";
        else if (freq.includes("evening") || freq.includes("pm")) suggestedTime = "18:00";
        else if (freq.includes("afternoon") || freq.includes("noon")) suggestedTime = "12:00";

        let suggestedDuration = "7 days";
        if (item.duration) {
          suggestedDuration = String(item.duration).includes("day")
            ? String(item.duration)
            : `${item.duration} days`;
        }

        return {
          id: Date.now() + idx,
          name: item.medicine || item.name || "",
          dosage: item.dosage || item.dose || "",
          time: suggestedTime,
          duration: suggestedDuration,
        };
      });

      setMedicines(mapped);
      setFeedback({
        message: `Auto-filled ${mapped.length} medication(s) from prescription scan! Review and activate below.`,
        type: "success",
      });
    }
  }, [extracted]);

  // Form management helpers
  const addMedicine = () => {
    setMedicines((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: "",
        dosage: "",
        time: "08:00",
        duration: "7 days",
      },
    ]);
  };

  const removeMedicine = (id) => {
    if (medicines.length === 1) return;
    setMedicines((prev) => prev.filter((m) => m.id !== id));
  };

  const updateMedicine = (id, field, value) => {
    setMedicines((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  const setPresetTime = (id, timeVal) => {
    updateMedicine(id, "time", timeVal);
  };

  // Handle schedule creation
  const handleCreateSchedule = async () => {
    if (!chatId.trim()) {
      alert("Please enter your Telegram Chat ID so our notification system can deliver reminder alerts.");
      return;
    }

    const incompleteMedicine = medicines.find(
      (med) => !med.name.trim() || !med.dosage.trim() || !med.time.trim() || !med.duration.trim()
    );

    if (incompleteMedicine) {
      alert("Please complete the medicine name, dosage, time, and duration for each medication.");
      return;
    }

    const parseDurationDays = (s) => {
      if (!s) return 1;
      const str = String(s).toLowerCase().trim();
      const numMatch = str.match(/(\d+)/);
      const num = numMatch ? Number(numMatch[1]) : NaN;
      if (isNaN(num)) return 1;
      if (str.includes("week")) return num * 7;
      if (str.includes("month")) return num * 30;
      return num;
    };

    const schedules = medicines.map((med) => ({
      medicine: med.name,
      dosage: med.dosage,
      time: med.time,
      duration: parseDurationDays(med.duration),
    }));

    const payload = { chatId: chatId.trim(), schedules };

    setIsSubmitting(true);
    try {
      const res = await api.post("/schedules", payload);
      if (res?.data?.success) {
        // Navigate to /schedule with success feedback
        navigate("/schedule", {
          state: {
            feedback: `Schedule activated! ${schedules.length} reminder ${
              schedules.length === 1 ? "notification" : "notifications"
            } queued for Telegram Chat ID ${chatId.trim()}.`,
          },
        });
      } else {
        throw new Error(res?.data?.message || "Failed to create schedule");
      }
    } catch (err) {
      console.error("Create schedule failed:", err);
      alert("Failed to activate schedule: " + (err?.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Process Pipeline Status Bar */}
      <ProcessPipelineBar currentStage={5} />

      {/* Main Studio Card */}
      <div className="card-snow bg-clinical-pattern relative overflow-hidden space-y-8">
        {/* Top Hero Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center pb-8 border-b border-[rgba(0,0,0,0.08)]">
          {/* Left Column: Heading & Description */}
          <div className="lg:col-span-7">
            <div className="flex items-center gap-2 mb-2">
              <span className="badge-ice">New Reminder</span>
            </div>
            <h2 className="font-['Inter'] text-2xl sm:text-3xl font-normal text-[#000000] tracking-tight">
              Set Medication Reminders
            </h2>
            <p className="font-['Inter'] text-sm text-[#2b2b2b] mt-2 leading-relaxed">
              Configure your daily medicine times, dosage frequency, and connect Telegram for automated dose alerts.
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-4">
              <button
                type="button"
                onClick={() => navigate("/schedule")}
                className="btn-outline-pill text-xs px-3.5 py-1.5 inline-flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>View Active Schedule</span>
              </button>
            </div>
          </div>

          {/* Right Column: Routine Illustration */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-xs sm:max-w-sm animate-float-slow">
              <img
                src="/assets/illustrations/medication-routine.svg"
                alt="Medication Setup"
                className="w-full h-auto drop-shadow-md"
              />
            </div>
          </div>
        </div>

        {/* Action Feedback Banner */}
        {feedback && (
          <div className="p-3.5 rounded-[8px] bg-[#ecfdf5] border border-[#a7f3d0] text-xs text-[#065f46] flex items-center justify-between shadow-xs animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
              <span className="font-medium">{feedback.message}</span>
            </div>
            <button
              onClick={() => setFeedback(null)}
              className="text-[#059669] hover:text-[#065f46] p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Telegram Bot Setup Banner */}
        <div className="card-ice p-5 sm:p-6 space-y-4 shadow-xs interactive-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#244cff] flex items-center justify-center text-white shrink-0 shadow-xs">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-['Inter'] font-semibold text-sm text-[#000000]">
                  Telegram Notification Target
                </h3>
                <p className="text-xs text-[#2b2b2b]">Enter your Telegram Chat ID where dose reminders should be delivered.</p>
              </div>
            </div>
            <span className="badge-cobalt text-[10px]">Step 1: Connect Bot</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-white/70 p-3.5 rounded-[8px] border border-[rgba(36,76,255,0.15)]">
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-[#244cff] text-white text-[11px] font-bold flex items-center justify-center shrink-0">1</span>
              <div>
                <span className="text-[#878787] block">Open bot in Telegram:</span>
                <a
                  href="http://t.me/RemindMyMedicineBot"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#244cff] font-semibold underline flex items-center gap-1 mt-0.5"
                >
                  <span>@RemindMyMedicineBot</span>
                  <ArrowRight className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-[#1d1f21] text-white text-[11px] font-bold flex items-center justify-center shrink-0">2</span>
              <div>
                <span className="text-[#878787] block">Retrieve numeric ID:</span>
                <a
                  href="https://t.me/userinfobot"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#1d1f21] font-semibold underline flex items-center gap-1 mt-0.5"
                >
                  <span>Get ID via @userinfobot</span>
                  <ArrowRight className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          <div className="max-w-md pt-1">
            <label htmlFor="telegram-chat-id" className="block text-xs font-semibold text-[#000000] mb-1.5">
              Your Telegram Chat ID <span className="text-[#ff2b3a]">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                id="telegram-chat-id"
                value={chatId}
                onChange={(e) => handleChatIdChange(e.target.value)}
                placeholder="e.g. 123456789"
                className="input-mage text-xs flex-1"
              />
              <span className="inline-flex items-center px-3 text-xs bg-white text-[#878787] border border-[rgba(0,0,0,0.1)] rounded-[6px]">
                {chatId.trim() ? "Connected" : "Required"}
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ADD NEW MEDICATION REMINDERS FORM                                         */}
        {/* ========================================================================= */}
        <div className="space-y-6 pt-2">
          <div className="flex items-center justify-between pb-2 border-b border-[rgba(0,0,0,0.06)]">
            <h3 className="font-['Inter'] text-sm font-semibold text-[#000000] flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#244cff]" />
              <span>Medication Doses & Timing</span>
            </h3>
            <span className="text-xs text-[#878787]">
              Specify medicine name, dosage, time, and duration
            </span>
          </div>

          <div className="space-y-4">
            {medicines.map((med, index) => (
              <div
                key={med.id}
                className="p-5 rounded-[8px] bg-[#ffffff] border border-[rgba(0,0,0,0.08)] space-y-4 interactive-card shadow-xs"
              >
                {/* Row Header */}
                <div className="flex items-center justify-between pb-3 border-b border-[rgba(0,0,0,0.06)]">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-[#244cff] text-white text-[11px] font-bold flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="font-semibold text-sm text-[#000000]">
                      {med.name || "New Medication"}
                    </span>
                    {med.dosage && (
                      <span className="badge-ice text-xs">{med.dosage}</span>
                    )}
                  </div>

                  {medicines.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMedicine(med.id)}
                      className="text-xs text-[#ff2b3a] hover:underline cursor-pointer flex items-center gap-1 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>

                {/* Grid Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  {/* Medicine Name */}
                  <div>
                    <label className="block text-[11px] font-semibold text-[#878787] uppercase tracking-wider mb-1">
                      Medicine Name
                    </label>
                    <input
                      type="text"
                      value={med.name}
                      onChange={(e) => updateMedicine(med.id, "name", e.target.value)}
                      placeholder="e.g. Amoxicillin"
                      className="input-mage text-xs"
                    />
                  </div>

                  {/* Dosage */}
                  <div>
                    <label className="block text-[11px] font-semibold text-[#878787] uppercase tracking-wider mb-1">
                      Dosage
                    </label>
                    <input
                      type="text"
                      value={med.dosage}
                      onChange={(e) => updateMedicine(med.id, "dosage", e.target.value)}
                      placeholder="e.g. 500mg, 1 tablet"
                      className="input-mage text-xs"
                    />
                  </div>

                  {/* Scheduled Time */}
                  <div>
                    <label className="block text-[11px] font-semibold text-[#878787] uppercase tracking-wider mb-1">
                      Time (24h)
                    </label>
                    <input
                      type="time"
                      value={med.time}
                      onChange={(e) => updateMedicine(med.id, "time", e.target.value)}
                      className="input-mage text-xs font-mono"
                    />
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="block text-[11px] font-semibold text-[#878787] uppercase tracking-wider mb-1">
                      Duration
                    </label>
                    <input
                      type="text"
                      value={med.duration}
                      onChange={(e) => updateMedicine(med.id, "duration", e.target.value)}
                      placeholder="e.g. 7 days"
                      className="input-mage text-xs"
                    />
                  </div>
                </div>

                {/* Quick Circadian Preset Pills with Icons */}
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                  <span className="text-[#878787] text-[11px] font-medium">Circadian Preset:</span>
                  {[
                    { label: "Morning", time: "08:00", icon: Sun, color: "text-[#9e770b]" },
                    { label: "Noon", time: "12:00", icon: Clock, color: "text-[#244cff]" },
                    { label: "Evening", time: "18:00", icon: Sunset, color: "text-[#c3aeff]" },
                    { label: "Night", time: "22:00", icon: Moon, color: "text-[#1d1f21]" },
                  ].map((slot) => {
                    const SlotIcon = slot.icon;
                    const isSelected = med.time === slot.time;
                    return (
                      <button
                        key={slot.time}
                        type="button"
                        onClick={() => setPresetTime(med.id, slot.time)}
                        className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full cursor-pointer transition-all interactive-pill ${
                          isSelected
                            ? "bg-[#244cff] text-white font-semibold shadow-xs"
                            : "bg-[#f7f7f1] text-[#2b2b2b] border border-[rgba(0,0,0,0.08)] hover:border-[#244cff]"
                        }`}
                      >
                        <SlotIcon className={`w-3 h-3 ${isSelected ? "text-white" : slot.color}`} />
                        <span>{slot.label} ({slot.time})</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Add Another Medicine Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={addMedicine}
              className="btn-outline-pill text-xs interactive-pill"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>Add another medicine</span>
            </button>
          </div>

          {/* Activate Action Bar */}
          <div className="pt-6 border-t border-[rgba(0,0,0,0.08)] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-[#878787]">
              <ShieldCheck className="w-4 h-4 text-[#00c978]" />
              <span>Reminders will be sent daily to Telegram at your chosen times.</span>
            </div>

            <button
              type="button"
              onClick={handleCreateSchedule}
              disabled={isSubmitting}
              className="btn-cobalt w-full sm:w-auto interactive-pill cursor-pointer"
              style={{ height: "42px", padding: "0 26px" }}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              <span>{isSubmitting ? "Activating schedule..." : "Turn on daily reminders"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

