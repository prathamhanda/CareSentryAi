import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios.js";

export default function Prescriptions({ extracted }) {
  const navigate = useNavigate();
  // State
  const [prescriptions, setPrescriptions] = useState([]);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState(null);


  // Handlers
  const handleSelectPrescription = (presc) => setSelectedPrescription(presc);
  const handleClearSelection = () => setSelectedPrescription(null);
  const handleRefresh = () => fetchPrescriptions();

  // Fetch prescriptions from backend
  const fetchPrescriptions = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await api.get("/prescriptions");
      // Expect shape { status, message, data: [...] }
      const list = res?.data?.data || [];
      // Normalize medications to arrays
      const normalized = (Array.isArray(list) ? list : []).map((p) => ({
        id: p._id || p.id,
        prescriptionNumber: p.prescriptionNumber || "Prescription",
        patientName: p.patientName || "",
        doctorName: p.doctorName || "",
        dateIssued: p.dateIssued || p.createdAt,
        diagnosis: p.diagnosis || "",
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
          "Failed to load prescriptions"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this prescription?")) return;
    try {
      await api.delete(`/prescriptions/${id}`);
      setPrescriptions((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to delete prescription");
    }
  };

  const handleEdit = (prescription) => {
    setEditingId(prescription.id);
    setEditData(JSON.parse(JSON.stringify(prescription.medications))); // deep copy
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
        prev.map((p) => (p.id === id ? updated : p))
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
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-200 text-green-800 border-green-200";
      case "Completed":
        return "bg-gray-200 text-gray-900 border-gray-200";
      case "Expired":
        return "bg-red-200 text-red-800 border-red-200";
      default:
        return "bg-blue-200 text-blue-800 border-blue-200";
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-900 text-gray-100 transition-colors min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-100 mb-2">
          Prescription Details
        </h1>
        <p className="text-gray-400 text-opacity-80">
          View detailed prescription information and medication details
        </p>
      </div>

      {/* Actions */}
      <div className="bg-gray-900 rounded-lg shadow-sm border border-gray-700 p-4 mb-6 transition-colors">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleRefresh}
            className="px-3 py-2 text-sm border border-gray-600 rounded text-gray-200 hover:bg-gray-700"
          >
            Refresh
          </button>
          <div className="text-sm text-gray-400">
            Showing {prescriptions.length} prescriptions
          </div>
        </div>
      </div>

      {/* Prescriptions List */}
      {loading ? (
        <div className="text-center py-12 bg-gray-900 rounded-lg shadow-sm transition-colors text-gray-300">
          Loading...
        </div>
      ) : error ? (
        <div className="text-center py-12 bg-gray-900 rounded-lg shadow-sm text-red-400 transition-colors">
          {error}
        </div>
      ) : prescriptions.length === 0 ? (
        <div className="text-center py-12 bg-gray-900 rounded-lg shadow-sm transition-colors">
          <svg
            className="mx-auto h-12 w-12 text-gray-500 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            ></path>
          </svg>
          <h3 className="text-lg font-medium text-gray-300 mb-2">
            No prescriptions found
          </h3>
          <p className="text-gray-400 text-opacity-80">
            No prescriptions match the selected filter.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {prescriptions.map((prescription) => (
            <div
              key={prescription.id}
              className="bg-gray-900 rounded-lg shadow-sm border border-gray-700 overflow-hidden transition-colors"
              onClick={() => handleSelectPrescription(prescription)}
            >
              {/* Prescription Header */}
              <div className="bg-gray-900 px-6 py-4 border-b border-gray-600 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-100">
                      {prescription.prescriptionNumber}
                    </h3>
                    <p className="text-sm text-gray-400 text-opacity-80">
                      Issued on {formatDate(prescription.dateIssued)}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                      prescription.status
                    )}`}
                  >
                    {prescription.status}
                  </span>
                </div>
              </div>

              {/* Prescription Content */}
              <div className="p-6">
                {/* Medications */}
                <div className="mt-6">
                  <h4 className="text-lg font-medium text-gray-100 mb-4 flex items-center">
                    <svg
                      className="h-5 w-5 mr-2 text-purple-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                      ></path>
                    </svg>
                    Prescribed Medications
                  </h4>
                  <div className="space-y-4">
                    {editingId === prescription.id
                      ? editData.map((m, index) => (
                          <div
                            key={index}
                            className="border border-gray-700 rounded-lg p-4 bg-gray-800 transition-colors space-y-2"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                              <input
                                type="text"
                                className="border border-gray-600 bg-gray-900 text-gray-200 p-2 rounded"
                                value={m.name}
                                placeholder="Medicine name"
                                onChange={(e) => {
                                  const newData = [...editData];
                                  newData[index].name = e.target.value;
                                  setEditData(newData);
                                }}
                              />
                              <input
                                type="text"
                                className="border border-gray-600 bg-gray-900 text-gray-200 p-2 rounded"
                                value={m.dosage}
                                placeholder="Dosage"
                                onChange={(e) => {
                                  const newData = [...editData];
                                  newData[index].dosage = e.target.value;
                                  setEditData(newData);
                                }}
                              />
                              <input
                                type="text"
                                className="border border-gray-600 bg-gray-900 text-gray-200 p-2 rounded"
                                value={m.frequency}
                                placeholder="Frequency"
                                onChange={(e) => {
                                  const newData = [...editData];
                                  newData[index].frequency = e.target.value;
                                  setEditData(newData);
                                }}
                              />
                              <input
                                type="text"
                                className="border border-gray-600 bg-gray-900 text-gray-200 p-2 rounded"
                                value={m.duration}
                                placeholder="Duration"
                                onChange={(e) => {
                                  const newData = [...editData];
                                  newData[index].duration = e.target.value;
                                  setEditData(newData);
                                }}
                              />
                              <input
                                type="text"
                                className="border border-gray-600 bg-gray-900 text-gray-200 p-2 rounded"
                                value={m.instructions}
                                placeholder="Instructions"
                                onChange={(e) => {
                                  const newData = [...editData];
                                  newData[index].instructions = e.target.value;
                                  setEditData(newData);
                                }}
                              />
                            </div>
                          </div>
                        ))
                      : (prescription.medications || []).map((m, index) => (
                          <div
                            key={index}
                            className="border border-gray-700 rounded-lg p-4 bg-gray-800 transition-colors"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                              <div>
                                <span className="font-medium text-gray-300 text-sm">
                                  Medicine:
                                </span>
                                <p className="text-gray-200 font-semibold">{m.name}</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-300 text-sm">
                                  Dosage:
                                </span>
                                <p className="text-gray-200">{m.dosage}</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-300 text-sm">
                                  Frequency:
                                </span>
                                <p className="text-gray-200">{m.frequency}</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-300 text-sm">
                                  Duration:
                                </span>
                                <p className="text-gray-200">{m.duration}</p>
                              </div>
                            </div>
                            {m.instructions && (
                              <div className="mt-3 pt-3 border-t border-gray-600">
                                <span className="font-medium text-gray-300 text-sm">
                                  Instructions:
                                </span>
                                <p className="text-gray-400 italic">{m.instructions}</p>
                              </div>
                            )}
                          </div>
                        ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex justify-end gap-3">
                  {editingId === prescription.id ? (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSaveEdit(prescription.id);
                        }}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm"
                      >
                        Save
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancelEdit();
                        }}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(prescription);
                        }}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(prescription.id);
                        }}
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm"
                      >
                        Delete
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const prefill = { medications: prescription.medications };
                          navigate("/schedule", { state: { prefill } });
                        }}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm"
                      >
                        Create Schedule
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
