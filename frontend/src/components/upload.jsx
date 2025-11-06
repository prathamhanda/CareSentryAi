import React, { useState, useRef } from "react";
import api from "../api/axios.js";

// Uploads a prescription image to the ML server and maps the parsed output
// Props:
// - setExtracted: function(parsedObject) -> used by ScheduleSetup
// - result: raw string result (optional, for debugging)
// - setResult: function(rawString) -> allow parent to see raw model output
export default function Upload({
  setExtracted = () => {},
  result,
  setResult = () => {},
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanResults, setScanResults] = useState(null);
  const progressTimerRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    setScanComplete(false);
    setScanProgress(0);
    setScanResults(null);
    setExtracted(null);
    setResult("");
  };

  const safeText = (val) => typeof val === "object" ? JSON.stringify(val) : val || "N/A";

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    setSelectedFile(file);
    setScanComplete(false);
    setScanProgress(0);
    setScanResults(null);
    setExtracted(null);
    setResult("");
  };

  const handleScan = async () => {
    if (!selectedFile) return;

    setIsScanning(true);
    setScanProgress(0);
    setScanComplete(false);
    setScanResults(null);

    // Simulate progress while waiting on the ML API
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    progressTimerRef.current = setInterval(() => {
      setScanProgress((p) => (p < 90 ? p + 5 : p));
    }, 300);

    try {
      const form = new FormData();
      form.append("image", selectedFile);

      const res = await fetch("https://caresentryai-production-83aa.up.railway.app/extract", {
        method: "POST",
        body: form,
      });
      if (!res.ok) throw new Error(`ML server error (${res.status})`);
      const data = await res.json();

      // Raw result may be fenced with ```json ... ```; strip fences
      const raw = data?.result || "";
      const text = raw.replace(/^```json\n|\n```$/g, "").trim();
      setResult(raw);

      // Try parse JSON, pass to parent for ScheduleSetup
      let parsed = null;
      try {
        parsed = JSON.parse(text);
      } catch {
        // leave parsed as null
      }
      if (parsed) {
        setExtracted(parsed);

        // Map parsed into UI-friendly preview (best-effort)
        const pres = Array.isArray(parsed.prescription)
          ? parsed.prescription
          : Array.isArray(parsed.medications)
          ? parsed.medications
          : [];
        const medications = pres.map((p) => ({
          name: p.medicine || p.name || "Medicine",
          dosage: p.dosage || p.dose || "",
          frequency: p.frequency || p.freq || "",
          duration: p.duration || "",
        }));
        const preview = {
          patientName:
            parsed.patientName || parsed.patient || parsed.name || "",
          doctorName: parsed.doctorName || parsed.doctor || "",
          dateIssued: parsed.dateIssued || parsed.date || "",
          diagnosis: parsed.diagnosis || parsed.findings || "",
          medications,
        };
        setScanResults(preview);
      }

      setScanProgress(100);
      setScanComplete(true);
    } catch (error) {
      console.error("Scanning failed:", error);
      setScanComplete(false);
      setScanResults(null);
    } finally {
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
        progressTimerRef.current = null;
      }
      setIsScanning(false);
    }
  };

  const handleReset = () => {
    // Stop progress updates if any
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
    setIsScanning(false);
    setSelectedFile(null);
    setScanComplete(false);
    setScanProgress(0);
    setScanResults(null);
    // Clear parent-level outputs so new upload starts fresh
    setExtracted(null);
    setResult("");
    // Clear the underlying file input so selecting the same file triggers onChange
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-gray-900 text-gray-100 rounded-lg shadow-lg border border-gray-700">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-100 mb-2">
          Prescription Scanner
        </h2>
        <p className="text-gray-400 text-sm">
          Choose a prescription file to scan and extract information
        </p>
      </div>

      {!selectedFile ? (
        // File Selection Area
        <div
          className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-blue-500 transition-colors duration-200"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div className="mb-4">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="mb-4">
            <p className="text-gray-600 mb-2">
              Drag and drop your prescription here, or
            </p>
            <label className="cursor-pointer bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200">
              Choose Prescription
              <input
                type="file"
                className="hidden"
                onChange={handleFileSelect}
                accept="image/*,.pdf"
                ref={fileInputRef}
              />
            </label>
          </div>
          <p className="text-xs text-gray-500">
            Support for images and PDF files
          </p>
        </div>
      ) : (
        // File Preview and Scan
        <div className="space-y-4">
          {/* File Info */}
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <svg
                  className="h-8 w-8 text-purple-600"
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
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-100 truncate">
                  {selectedFile.name}
                </p>
                <p className="text-sm text-gray-500">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
              <button
                onClick={handleReset}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600"
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
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>
          </div>

          {/* Scan Progress */}
          {isScanning && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Scanning prescription...</span>
                <span className="text-gray-900">{scanProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${scanProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Scan Results */}
          {scanComplete && scanResults && (
            <div className="bg-green-900 border border-green-700 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <svg
                  className="h-5 w-5 text-green-600 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
                <span className="text-green-100 text-sm font-medium">
                  Prescription scanned successfully!
                </span>
              </div>

              {/* Extracted Information */}
              <div className="space-y-2 text-xs">
                <div>
                  <span className="font-medium text-gray-100">Medications:</span>
                  <ul className="text-gray-200 ml-2">
                    {(() => {
                      let meds = scanResults.medications;
                      if (Array.isArray(meds)) {
                        return meds.map((med, index) => (
                          <li key={index} className="text-xs">
                            • {med.name} - {med.dosage}, {med.frequency}, {med.duration}
                          </li>
                        ));
                      } else if (typeof meds === "object" && meds !== null) {
                        return (
                          <li className="text-xs">
                            • {meds.name} - {meds.dosage}, {meds.frequency}, {meds.duration}
                          </li>
                        );
                      } else {
                        return (
                          <li className="text-xs text-gray-400">No medications found</li>
                        );
                      }
                    })()}
                  </ul>
                </div>
              </div>

            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            {!scanComplete ? (
              <button
                onClick={handleScan}
                disabled={isScanning}
                className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
              >
                {isScanning ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Scanning...
                  </>
                ) : (
                  <>
                    <svg
                      className="h-4 w-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      ></path>
                    </svg>
                    Scan Prescription
                  </>
                )}
              </button>
            ) : (
              <>
                <button
                  onClick={async () => {
                    // Save prescription to backend
                    try {
                      await api.post("/prescriptions", scanResults);
                      // Optionally reset scan and navigate to prescriptions list
                      handleReset();
                      window.location.href = "/prescriptions";
                    } catch (err) {
                      alert("Failed to save prescription");
                    }
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200"
                >
                  Save Prescription
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200"
                >
                  Scan Another Prescription
                </button>
              </>
            )}
            <button
              onClick={handleReset}
              className="px-4 py-2 border border-gray-300 text-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
