import React, { useEffect, useState } from "react";
import api from "../api/axios.js";

export default function Scheduler({ extracted = null }) {
  const [chatId, setChatId] = useState("");
  const [medicines, setMedicines] = useState([
    {
      id: 1,
      name: "",
      dosage: "",
      time: "",
      duration: "",
    },
  ]);

  // Auto-fill medicines from extracted scan data (name, dosage, duration)
  useEffect(() => {
    if (!extracted) return;

    // Only auto-fill if current form is essentially empty (avoid overwriting edits)
    const isFormEmpty =
      medicines.length === 1 &&
      !medicines[0].name &&
      !medicines[0].dosage &&
      !medicines[0].time &&
      !medicines[0].duration;

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
      time: "", // let user choose time(s)
      duration: p.duration || "",
    }));

    setMedicines(normalized);
  }, [extracted]);

  const addMedicine = () => {
    const newMedicine = {
      id: Date.now(),
      name: "",
      dosage: "",
      time: "",
      duration: "",
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

  const handleCreateSchedule = async () => {
    // Validate inputs
    if (!chatId) {
      alert("Please enter a chatId");
      return;
    }

    const incompleteMedicine = medicines.find(
      (med) => !med.name || !med.dosage || !med.time || !med.duration
    );

    if (incompleteMedicine) {
      alert("Please fill in all medicine details");
      return;
    }

    // Convert frontend form shape to backend expected shape:
    // { chatId, items: [ { medicine, times: [...], durationDays } ] }
    const parseDurationDays = (s) => {
      if (!s) return 1;
      const str = String(s).toLowerCase().trim();
      const numMatch = str.match(/(\d+)/);
      const num = numMatch ? Number(numMatch[1]) : NaN;
      if (isNaN(num)) return 1;
      if (str.includes("week")) return num * 7;
      if (str.includes("day")) return num;
      // default assume days
      return num;
    };

    // Build payload matching backend `createTelegramSchedules` controller:
    // { chatId, schedules: [ { medicine, time: 'HH:MM', duration: number } ] }
    const schedules = medicines.map((med) => ({
      medicine: med.name,
      time: med.time,
      // backend will parseInt(duration) - send a numeric value
      duration: parseDurationDays(med.duration),
    }));

    const payload = { chatId, schedules };

    console.log("Schedule payload:", payload);

    try {
      // backend route is POST /api/schedules and expects { chatId, schedules: [] }
      const res = await api.post("/schedules", payload);
      if (res?.data?.success) {
        alert(
          "Schedule created successfully! Notifications will be sent to chatId: " +
            chatId
        );
        // Reset form after successful creation
        setChatId("");
        setMedicines([
          { id: Date.now(), name: "", dosage: "", time: "", duration: "" },
        ]);
      } else {
        throw new Error(res?.data?.message || "Failed to create schedule");
      }
    } catch (err) {
      console.error("Create schedule failed:", err);
      alert(
        "Failed to create schedule: " +
          (err?.response?.data?.message || err.message)
      );
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 text-gray-100 bg-gray-900 transition-colors min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-100 mb-2">
          Medicine Scheduler
        </h1>
        <p className="text-gray-400">
          Set up medication reminders and notifications
        </p>
      </div>

      <div className="bg-gray-900 rounded-lg shadow-sm border border-gray-700 p-6 transition-colors">
        {/* Chat ID Input */}
        <div className="mb-6">
          <label
            htmlFor="chatId"
            className="block text-sm font-medium text-gray-200 mb-2"
          >
            To get Chat ID for Notifications, visit{" "}
            <a
              href="https://t.me/Caresentrybot"
              className="text-blue-400 hover:underline"
              target="_blank"
            >
              this bot
            </a>{" "}
            and start the bot, then go to{" "}
            <a
              href="http://t.me/userinfobot"
              className="text-blue-400 hover:underline"
              target="_blank"
            >
              userinfobot
            </a>{" "}
            and ask for your chat ID.
          </label>
          <div className="relative">
            <input
              type="text"
              id="chatId"
              value={chatId}
              onChange={(e) => setChatId(e.target.value)}
              className="block w-full px-3 py-3 border border-gray-600 rounded-lg bg-gray-900 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="919876543210"
            />
          </div>
        </div>

        {/* Medicines Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-100">
              Medicine Schedule
            </h2>
            <button
              onClick={addMedicine}
              className="flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <svg
                className="h-4 w-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4v16m8-8H4"
                ></path>
              </svg>
              Add Medicine
            </button>
          </div>

          {/* Medicines List */}
          <div className="space-y-4">
            {medicines.map((medicine, index) => (
              <div
                key={medicine.id}
                className="border border-gray-700 rounded-lg p-4 bg-gray-900 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-100">
                    Medicine {index + 1}
                  </h3>
                  {medicines.length > 1 && (
                    <button
                      onClick={() => removeMedicine(medicine.id)}
                      className="text-red-500 hover:text-red-400 transition-colors"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        ></path>
                      </svg>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Medicine Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Medicine Name
                    </label>
                    <input
                      type="text"
                      value={medicine.name}
                      onChange={(e) =>
                        updateMedicine(medicine.id, "name", e.target.value)
                      }
                      className="block w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-900 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Amoxicillin"
                    />
                  </div>

                  {/* Dosage */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Dosage
                    </label>
                    <input
                      type="text"
                      value={medicine.dosage}
                      onChange={(e) =>
                        updateMedicine(medicine.id, "dosage", e.target.value)
                      }
                      className="block w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-900 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 500mg"
                    />
                  </div>

                  {/* Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Time
                    </label>
                    <input
                      type="time"
                      value={medicine.time}
                      onChange={(e) =>
                        updateMedicine(medicine.id, "time", e.target.value)
                      }
                      className="block w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-900 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Duration
                    </label>
                    <input
                      type="text"
                      value={medicine.duration}
                      onChange={(e) =>
                        updateMedicine(medicine.id, "duration", e.target.value)
                      }
                      className="block w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-900 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 7 days, 2 weeks"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Schedule Summary */}
        {medicines.some(
          (med) => med.name && med.dosage && med.time && med.duration
        ) && (
          <div className="mb-6 p-4 bg-blue-900/40 border border-blue-700 rounded-lg">
            <h3 className="font-medium text-blue-300 mb-2">Schedule Summary</h3>
            <div className="space-y-1 text-sm text-blue-200">
              {medicines
                .filter((med) => med.name && med.time)
                .map((med, idx) => (
                  <div key={med.id}>
                    • {med.name} ({med.dosage}) at {med.time} for {med.duration}
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Create Schedule Button */}
        <div className="flex justify-end">
          <button
            onClick={handleCreateSchedule}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-colors duration-200 flex items-center shadow-lg"
          >
            <svg
              className="h-5 w-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              ></path>
            </svg>
            Create Schedule
          </button>
        </div>
      </div>
    </div>
  );
}
