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
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Patient Information */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-100 mb-4 flex items-center">
                      <svg
                        className="h-5 w-5 mr-2 text-blue-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        ></path>
                      </svg>
                      Patient Information
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-300">Name:</span>
                        <span className="text-gray-200">
                          {prescription.patientName}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Doctor Information */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-100 mb-4 flex items-center">
                      <svg
                        className="h-5 w-5 mr-2 text-green-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        ></path>
                      </svg>
                      Doctor Information
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-300">Doctor:</span>
                        <span className="text-gray-200">
                          {prescription.doctorName}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

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
                    {(prescription.medications || []).map(
                      (medication, index) => (
                        <div
                          key={index}
                          className="border border-gray-700 rounded-lg p-4 bg-gray-800 transition-colors"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                            <div>
                              <span className="font-medium text-gray-300 text-sm">
                                Medicine:
                              </span>
                              <p className="text-gray-200 font-semibold">
                                {medication.name}
                              </p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-300 text-sm">
                                Dosage:
                              </span>
                              <p className="text-gray-200">{medication.dosage}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-300 text-sm">
                                Frequency:
                              </span>
                              <p className="text-gray-200">
                                {medication.frequency}
                              </p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-300 text-sm">
                                Duration:
                              </span>
                              <p className="text-gray-200">
                                {medication.duration}
                              </p>
                            </div>
                          </div>
                          {medication.instructions && (
                            <div className="mt-3 pt-3 border-t border-gray-600">
                              <span className="font-medium text-gray-300 text-sm">
                                Instructions:
                              </span>
                              <p className="text-gray-400 italic">
                                {medication.instructions}
                              </p>
                            </div>
                          )}
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const prefill = {
                        patientName: prescription.patientName,
                        doctorName: prescription.doctorName,
                        dateIssued: prescription.dateIssued,
                        diagnosis: prescription.diagnosis,
                        medications: prescription.medications,
                      };
                      navigate("/schedule", { state: { prefill } });
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
                  >
                    Create Schedule
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedPrescription && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center p-4"
          onClick={handleClearSelection}
        >
          <div
            className="bg-gray-900 text-gray-100 rounded-lg shadow-lg max-w-lg w-full p-4 border border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-100">
                {selectedPrescription.prescriptionNumber || "Prescription"}
              </h3>
              <button
                className="text-sm px-2 py-1 border border-gray-600 rounded text-gray-300 hover:bg-gray-700"
                onClick={handleClearSelection}
              >
                Close
              </button>
            </div>
            <div className="text-sm text-gray-300 space-y-2">
              <div>
                <b>Patient:</b> {selectedPrescription.patientName || "-"}
              </div>
              <div>
                <b>Doctor:</b> {selectedPrescription.doctorName || "-"}
              </div>
              <div>
                <b>Date:</b>{" "}
                {formatDate(selectedPrescription.dateIssued) || "-"}
              </div>
              <div>
                <b>Medications:</b>
                <ul className="list-disc ml-5">
                  {(selectedPrescription.medications || []).map((m, i) => (
                    <li key={i}>
                      {m.name} {m.dosage ? `- ${m.dosage}` : ""}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
