import React, { useEffect, useState } from "react";
import api from "../api/axios.js";
import { 
  Calendar, 
  Plus, 
  Trash2, 
  Send, 
  Clock, 
  Sparkles, 
  ShieldCheck, 
  Sun, 
  Sunset, 
  Moon, 
  CheckCircle2, 
  Compass, 
  ArrowRight,
  Edit2,
  Check,
  X,
  AlertCircle,
  RefreshCw,
  Bell,
  Clock4
} from "lucide-react";
import ProcessPipelineBar from "./ProcessPipelineBar.jsx";

// 12-hour time formatter helper
const formatTime12h = (time24) => {
  if (!time24) return "08:00 AM";
  const [hStr, mStr] = String(time24).split(":");
  let h = parseInt(hStr, 10);
  const m = mStr || "00";
  if (isNaN(h)) return "08:00 AM";
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m.padStart(2, "0")} ${ampm}`;
};

// Circadian routine icon & label resolver
const getCircadianInfo = (time24) => {
  if (!time24) return { label: "Morning", icon: Sun, color: "text-[#9e770b]" };
  const [h] = String(time24).split(":").map(Number);
  if (h >= 5 && h < 12) return { label: "Morning", icon: Sun, color: "text-[#9e770b]" };
  if (h >= 12 && h < 17) return { label: "Afternoon", icon: Clock, color: "text-[#244cff]" };
  if (h >= 17 && h < 21) return { label: "Evening", icon: Sunset, color: "text-[#8a5cf6]" };
  return { label: "Night", icon: Moon, color: "text-[#1d1f21]" };
};

// Calculate exact end date, remaining days, and status
const calculateScheduleDates = (schedule) => {
  const start = schedule.startDate
    ? new Date(schedule.startDate)
    : schedule.createdAt
    ? new Date(schedule.createdAt)
    : new Date();

  let end;
  if (schedule.endDate) {
    end = new Date(schedule.endDate);
  } else {
    const dur = Number(schedule.duration) || 1;
    end = new Date(start.getTime() + dur * 24 * 60 * 60 * 1000);
    if (schedule.time) {
      const [hh, mm] = String(schedule.time).split(":").map(Number);
      if (!isNaN(hh)) end.setHours(hh, mm || 0, 0, 0);
    }
  }

  const now = new Date();
  const isSameDay =
    end.getFullYear() === now.getFullYear() &&
    end.getMonth() === now.getMonth() &&
    end.getDate() === now.getDate();

  const diffMs = end.getTime() - now.getTime();
  const daysRemaining = Math.max(0, Math.ceil(diffMs / (24 * 60 * 60 * 1000)));
  const isExpired =
    schedule.active === false ||
    (diffMs < 0 && !isSameDay) ||
    (schedule.remainingRuns !== undefined && schedule.remainingRuns <= 0);

  const formattedDate = end.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const formattedTime = formatTime12h(schedule.time || "08:00");

  return {
    start,
    end,
    formattedDate,
    formattedTime,
    isToday: isSameDay,
    isExpired,
    daysRemaining,
  };
};

export default function Scheduler({ extracted = null }) {
  const [chatId, setChatId] = useState(() => localStorage.getItem("medic_telegram_chat_id") || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedSchedules, setSavedSchedules] = useState([]);
  const [isLoadingSchedules, setIsLoadingSchedules] = useState(false);
  
  // Feedback toast
  const [feedback, setFeedback] = useState(null);

  // Editing state
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ medicine: "", dosage: "", time: "08:00", duration: 7 });
  const [savingId, setSavingId] = useState(null);

  // Extending state
  const [extendingId, setExtendingId] = useState(null);
  const [customExtendId, setCustomExtendId] = useState(null);
  const [customDays, setCustomDays] = useState(7);

  // Deleting state
  const [deletingId, setDeletingId] = useState(null);

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

  const showActionFeedback = (message, type = "success") => {
    setFeedback({ message, type });
    setTimeout(() => {
      setFeedback(null);
    }, 4500);
  };

  // Fetch active / queued schedules from DB
  const fetchSchedules = async (targetChatId = chatId) => {
    try {
      setIsLoadingSchedules(true);
      const res = await api.get("/schedules", {
        params: targetChatId ? { chatId: targetChatId.trim() } : {},
      });
      const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setSavedSchedules(data);
    } catch (err) {
      console.warn("Could not load schedules:", err?.message);
    } finally {
      setIsLoadingSchedules(false);
    }
  };

  useEffect(() => {
    fetchSchedules(chatId);
  }, []);

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
      : typeof extracted?.medications === "object" && extracted?.medications
      ? [extracted.medications]
      : [];

    if (!raw.length) return;

    const normalized = raw.map((p, idx) => ({
      id: Date.now() + idx,
      name: p.medicine || p.name || "",
      dosage: p.dosage || p.dose || "",
      time: "08:00",
      duration: p.duration || "7 days",
    }));

    setMedicines(normalized);
  }, [extracted]);

  const addMedicine = () => {
    const newMedicine = {
      id: Date.now(),
      name: "",
      dosage: "",
      time: "08:00",
      duration: "7 days",
    };
    setMedicines([...medicines, newMedicine]);
  };

  const removeMedicine = (id) => {
    if (medicines.length > 1) {
      setMedicines(medicines.filter((med) => med.id !== id));
    }
  };

  const updateMedicine = (id, field, value) => {
    setMedicines(
      medicines.map((med) => (med.id === id ? { ...med, [field]: value } : med))
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
        showActionFeedback(
          `Schedule activated! ${schedules.length} reminder ${
            schedules.length === 1 ? "notification" : "notifications"
          } queued for Telegram Chat ID ${chatId.trim()}.`
        );
        setMedicines([
          { id: Date.now(), name: "", dosage: "", time: "08:00", duration: "7 days" },
        ]);
        await fetchSchedules(chatId.trim());
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

  // Handle edit schedule
  const handleStartEdit = (s) => {
    setEditingId(s._id);
    setEditForm({
      medicine: s.medicine || "",
      dosage: s.dosage || "",
      time: s.time || "08:00",
      duration: s.duration || 7,
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({ medicine: "", dosage: "", time: "08:00", duration: 7 });
  };

  const handleSaveEdit = async (id) => {
    if (!editForm.medicine.trim()) {
      alert("Medicine name is required.");
      return;
    }
    try {
      setSavingId(id);
      const res = await api.put(`/schedules/${id}`, editForm);
      if (res?.data?.success) {
        showActionFeedback(`Reminder for "${editForm.medicine}" updated successfully!`);
        setEditingId(null);
        await fetchSchedules(chatId);
      } else {
        throw new Error(res?.data?.message || "Failed to update reminder");
      }
    } catch (err) {
      alert("Failed to update reminder: " + (err?.response?.data?.message || err.message));
    } finally {
      setSavingId(null);
    }
  };

  // Handle extend duration
  const handleExtend = async (id, days) => {
    try {
      setExtendingId(id);
      const res = await api.patch(`/schedules/${id}/extend`, { days: Number(days) });
      if (res?.data?.success) {
        showActionFeedback(`Medication reminder extended by +${days} days!`);
        setCustomExtendId(null);
        await fetchSchedules(chatId);
      } else {
        throw new Error(res?.data?.message || "Failed to extend reminder");
      }
    } catch (err) {
      alert("Failed to extend reminder: " + (err?.response?.data?.message || err.message));
    } finally {
      setExtendingId(null);
    }
  };

  // Handle remove schedule
  const handleDelete = async (id, medName) => {
    if (
      !window.confirm(
        `Are you sure you want to remove the reminder for "${medName}"? This will cancel all upcoming Telegram notifications.`
      )
    ) {
      return;
    }
    try {
      setDeletingId(id);
      const res = await api.delete(`/schedules/${id}`);
      if (res?.data?.success) {
        showActionFeedback(`Reminder for "${medName}" removed.`);
        await fetchSchedules(chatId);
      } else {
        throw new Error(res?.data?.message || "Failed to remove reminder");
      }
    } catch (err) {
      alert("Failed to remove reminder: " + (err?.response?.data?.message || err.message));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 pb-12">
      {/* Process Pipeline Status Bar */}
      <ProcessPipelineBar currentStage={5} />

      {/* Main Studio Card */}
      <div className="card-snow bg-clinical-pattern relative overflow-hidden space-y-8">
        {/* Circadian Top Hero Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center pb-8 border-b border-[rgba(0,0,0,0.08)]">
          {/* Left Column: Heading & Routine Context (7 Cols) */}
          <div className="lg:col-span-7">
            <div className="flex items-center gap-2 mb-2">
              <span className="badge-ice">Daily Schedule</span>
            </div>
            <h2 className="font-['Inter'] text-2xl sm:text-3xl font-normal text-[#000000] tracking-tight">
              My medication schedule
            </h2>
            <p className="font-['Inter'] text-sm text-[#2b2b2b] mt-2 leading-relaxed">
              Set your medicine times and connect Telegram to receive helpful reminders on your phone.
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-4">
              <span className="badge-parchment text-xs font-mono">
                {savedSchedules.length} {savedSchedules.length === 1 ? "notification" : "notifications"} queued
              </span>
              <span className="text-xs text-[#00c978] font-medium flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#00c978] animate-pulse" />
                <span>
                  {savedSchedules.length > 0 ? "Daily reminders active" : "Reminders ready"}
                </span>
              </span>
            </div>
          </div>

          {/* Right Column: Custom Circadian Routine Illustration (5 Cols) */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-xs sm:max-w-sm animate-float-slow">
              <img
                src="/assets/illustrations/medication-routine.svg"
                alt="Daily Medication Routine Timeline"
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

        {/* ========================================================================= */}
        {/* SECTION 1: QUEUED NOTIFICATIONS & ACTIVE REMINDERS (PRIMARY UPGRADE)      */}
        {/* ========================================================================= */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[rgba(0,0,0,0.06)]">
            <div>
              <h3 className="font-['Inter'] text-base font-semibold text-[#000000] flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#244cff]" />
                <span>Queued Notifications & Timeline</span>
                <span className="badge-parchment text-xs font-mono font-normal">
                  {savedSchedules.length}
                </span>
              </h3>
              <p className="text-xs text-[#878787] mt-0.5">
                Active alerts sent to Telegram with scheduled completion dates and extension options.
              </p>
            </div>

            <button
              type="button"
              onClick={() => fetchSchedules(chatId)}
              disabled={isLoadingSchedules}
              className="btn-outline-pill text-xs py-1 px-3 self-start sm:self-auto flex items-center gap-1.5 hover:border-[#244cff]"
              title="Refresh scheduled reminders"
            >
              <RefreshCw className={`w-3 h-3 ${isLoadingSchedules ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>

          {/* List of Queued Notifications */}
          {isLoadingSchedules ? (
            <div className="p-8 text-center text-xs text-[#878787] space-y-2 bg-white rounded-[8px] border border-[rgba(0,0,0,0.06)]">
              <RefreshCw className="w-5 h-5 mx-auto animate-spin text-[#244cff]" />
              <p>Loading queued notifications...</p>
            </div>
          ) : savedSchedules.length === 0 ? (
            <div className="p-8 text-center bg-[#ffffff] rounded-[10px] border border-[rgba(0,0,0,0.08)] space-y-3">
              <div className="w-10 h-10 rounded-full bg-[#f4f7ff] text-[#244cff] flex items-center justify-center mx-auto">
                <Clock4 className="w-5 h-5" />
              </div>
              <h4 className="font-semibold text-sm text-[#000000]">No notifications queued yet</h4>
              <p className="text-xs text-[#878787] max-w-md mx-auto">
                You do not have any active Telegram reminders scheduled yet. Add your medications below or scan a prescription to start receiving automatic dose alerts.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {savedSchedules.map((schedule) => {
                const dates = calculateScheduleDates(schedule);
                const circadian = getCircadianInfo(schedule.time);
                const CircadianIcon = circadian.icon;
                const isEditing = editingId === schedule._id;
                const isCustomExtending = customExtendId === schedule._id;

                return (
                  <div
                    key={schedule._id}
                    className="p-5 rounded-[10px] bg-[#ffffff] border border-[rgba(0,0,0,0.08)] hover:border-[rgba(36,76,255,0.25)] transition-all shadow-xs space-y-4"
                  >
                    {isEditing ? (
                      /* Inline Edit Form */
                      <div className="space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b border-[rgba(0,0,0,0.06)]">
                          <span className="font-semibold text-xs text-[#244cff] uppercase tracking-wider flex items-center gap-1.5">
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Editing Reminder</span>
                          </span>
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="text-xs text-[#878787] hover:text-[#000000] p-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                          <div>
                            <label className="block text-[11px] font-semibold text-[#878787] uppercase tracking-wider mb-1">
                              Medicine Name
                            </label>
                            <input
                              type="text"
                              value={editForm.medicine}
                              onChange={(e) =>
                                setEditForm({ ...editForm, medicine: e.target.value })
                              }
                              className="input-mage text-xs"
                              placeholder="e.g. Amoxicillin"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-[#878787] uppercase tracking-wider mb-1">
                              Dosage
                            </label>
                            <input
                              type="text"
                              value={editForm.dosage}
                              onChange={(e) =>
                                setEditForm({ ...editForm, dosage: e.target.value })
                              }
                              className="input-mage text-xs"
                              placeholder="e.g. 500mg"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-[#878787] uppercase tracking-wider mb-1">
                              Time (24h)
                            </label>
                            <input
                              type="time"
                              value={editForm.time}
                              onChange={(e) =>
                                setEditForm({ ...editForm, time: e.target.value })
                              }
                              className="input-mage text-xs font-mono"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-[#878787] uppercase tracking-wider mb-1">
                              Duration (Days)
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={editForm.duration}
                              onChange={(e) =>
                                setEditForm({ ...editForm, duration: e.target.value })
                              }
                              className="input-mage text-xs font-mono"
                            />
                          </div>
                        </div>

                        {/* Circadian Quick Select for Edit */}
                        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                          <span className="text-[#878787] text-[11px] font-medium">Quick Time:</span>
                          {[
                            { label: "Morning", time: "08:00" },
                            { label: "Noon", time: "12:00" },
                            { label: "Evening", time: "18:00" },
                            { label: "Night", time: "22:00" },
                          ].map((slot) => (
                            <button
                              key={slot.time}
                              type="button"
                              onClick={() => setEditForm({ ...editForm, time: slot.time })}
                              className={`text-xs px-2.5 py-0.5 rounded-full border transition-all ${
                                editForm.time === slot.time
                                  ? "bg-[#244cff] text-white border-[#244cff]"
                                  : "bg-[#f7f7f1] text-[#2b2b2b] border-[rgba(0,0,0,0.08)]"
                              }`}
                            >
                              {slot.label} ({slot.time})
                            </button>
                          ))}
                        </div>

                        {/* Save / Cancel buttons */}
                        <div className="flex items-center justify-end gap-2 pt-2">
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            disabled={savingId === schedule._id}
                            className="btn-outline-pill text-xs py-1.5 px-3"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(schedule._id)}
                            disabled={savingId === schedule._id}
                            className="btn-cobalt text-xs py-1.5 px-4 shadow-xs"
                          >
                            {savingId === schedule._id ? "Saving..." : "Save changes"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Standard Display View */
                      <>
                        {/* Header Row: Title, Dosage, Time & Actions */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[rgba(0,0,0,0.06)]">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-sm sm:text-base text-[#000000]">
                              {schedule.medicine}
                            </span>
                            {schedule.dosage && (
                              <span className="badge-ice text-xs">{schedule.dosage}</span>
                            )}
                            <span className="inline-flex items-center gap-1 text-xs font-mono text-[#2b2b2b] px-2 py-0.5 rounded bg-[#f7f7f1] border border-[rgba(0,0,0,0.06)]">
                              <CircadianIcon className={`w-3.5 h-3.5 ${circadian.color}`} />
                              <span>{dates.formattedTime}</span>
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {/* Status badge */}
                            {dates.isToday ? (
                              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#fff4e5] text-[#b45309] border border-[#fde68a] flex items-center gap-1.5 animate-pulse">
                                <AlertCircle className="w-3.5 h-3.5" />
                                <span>Ending today (Final dose)</span>
                              </span>
                            ) : dates.isExpired ? (
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#f3f4f6] text-[#6b7280]">
                                Course completed
                              </span>
                            ) : (
                              <span className="badge-ice text-xs font-medium flex items-center gap-1">
                                <Clock className="w-3 h-3 text-[#244cff]" />
                                <span>
                                  {dates.daysRemaining} {dates.daysRemaining === 1 ? "day" : "days"} remaining
                                </span>
                              </span>
                            )}

                            {/* Edit Action Button */}
                            <button
                              type="button"
                              onClick={() => handleStartEdit(schedule)}
                              className="text-xs text-[#244cff] hover:bg-[#f4f7ff] p-1.5 rounded-[6px] border border-transparent hover:border-[rgba(36,76,255,0.2)] cursor-pointer flex items-center gap-1"
                              title="Edit reminder"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Edit</span>
                            </button>

                            {/* Remove Action Button */}
                            <button
                              type="button"
                              onClick={() => handleDelete(schedule._id, schedule.medicine)}
                              disabled={deletingId === schedule._id}
                              className="text-xs text-[#ff2b3a] hover:bg-[#fff1f2] p-1.5 rounded-[6px] border border-transparent hover:border-[rgba(255,43,58,0.2)] cursor-pointer flex items-center gap-1"
                              title="Remove reminder"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">
                                {deletingId === schedule._id ? "Removing..." : "Remove"}
                              </span>
                            </button>
                          </div>
                        </div>

                        {/* Scheduled Timeline Bar (Till what date and time) */}
                        <div className="p-3.5 rounded-[8px] bg-[#fbfbfa] border border-[rgba(0,0,0,0.06)] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                          <div className="space-y-0.5">
                            <span className="text-[#878787] text-[11px] font-semibold uppercase tracking-wider block">
                              Scheduled Until
                            </span>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-[#244cff]" />
                              <span className="font-semibold text-sm text-[#000000]">
                                {dates.formattedDate} at {dates.formattedTime}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-[#2b2b2b]">
                            <div>
                              <span className="text-[#878787]">Course Duration: </span>
                              <strong>{schedule.duration || 1} days</strong>
                            </div>
                            {schedule.remainingRuns !== undefined && (
                              <div>
                                <span className="text-[#878787]">Doses Left: </span>
                                <strong>{schedule.remainingRuns}</strong>
                              </div>
                            )}
                            {schedule.chatId && (
                              <span className="badge-parchment font-mono text-[11px] text-[#2b2b2b]">
                                Telegram: •••{String(schedule.chatId).slice(-4)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Option on that day or anytime to continue / extend duration */}
                        <div
                          className={`p-3.5 rounded-[8px] ${
                            dates.isToday
                              ? "bg-[#fffbeb] border border-[#fde68a]"
                              : "bg-[#f4f7ff] border border-[rgba(36,76,255,0.12)]"
                          } flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs`}
                        >
                          <div className="flex items-start sm:items-center gap-2.5">
                            <Sparkles
                              className={`w-4 h-4 shrink-0 ${
                                dates.isToday ? "text-[#b45309]" : "text-[#244cff]"
                              }`}
                            />
                            <div>
                              <span className="font-semibold text-[#000000] block sm:inline">
                                {dates.isToday
                                  ? "Dose course finishes today! Extend or continue?"
                                  : dates.isExpired
                                  ? "Prescription course finished. Would you like to extend?"
                                  : "Need to continue or extend this medication course?"}
                              </span>
                              <span className="text-[#6b7280] text-[11px] sm:ml-2 block sm:inline">
                                Choose additional days to keep receiving Telegram reminders.
                              </span>
                            </div>
                          </div>

                          {/* Quick Extend Buttons */}
                          <div className="flex flex-wrap items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleExtend(schedule._id, 3)}
                              disabled={extendingId === schedule._id}
                              className="btn-outline-pill text-xs py-1 px-2.5 bg-white hover:border-[#244cff]"
                            >
                              +3 Days
                            </button>
                            <button
                              type="button"
                              onClick={() => handleExtend(schedule._id, 7)}
                              disabled={extendingId === schedule._id}
                              className="btn-cobalt text-xs py-1 px-3 shadow-xs"
                            >
                              +7 Days (1 Wk)
                            </button>
                            <button
                              type="button"
                              onClick={() => handleExtend(schedule._id, 14)}
                              disabled={extendingId === schedule._id}
                              className="btn-outline-pill text-xs py-1 px-2.5 bg-white hover:border-[#244cff]"
                            >
                              +14 Days
                            </button>

                            {/* Custom Extend Toggle */}
                            <button
                              type="button"
                              onClick={() =>
                                setCustomExtendId(isCustomExtending ? null : schedule._id)
                              }
                              className="text-xs text-[#244cff] hover:underline font-medium px-1"
                            >
                              {isCustomExtending ? "Cancel" : "Custom..."}
                            </button>
                          </div>
                        </div>

                        {/* Custom Days Input Drawer */}
                        {isCustomExtending && (
                          <div className="p-3 bg-[#fbfbfa] rounded-[8px] border border-[rgba(0,0,0,0.08)] flex flex-wrap items-center gap-3 text-xs animate-fade-in">
                            <span className="font-medium text-[#2b2b2b]">
                              Extend {schedule.medicine} by:
                            </span>
                            <input
                              type="number"
                              min="1"
                              max="90"
                              value={customDays}
                              onChange={(e) => setCustomDays(e.target.value)}
                              className="input-mage text-xs font-mono w-20 py-1"
                            />
                            <span className="text-[#878787]">days</span>
                            <button
                              type="button"
                              onClick={() => handleExtend(schedule._id, customDays)}
                              disabled={extendingId === schedule._id}
                              className="btn-cobalt text-xs py-1 px-3 shadow-xs"
                            >
                              {extendingId === schedule._id ? "Extending..." : "Apply Extension"}
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Telegram Bot Setup Banner */}
        <div className="card-ice p-5 sm:p-6 space-y-4 shadow-xs interactive-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#244cff] flex items-center justify-center text-white shrink-0 shadow-xs">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-['Inter'] font-semibold text-sm text-[#000000]">
                  Connect to Telegram
                </h3>
                <p className="text-xs text-[#2b2b2b]">Get reminder messages sent directly to your Telegram chat.</p>
              </div>
            </div>
            <span className="badge-cobalt text-[10px]">Telegram alerts</span>
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
              Your Telegram Chat ID
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                id="telegram-chat-id"
                value={chatId}
                onChange={(e) => handleChatIdChange(e.target.value)}
                placeholder="e.g. 123456789"
                className="input-mage text-sm"
              />
              <button
                type="button"
                onClick={() => fetchSchedules(chatId)}
                className="btn-outline-pill text-xs py-1.5 px-3 shrink-0"
              >
                Sync
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 2: ADD NEW MEDICATION REMINDERS FORM                             */}
        {/* ========================================================================= */}
        <div className="space-y-6 pt-4 border-t border-[rgba(0,0,0,0.08)]">
          <div className="flex items-center justify-between">
            <h3 className="font-['Inter'] text-sm font-semibold text-[#000000] flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#244cff]" />
              <span>Schedule New Medication Doses</span>
            </h3>
            <span className="text-xs text-[#878787]">
              Specify dosage, time, and duration
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
              className="btn-cobalt w-full sm:w-auto interactive-pill"
              style={{ height: "42px", padding: "0 26px" }}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              <span>{isSubmitting ? "Saving schedule..." : "Turn on daily reminders"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
