import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import { 
  FileText, 
  Calendar, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  RefreshCw, 
  Sparkles, 
  Search, 
  ShieldCheck, 
  Send, 
  Clock, 
  Pill, 
  ChevronRight,
  UserCheck
} from "lucide-react";

export default function Prescriptions() {
  const navigate = useNavigate();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState(null);

  const fetchPrescriptions = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await api.get("/prescriptions");
      const list = res?.data?.data || [];
      const normalized = (Array.isArray(list) ? list : []).map((p) => ({
        id: p._id || p.id,
        prescriptionNumber: p.prescriptionNumber || `RX-${Math.floor(10000 + Math.random() * 90000)}`,
        patientName: p.patientName || "Patient",
        doctorName: p.doctorName || "Prescribing Physician",
        dateIssued: p.dateIssued || p.createdAt || new Date().toISOString().split("T")[0],
        diagnosis: p.diagnosis || "Standard prescription",
        status: p.status || "Active",
        medications: Array.isArray(p.medications)
          ? p.medications
          : p.medications && typeof p.medications === "object"
          ? [p.medications]
          : [],
      }));
      setPrescriptions(normalized);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load prescriptions from backend."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this prescription record?")) return;
    try {
      await api.delete(`/prescriptions/${id}`);
      setPrescriptions((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to delete prescription");
    }
  };

  const handleEdit = (prescription) => {
    setEditingId(prescription.id);
    setEditData(JSON.parse(JSON.stringify(prescription.medications)));
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData(null);
  };

  const handleSaveEdit = async (id) => {
    try {
      const res = await api.put(`/prescriptions/${id}`, { medications: editData });
      let updated = res.data?.data;
      if (updated && updated._id) updated.id = updated._id;

      setPrescriptions((prev) =>
        prev.map((p) => (p.id === id ? { ...p, medications: editData } : p))
      );
      setEditingId(null);
      setEditData(null);
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to update prescription");
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const filteredPrescriptions = prescriptions.filter((p) => {
    const q = searchQuery.toLowerCase();
    const matchesNumber = p.prescriptionNumber?.toLowerCase().includes(q);
    const matchesPatient = p.patientName?.toLowerCase().includes(q);
    const matchesDoctor = p.doctorName?.toLowerCase().includes(q);
    const matchesMed = p.medications?.some((m) => m.name?.toLowerCase().includes(q));
    return matchesNumber || matchesPatient || matchesDoctor || matchesMed;
  });

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 pb-12">
      {/* Portfolio Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[rgba(0,0,0,0.08)]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="badge-ice">Prescriptions</span>
            <span className="text-xs text-[#878787] font-['Inter']">
              {prescriptions.length} Saved {prescriptions.length === 1 ? "Record" : "Records"}
            </span>
          </div>
          <h2 className="font-['Inter'] text-2xl sm:text-3xl font-normal text-[#000000] tracking-tight">
            My Prescriptions
          </h2>
          <p className="font-['Inter'] text-sm text-[#2b2b2b] mt-1">
            View and manage your saved prescriptions and daily medicines.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchPrescriptions}
            disabled={loading}
            className="btn-outline-pill text-xs interactive-pill"
            title="Refresh list"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={() => navigate("/upload")}
            className="btn-cobalt text-xs interactive-pill"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            <span>Scan prescription</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-snow p-5 flex items-center justify-between interactive-card border-l-4 border-l-[#244cff]">
          <div>
            <span className="text-xs font-semibold text-[#878787] block">Prescriptions saved</span>
            <span className="font-['Inter'] text-3xl font-normal text-[#000000] mt-1 block">{prescriptions.length}</span>
          </div>
          <div className="w-11 h-11 rounded-full bg-[#e8f8ff] flex items-center justify-center text-[#244cff] shadow-xs">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="card-snow p-5 flex items-center justify-between interactive-card border-l-4 border-l-[#ffb800]">
          <div>
            <span className="text-xs font-semibold text-[#878787] block">Medicines listed</span>
            <span className="font-['Inter'] text-3xl font-normal text-[#000000] mt-1 block">
              {prescriptions.reduce((acc, p) => acc + (p.medications?.length || 0), 0)}
            </span>
          </div>
          <div className="w-11 h-11 rounded-full bg-[#fced9f]/50 flex items-center justify-center text-[#9e770b] shadow-xs">
            <Pill className="w-5 h-5" />
          </div>
        </div>

        <div className="card-snow p-5 flex items-center justify-between interactive-card border-l-4 border-l-[#00c978]">
          <div>
            <span className="text-xs font-semibold text-[#878787] block">Reminder alerts</span>
            <span className="font-['Inter'] text-3xl font-normal text-[#00c978] mt-1 block">
              {prescriptions.length > 0 ? "Ready" : "None"}
            </span>
          </div>
          <div className="w-11 h-11 rounded-full bg-[#00c978]/15 flex items-center justify-center text-[#00c978] shadow-xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search Input Bar */}
      {prescriptions.length > 0 && (
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-[#878787] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Rx number, medication, or physician..."
            className="input-mage has-left-icon pl-11 text-xs shadow-xs"
          />
        </div>
      )}

      {/* State Views */}
      {loading ? (
        <div className="text-center py-16 card-snow">
          <RefreshCw className="w-8 h-8 text-[#244cff] animate-spin mx-auto mb-3" />
          <p className="font-['Inter'] font-medium text-base text-[#000000]">
            Loading your prescriptions...
          </p>
          <p className="text-xs text-[#878787] mt-1">
            Fetching your saved prescriptions and schedules.
          </p>
        </div>
      ) : error ? (
        <div className="text-center py-12 rounded-[8px] bg-[#fcc2cd]/20 border border-[#fcc2cd] p-6 text-[#000000]">
          <p className="font-semibold text-sm text-[#ff2b3a]">{error}</p>
          <button
            type="button"
            onClick={fetchPrescriptions}
            className="mt-4 btn-outline-pill text-xs interactive-pill"
          >
            Try Again
          </button>
        </div>
      ) : prescriptions.length === 0 ? (
        /* Rich Vector Empty State */
        <div className="text-center py-14 px-6 card-snow bg-clinical-pattern max-w-2xl mx-auto shadow-sm relative overflow-hidden">
          <div className="w-64 mx-auto mb-6 animate-float-slow">
            <img
              src="/assets/illustrations/empty-prescriptions.svg"
              alt="No Prescriptions Recorded Yet"
              className="w-full h-auto drop-shadow-md"
            />
          </div>

          <h3 className="font-['Inter'] text-2xl font-normal text-[#000000] mb-2 tracking-tight">
            You don't have any prescriptions saved yet
          </h3>
          <p className="font-['Inter'] text-sm text-[#2b2b2b] max-w-md mx-auto mb-8 leading-relaxed">
            Take a photo of your paper prescription. We'll read the medicines and dosages so you can review them and set up daily Telegram alerts.
          </p>

          <button
            type="button"
            onClick={() => navigate("/upload")}
            className="btn-cobalt text-sm interactive-pill"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            <span>Scan a prescription</span>
          </button>

          {/* 3 Step Guidance */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-10 pt-8 border-t border-[rgba(0,0,0,0.06)] text-left">
            <div className="p-3 bg-white/80 rounded-[6px] border border-[rgba(0,0,0,0.06)]">
              <span className="text-[11px] font-mono text-[#244cff] font-semibold block mb-1">STEP 1</span>
              <p className="text-xs text-[#000000] font-medium">Take a photo</p>
              <p className="text-[11px] text-[#878787] mt-0.5">Clear photo under good lighting</p>
            </div>
            <div className="p-3 bg-white/80 rounded-[6px] border border-[rgba(0,0,0,0.06)]">
              <span className="text-[11px] font-mono text-[#00c978] font-semibold block mb-1">STEP 2</span>
              <p className="text-xs text-[#000000] font-medium">Review medicines</p>
              <p className="text-[11px] text-[#878787] mt-0.5">Check dosages and instructions</p>
            </div>
            <div className="p-3 bg-white/80 rounded-[6px] border border-[rgba(0,0,0,0.06)]">
              <span className="text-[11px] font-mono text-[#c3aeff] font-semibold block mb-1">STEP 3</span>
              <p className="text-xs text-[#000000] font-medium">Set reminders</p>
              <p className="text-[11px] text-[#878787] mt-0.5">Daily alerts sent to Telegram</p>
            </div>
          </div>
        </div>
      ) : (
        /* Prescriptions Catalog */
        <div className="space-y-6">
          {filteredPrescriptions.map((prescription) => (
            <div key={prescription.id} className="card-snow space-y-5 interactive-card">
              {/* Card Header Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[rgba(0,0,0,0.06)] gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#e8f8ff] border border-[rgba(36,76,255,0.2)] flex items-center justify-center text-[#244cff] shrink-0 shadow-xs">
                    <span className="font-['Inter'] font-extrabold text-sm">Rx</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-['Inter'] font-semibold text-[17px] text-[#000000]">
                        {prescription.prescriptionNumber}
                      </span>
                      <span className="badge-ice text-xs">
                        {prescription.status}
                      </span>
                    </div>
                    <p className="text-xs text-[#878787] mt-0.5 flex items-center gap-2">
                      <span>Issued {formatDate(prescription.dateIssued)}</span>
                      <span>•</span>
                      <span>Physician: <strong>{prescription.doctorName}</strong></span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-[#f7f7f1] px-3.5 py-1.5 rounded-full border border-[rgba(0,0,0,0.06)] text-xs text-[#2b2b2b] self-start sm:self-auto">
                  <UserCheck className="w-3.5 h-3.5 text-[#00c978]" />
                  <span>Patient: <strong className="text-[#000000]">{prescription.patientName}</strong></span>
                </div>
              </div>

              {/* Card Body: Medication Rows */}
              <div>
                <h4 className="font-['Inter'] text-xs font-semibold text-[#878787] uppercase tracking-wide mb-3 flex items-center gap-2">
                  <Pill className="w-3.5 h-3.5 text-[#244cff]" />
                  <span>Prescribed Regimen ({prescription.medications?.length || 0})</span>
                </h4>

                {editingId === prescription.id ? (
                  /* Edit Mode Inputs */
                  <div className="space-y-3 p-4 rounded-[8px] bg-[#f7f7f1] border border-[rgba(0,0,0,0.08)]">
                    {editData.map((m, index) => (
                      <div key={index} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-[#878787] mb-1">Medicine Name</label>
                          <input
                            type="text"
                            className="input-mage text-xs"
                            value={m.name || ""}
                            placeholder="Medicine name"
                            onChange={(e) => {
                              const updated = [...editData];
                              updated[index].name = e.target.value;
                              setEditData(updated);
                            }}
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-[#878787] mb-1">Dosage</label>
                          <input
                            type="text"
                            className="input-mage text-xs"
                            value={m.dosage || ""}
                            placeholder="e.g. 500mg"
                            onChange={(e) => {
                              const updated = [...editData];
                              updated[index].dosage = e.target.value;
                              setEditData(updated);
                            }}
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-[#878787] mb-1">Frequency</label>
                          <input
                            type="text"
                            className="input-mage text-xs"
                            value={m.frequency || ""}
                            placeholder="e.g. Once daily"
                            onChange={(e) => {
                              const updated = [...editData];
                              updated[index].frequency = e.target.value;
                              setEditData(updated);
                            }}
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-[#878787] mb-1">Duration</label>
                          <input
                            type="text"
                            className="input-mage text-xs"
                            value={m.duration || ""}
                            placeholder="e.g. 7 days"
                            onChange={(e) => {
                              const updated = [...editData];
                              updated[index].duration = e.target.value;
                              setEditData(updated);
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Display Medication Cards */
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {prescription.medications?.map((m, index) => (
                      <div
                        key={index}
                        className="p-4 rounded-[8px] bg-[#f7f7f1] border border-[rgba(0,0,0,0.06)] flex flex-col justify-between hover:border-[#244cff]/30 transition-colors"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-sm text-[#000000]">
                              {m.name}
                            </span>
                            <span className="badge-ice text-[11px]">
                              {m.dosage}
                            </span>
                          </div>
                          <p className="text-xs text-[#878787] mt-1.5 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-[#244cff]" />
                            <span>Schedule: <strong className="text-[#000000]">{m.frequency}</strong></span>
                            <span>•</span>
                            <span>Duration: {m.duration}</span>
                          </p>
                        </div>
                        {m.instructions && (
                          <p className="text-[11px] text-[#244cff] italic mt-2 pt-1 border-t border-[rgba(0,0,0,0.06)]">
                            Note: {m.instructions}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3.5 border-t border-[rgba(0,0,0,0.06)] flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="text-[#878787]">
                  Note: <strong className="text-[#000000]">{prescription.diagnosis}</strong>
                </div>

                <div className="flex items-center gap-2">
                  {editingId === prescription.id ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(prescription.id)}
                        className="btn-cobalt text-xs interactive-pill"
                        style={{ height: "34px", padding: "0 16px" }}
                      >
                        <Check className="w-3.5 h-3.5 mr-1" />
                        <span>Save Changes</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="btn-outline-pill text-xs interactive-pill"
                        style={{ height: "34px", padding: "0 16px" }}
                      >
                        <X className="w-3.5 h-3.5 mr-1" />
                        <span>Cancel</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          const prefill = { medications: prescription.medications };
                          navigate("/set-reminder", { state: { prefill } });
                        }}
                        className="btn-cobalt text-xs interactive-pill"
                        style={{ height: "34px", padding: "0 16px" }}
                      >
                        <Send className="w-3.5 h-3.5 mr-1.5" />
                        <span>Schedule Reminders</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEdit(prescription)}
                        className="btn-outline-pill text-xs interactive-pill"
                        style={{ height: "34px", padding: "0 16px" }}
                        title="Edit prescription medications"
                      >
                        <Edit3 className="w-3.5 h-3.5 mr-1" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(prescription.id)}
                        className="btn-ghost-link text-xs text-[#ff2b3a] hover:text-[#ff2b3a]"
                        title="Delete prescription"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" />
                        <span>Delete</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
