import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api/axios.js";
import { 
  Calendar, 
  Plus, 
  Clock, 
  Sparkles, 
  Sun, 
  Sunset, 
  Moon, 
  CheckCircle2, 
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

export default function ScheduleTimeline() {
  const navigate = useNavigate();
  const location = useLocation();
  const [chatId] = useState(() => localStorage.getItem("medic_telegram_chat_id") || "");
  const [savedSchedules, setSavedSchedules] = useState([]);
  const [isLoadingSchedules, setIsLoadingSchedules] = useState(false);
  
  // Feedback toast
  const [feedback, setFeedback] = useState(() => location.state?.feedback ? { message: location.state.feedback, type: "success" } : null);

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
    <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Process Pipeline Status Bar */}
      <ProcessPipelineBar currentStage={5} />

      {/* Main Studio Card */}
      <div className="card-snow bg-clinical-pattern relative overflow-hidden space-y-8">
        {/* Circadian Top Hero Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center pb-8 border-b border-[rgba(0,0,0,0.08)]">
          {/* Left Column: Heading & Routine Context (7 Cols) */}
          <div className="lg:col-span-7">
            <div className="flex items-center gap-2 mb-2">
              <span className="badge-ice">Active Schedule</span>
            </div>
            <h2 className="font-['Inter'] text-2xl sm:text-3xl font-normal text-[#000000] tracking-tight">
              My medication schedule
            </h2>
            <p className="font-['Inter'] text-sm text-[#2b2b2b] mt-2 leading-relaxed">
              Track your queued medication timeline and manage live dose notifications sent to your Telegram chat.
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

              <button
                type="button"
                onClick={() => navigate("/set-reminder")}
                className="btn-cobalt text-xs px-3.5 py-1.5 rounded-full inline-flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Set New Reminder</span>
              </button>
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
        {/* QUEUED NOTIFICATIONS & TIMELINE LIST                                      */}
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

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fetchSchedules(chatId)}
                disabled={isLoadingSchedules}
                className="btn-outline-pill text-xs flex items-center gap-1.5 py-1 px-3"
                title="Refresh active reminders"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSchedules ? "animate-spin" : ""}`} />
                <span>Refresh</span>
              </button>

              <button
                type="button"
                onClick={() => navigate("/set-reminder")}
                className="btn-cobalt text-xs flex items-center gap-1.5 py-1 px-3 rounded-full"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Reminder</span>
              </button>
            </div>
          </div>

          {/* List of Queued Notifications */}
          {isLoadingSchedules && savedSchedules.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#878787] bg-white/60 rounded-[8px] border border-dashed border-[rgba(0,0,0,0.1)]">
              <RefreshCw className="w-5 h-5 mx-auto mb-2 animate-spin text-[#244cff]" />
              <p>Loading queued notifications...</p>
            </div>
          ) : savedSchedules.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#878787] bg-white/60 rounded-[8px] border border-dashed border-[rgba(0,0,0,0.1)] space-y-3">
              <Calendar className="w-7 h-7 mx-auto text-[#878787]/60" />
              <div className="max-w-md mx-auto space-y-1">
                <p className="font-semibold text-sm text-[#000000]">No active reminders queued</p>
                <p className="text-xs text-[#878787]">
                  You do not have any active Telegram reminders scheduled yet. Add your medications or scan a prescription to start receiving automatic dose alerts.
                </p>
              </div>
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => navigate("/set-reminder")}
                  className="btn-cobalt text-xs px-4 py-2 rounded-full inline-flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Set Your First Reminder</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {savedSchedules.map((schedule) => {
                const dates = calculateScheduleDates(schedule);
                const circadian = getCircadianInfo(schedule.time);
                const CircadianIcon = circadian.icon;
                const isEditing = editingId === schedule._id;

                return (
                  <div
                    key={schedule._id}
                    className={`p-4 sm:p-5 rounded-[8px] bg-white border transition-all ${
                      dates.isExpired
                        ? "border-[#ff2b3a]/30 bg-[#fff5f5]/30 opacity-75"
                        : "border-[rgba(0,0,0,0.08)] hover:border-[#244cff]/40 shadow-xs"
                    }`}
                  >
                    {isEditing ? (
                      /* Inline Edit Form */
                      <div className="space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b border-[rgba(0,0,0,0.06)]">
                          <span className="font-semibold text-xs text-[#244cff]">Editing Reminder</span>
                          <span className="text-[11px] text-[#878787]">Change dosage, time, or duration</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                          <div>
                            <label className="block text-[11px] font-semibold text-[#878787] mb-1">Medicine</label>
                            <input
                              type="text"
                              value={editForm.medicine}
                              onChange={(e) => setEditForm((f) => ({ ...f, medicine: e.target.value }))}
                              className="input-mage text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-[#878787] mb-1">Dosage</label>
                            <input
                              type="text"
                              value={editForm.dosage}
                              onChange={(e) => setEditForm((f) => ({ ...f, dosage: e.target.value }))}
                              className="input-mage text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-[#878787] mb-1">Time (24h)</label>
                            <input
                              type="time"
                              value={editForm.time}
                              onChange={(e) => setEditForm((f) => ({ ...f, time: e.target.value }))}
                              className="input-mage text-xs font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-[#878787] mb-1">Duration (Days)</label>
                            <input
                              type="number"
                              min="1"
                              value={editForm.duration}
                              onChange={(e) => setEditForm((f) => ({ ...f, duration: e.target.value }))}
                              className="input-mage text-xs"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2">
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="btn-outline-pill text-xs py-1 px-3"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(schedule._id)}
                            disabled={savingId === schedule._id}
                            className="btn-cobalt text-xs py-1 px-4 inline-flex items-center gap-1.5"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>{savingId === schedule._id ? "Saving..." : "Save Changes"}</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Display Card */
                      <div className="space-y-3.5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          {/* Left: Medicine Title + Dose badge */}
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="font-semibold text-sm text-[#000000]">
                              {schedule.medicine}
                            </span>
                            {schedule.dosage && (
                              <span className="badge-ice text-xs">{schedule.dosage}</span>
                            )}
                            <span className="inline-flex items-center gap-1 text-[11px] text-[#2b2b2b] bg-[#f7f7f1] px-2 py-0.5 rounded-full border border-[rgba(0,0,0,0.06)] font-mono">
                              <CircadianIcon className={`w-3 h-3 ${circadian.color}`} />
                              <span>{dates.formattedTime}</span>
                            </span>
                          </div>

                          {/* Right: Status Pill & Actions */}
                          <div className="flex items-center gap-2">
                            {dates.isExpired ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#ff2b3a] bg-[#fee2e2] px-2.5 py-0.5 rounded-full">
                                <AlertCircle className="w-3 h-3" />
                                <span>Completed</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#244cff] bg-[#e8f8ff] px-2.5 py-0.5 rounded-full">
                                <Clock4 className="w-3 h-3" />
                                <span>
                                  {dates.daysRemaining} {dates.daysRemaining === 1 ? "day remaining" : "days remaining"}
                                </span>
                              </span>
                            )}

                            <button
                              type="button"
                              onClick={() => handleStartEdit(schedule)}
                              className="text-xs text-[#2b2b2b] hover:text-[#244cff] hover:bg-black/5 p-1.5 rounded cursor-pointer transition-colors flex items-center gap-1"
                              title="Edit reminder"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Edit</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(schedule._id, schedule.medicine)}
                              disabled={deletingId === schedule._id}
                              className="text-xs text-[#ff2b3a] hover:bg-red-50 p-1.5 rounded cursor-pointer transition-colors flex items-center gap-1"
                              title="Remove reminder"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Remove</span>
                            </button>
                          </div>
                        </div>

                        {/* Middle Info Bar: Scheduled Until + Runs */}
                        <div className="flex flex-wrap items-center justify-between text-xs text-[#878787] pt-1 border-t border-[rgba(0,0,0,0.04)] gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] uppercase tracking-wider font-semibold text-[#878787]">Scheduled Until</span>
                            <span className="font-medium text-[#000000] flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-[#244cff]" />
                              <span>{dates.formattedDate} at {dates.formattedTime}</span>
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-[11px]">
                            <span>Course Duration: <strong className="text-[#000000]">{schedule.duration || 7} days</strong></span>
                            {schedule.remainingRuns !== undefined && (
                              <span>Doses Left: <strong className="text-[#000000]">{schedule.remainingRuns}</strong></span>
                            )}
                            {schedule.chatId && (
                              <span className="font-mono text-[#878787]">
                                Telegram: •••{String(schedule.chatId).slice(-4)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Quick Extension Bar */}
                        <div className="pt-2 border-t border-[rgba(0,0,0,0.04)] flex flex-wrap items-center justify-between gap-2 text-xs">
                          <span className="text-[11px] text-[#2b2b2b] flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-[#244cff]" />
                            <span>Need to continue or extend this medication course?</span>
                            <span className="text-[#878787] text-[10px] hidden sm:inline">Choose additional days to keep receiving Telegram reminders.</span>
                          </span>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleExtend(schedule._id, 3)}
                              disabled={extendingId === schedule._id}
                              className="px-2.5 py-1 text-[11px] font-medium bg-[#f7f7f1] hover:bg-[#244cff] hover:text-white rounded-full transition-colors border border-[rgba(0,0,0,0.08)] cursor-pointer"
                            >
                              +3 Days
                            </button>
                            <button
                              type="button"
                              onClick={() => handleExtend(schedule._id, 7)}
                              disabled={extendingId === schedule._id}
                              className="px-2.5 py-1 text-[11px] font-semibold bg-[#244cff] text-white rounded-full hover:bg-[#1a3bd6] transition-colors shadow-xs cursor-pointer"
                            >
                              +7 Days (1 Wk)
                            </button>
                            <button
                              type="button"
                              onClick={() => handleExtend(schedule._id, 14)}
                              disabled={extendingId === schedule._id}
                              className="px-2.5 py-1 text-[11px] font-medium bg-[#f7f7f1] hover:bg-[#244cff] hover:text-white rounded-full transition-colors border border-[rgba(0,0,0,0.08)] cursor-pointer"
                            >
                              +14 Days
                            </button>

                            {customExtendId === schedule._id ? (
                              <div className="inline-flex items-center gap-1 bg-white border border-[#244cff] rounded-full px-2 py-0.5">
                                <input
                                  type="number"
                                  min="1"
                                  max="90"
                                  value={customDays}
                                  onChange={(e) => setCustomDays(e.target.value)}
                                  className="w-10 text-xs text-center font-mono outline-hidden"
                                />
                                <span className="text-[10px] text-[#878787]">days</span>
                                <button
                                  type="button"
                                  onClick={() => handleExtend(schedule._id, customDays)}
                                  disabled={extendingId === schedule._id}
                                  className="text-[11px] font-bold text-[#244cff] hover:underline cursor-pointer"
                                >
                                  Go
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setCustomExtendId(null)}
                                  className="text-[#878787] hover:text-black"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setCustomExtendId(schedule._id)}
                                className="px-2 py-1 text-[11px] text-[#878787] hover:text-[#000000] underline cursor-pointer"
                              >
                                Custom...
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
