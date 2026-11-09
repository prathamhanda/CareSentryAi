import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import { 
  Upload as UploadIcon, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  RefreshCw, 
  Sparkles, 
  Calendar, 
  ShieldCheck, 
  Sun, 
  Building2, 
  Pill, 
  Scan,
  Check
} from "lucide-react";
import ProcessPipelineBar from "./ProcessPipelineBar.jsx";

export default function Upload({
  setExtracted = () => {},
  setResult = () => {},
}) {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanResults, setScanResults] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const progressTimerRef = useRef(null);
  const fileInputRef = useRef(null);

  // Clean up thumbnail preview object URL
  useEffect(() => {
    return () => {
      if (filePreviewUrl) {
        URL.revokeObjectURL(filePreviewUrl);
      }
    };
  }, [filePreviewUrl]);

  const validateFile = (file) => {
    if (!file) return { valid: false, reason: "No file selected" };
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/bmp", "image/tiff"];
    const ext = file.name ? file.name.substring(file.name.lastIndexOf(".")).toLowerCase() : "";
    const allowedExts = [".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tiff"];
    if (!allowedTypes.includes(file.type) && !allowedExts.includes(ext)) {
      return { valid: false, reason: `Unsupported type '${file.type || ext}'. Please upload a PNG, JPG, or WEBP image.` };
    }
    if (file.size > 15 * 1024 * 1024) {
      return { valid: false, reason: `File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds 15MB limit` };
    }
    return { valid: true };
  };

  const handleFileProcess = (file) => {
    if (!file) return;
    const validation = validateFile(file);

    if (!validation.valid) {
      setErrorMessage(validation.reason);
      setSelectedFile(null);
      setFilePreviewUrl(null);
      return;
    }

    setSelectedFile(file);
    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setFilePreviewUrl(url);
    } else {
      setFilePreviewUrl(null);
    }

    setScanComplete(false);
    setScanProgress(0);
    setScanResults(null);
    setExtracted(null);
    setResult("");
    setErrorMessage(null);
    setIsConfirmed(false);
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    handleFileProcess(file, "upload");
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    handleFileProcess(file, "drop");
  };

  const handleScan = async () => {
    if (isScanning || !selectedFile) return;

    const reqId = Math.random().toString(36).substring(2, 10);

    setIsScanning(true);
    setScanProgress(0);
    setScanComplete(false);
    setScanResults(null);
    setErrorMessage(null);
    setIsConfirmed(false);

    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    progressTimerRef.current = setInterval(() => {
      setScanProgress((p) => (p < 92 ? p + 4 : p));
    }, 280);

    try {
      const form = new FormData();
      form.append("image", selectedFile);

      const res = await api.post("/prescriptions/extract", form, {
        headers: {
          "Content-Type": "multipart/form-data",
          "X-Request-Id": reqId,
        },
      });
      const data = res?.data;

      const raw = data?.result || "";
      const text = raw.replace(/^```json\n|\n```$/g, "").trim();
      setResult(raw);

      let parsed = null;
      try {
        parsed = JSON.parse(text);
      } catch {
        // Leave parsed as null
      }

      if (parsed) {
        setExtracted(parsed);

        const pres = Array.isArray(parsed.prescription)
          ? parsed.prescription
          : Array.isArray(parsed.medications)
          ? parsed.medications
          : [];
        const medications = pres.map((p) => ({
          name: p.medicine || p.name || "Medication",
          dosage: p.dosage || p.dose || "As directed",
          frequency: p.frequency || p.freq || "Once daily",
          duration: p.duration || "Course duration",
        }));

        const preview = {
          prescriptionNumber: `RX-${Math.floor(10000 + Math.random() * 90000)}`,
          patientName: parsed.patientName || parsed.patient || parsed.name || "Patient",
          doctorName: parsed.doctorName || parsed.doctor || "Attending Physician",
          dateIssued: parsed.dateIssued || parsed.date || new Date().toISOString().split("T")[0],
          diagnosis: parsed.diagnosis || parsed.findings || "Routine clinical prescription",
          medications,
          needsReview: Boolean(parsed.needs_review) || true,
        };
        setScanResults(preview);
      }

      setScanProgress(100);
      setScanComplete(true);
    } catch (error) {
      const serverMsg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Scanning failed. Please check your connection and try again.";
      const sanitizedError =
        typeof serverMsg === "object" ? JSON.stringify(serverMsg) : String(serverMsg);

      setErrorMessage(sanitizedError);
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
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
    setIsScanning(false);
    setSelectedFile(null);
    if (filePreviewUrl) {
      URL.revokeObjectURL(filePreviewUrl);
      setFilePreviewUrl(null);
    }
    setScanComplete(false);
    setScanProgress(0);
    setScanResults(null);
    setErrorMessage(null);
    setIsConfirmed(false);
    setExtracted(null);
    setResult("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSavePrescription = async () => {
    if (scanResults?.needsReview && !isConfirmed) {
      alert("Please review your prescription details and check the confirmation box before saving.");
      return;
    }

    setIsSaving(true);
    try {
      await api.post("/prescriptions", scanResults);
      navigate("/prescriptions");
    } catch (err) {
      alert("Failed to save prescription: " + (err.response?.data?.message || err.message));
    } finally {
      setIsSaving(false);
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
    <div className="w-full max-w-5xl mx-auto space-y-8 pb-12">
      {/* Process Pipeline Status Bar */}
      <ProcessPipelineBar currentStage={scanComplete ? 4 : isScanning ? 2 : selectedFile ? 1 : 1} />

      {/* Main Studio Card with Subtle Pattern */}
      <div className="card-snow bg-clinical-pattern relative overflow-hidden">
        {/* Subtle Ambient Glow */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[#244cff]/5 blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[rgba(0,0,0,0.08)] gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="badge-ice">Prescription Scanner</span>
            </div>
            <h2 className="font-['Inter'] text-2xl sm:text-3xl font-normal text-[#000000] tracking-tight">
              Scan a prescription
            </h2>
            <p className="font-['Inter'] text-sm text-[#2b2b2b] mt-1">
              Upload a clear photo of your prescription to read medicine details and set up reminders.
            </p>
          </div>

          {selectedFile && (
            <button
              type="button"
              onClick={handleReset}
              disabled={isScanning}
              className="btn-outline-pill text-xs self-start sm:self-auto interactive-pill"
            >
              Reset Scanner
            </button>
          )}
        </div>

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="my-6 p-4 rounded-[6px] bg-[#fcc2cd]/20 border border-[#fcc2cd] text-[#000000] text-sm flex items-start gap-3 relative z-10">
            <AlertTriangle className="w-5 h-5 text-[#ff2b3a] shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-[#000000]">Extraction Notice</p>
              <p className="text-xs text-[#2b2b2b] mt-0.5">{errorMessage}</p>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-[#878787] hover:text-[#000000] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* State 1: Dropzone + Hero Illustration (No File Selected) */}
        {!selectedFile ? (
          <div className="pt-8 space-y-8 relative z-10">
            {/* Split Composition: Dropzone on Left, Floating Vector Artwork on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column: Dropzone (7 Cols) */}
              <div className="lg:col-span-7">
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#b0b0b0] hover:border-[#244cff] bg-[#ffffff]/90 hover:bg-[#ffffff] rounded-[14px] p-8 sm:p-10 text-center transition-all duration-300 cursor-pointer group shadow-sm hover:shadow-md"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/*"
                    className="hidden"
                  />

                  <div className="w-16 h-16 rounded-full bg-[#e8f8ff] border border-[rgba(36,76,255,0.2)] group-hover:scale-110 flex items-center justify-center text-[#244cff] mx-auto mb-4 transition-transform duration-300 shadow-xs">
                    <Scan className="w-7 h-7 text-[#244cff]" />
                  </div>

                  <h3 className="font-['Inter'] text-lg font-medium text-[#000000] mb-1.5">
                    Drop your paper prescription here, or click to browse
                  </h3>
                  <p className="font-['Inter'] text-xs text-[#878787] mb-6 max-w-sm mx-auto">
                    Supports clear smartphone photos or clinic document scans (PNG, JPEG, WEBP up to 15MB)
                  </p>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="btn-cobalt text-sm interactive-pill"
                  >
                    <UploadIcon className="w-4 h-4 mr-1" />
                    <span>Select Prescription File</span>
                  </button>
                </div>
              </div>

              {/* Right Column: Custom Animated Prescription Vector Artwork (5 Cols) */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center">
                <div className="relative w-full max-w-xs sm:max-w-sm animate-float-slow">
                  <img
                    src="/assets/illustrations/prescription-scanning.svg"
                    alt="Prescription scanning workflow"
                    className="w-full h-auto drop-shadow-lg"
                  />
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#1d1f21] text-white text-[11px] font-mono rounded-full border border-white/10 flex items-center gap-2 whitespace-nowrap shadow-md">
                    <span className="w-2 h-2 rounded-full bg-[#00c978] animate-pulse" />
                    <span>Scanner ready</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Helper Instructions Cards with Rich Medical Icon Vignettes */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <div className="p-4 rounded-[8px] bg-[#ffffff] border border-[rgba(0,0,0,0.06)] interactive-card flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-full bg-[#fced9f]/50 flex items-center justify-center shrink-0 mt-0.5">
                  <Sun className="w-4.5 h-4.5 text-[#9e770b]" />
                </div>
                <div>
                  <p className="font-semibold text-xs text-[#000000] mb-0.5">1. Adequate Daylight</p>
                  <p className="text-[12px] text-[#878787] leading-relaxed">
                    Capture evenly under daylight without shadows across handwritten dosage signs.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-[8px] bg-[#ffffff] border border-[rgba(0,0,0,0.06)] interactive-card flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-full bg-[#e8f8ff] flex items-center justify-center shrink-0 mt-0.5">
                  <Building2 className="w-4.5 h-4.5 text-[#244cff]" />
                </div>
                <div>
                  <p className="font-semibold text-xs text-[#000000] mb-0.5">2. Include Clinic Header</p>
                  <p className="text-[12px] text-[#878787] leading-relaxed">
                    Ensure clinic letterhead, doctor name, and date are inside the frame.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-[8px] bg-[#ffffff] border border-[rgba(0,0,0,0.06)] interactive-card flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-full bg-[#c3aeff]/40 flex items-center justify-center shrink-0 mt-0.5">
                  <Pill className="w-4.5 h-4.5 text-[#294dba]" />
                </div>
                <div>
                  <p className="font-semibold text-xs text-[#000000] mb-0.5">3. Full Medicine Table</p>
                  <p className="text-[12px] text-[#878787] leading-relaxed">
                    Verify that dosage quantities (e.g. 500mg) and timings are clearly framed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* State 2 & 3: File Selected, Scanning, and Extraction Results */
          <div className="space-y-6 pt-6 relative z-10">
            {/* File Review Card */}
            <div className="p-4 rounded-[8px] bg-[#f7f7f1] border border-[rgba(0,0,0,0.08)] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 overflow-hidden">
                {filePreviewUrl ? (
                  <div className="relative w-16 h-16 rounded-[8px] overflow-hidden border border-[rgba(0,0,0,0.1)] shrink-0 bg-white shadow-xs">
                    <img
                      src={filePreviewUrl}
                      alt="Prescription preview"
                      className="w-full h-full object-cover"
                    />
                    {isScanning && (
                      <div className="absolute inset-0 bg-[#244cff]/20 animate-pulse pointer-events-none" />
                    )}
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-[8px] bg-white border border-[rgba(0,0,0,0.1)] flex items-center justify-center shrink-0 shadow-xs">
                    <FileText className="w-7 h-7 text-[#244cff]" />
                  </div>
                )}
                <div className="overflow-hidden">
                  <p className="font-['Inter'] text-sm font-semibold text-[#000000] truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-[#878787] mt-0.5 flex items-center gap-2">
                    <span>{formatFileSize(selectedFile.size)}</span>
                    <span>•</span>
                    <span className="text-[#244cff] font-medium">Ready to scan prescription</span>
                  </p>
                </div>
              </div>

              {!isScanning && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="p-2 text-[#878787] hover:text-[#ff2b3a] hover:bg-black/5 rounded-full cursor-pointer transition-colors"
                  title="Remove image"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Clean Blue Progress Bar matching the light theme */}
            {isScanning && (
              <div className="w-full space-y-2 py-3 px-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-[#244cff]">Scanning prescription...</span>
                  <span className="text-[#878787] font-mono">{scanProgress}%</span>
                </div>
                <div className="w-full bg-[#e8f8ff] rounded-full h-2.5 overflow-hidden border border-[#244cff]/15">
                  <div
                    className="bg-[#244cff] h-full rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${scanProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Extraction Results Overview */}
            {scanComplete && scanResults && (
              <div className="space-y-6 pt-2">
                {/* Status Notice Banner */}
                <div className="p-4 rounded-[8px] bg-[#00c978]/10 border border-[#00c978]/30 flex items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#00c978] flex items-center justify-center text-white shrink-0">
                      <Check className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-xs text-[#000000]">Prescription Read Successfully</p>
                      <p className="text-xs text-[#2b2b2b]">
                        Found {scanResults.medications?.length || 0} medication(s) for {scanResults.patientName}.
                      </p>
                    </div>
                  </div>
                  <span className="badge-parchment text-xs font-mono">
                    {scanResults.prescriptionNumber}
                  </span>
                </div>

                {/* Metadata Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3.5 rounded-[8px] bg-[#ffffff] border border-[rgba(0,0,0,0.06)] shadow-xs">
                    <span className="text-[11px] font-semibold text-[#878787] block">Patient</span>
                    <span className="font-semibold text-sm text-[#000000] mt-0.5 block truncate">{scanResults.patientName}</span>
                  </div>
                  <div className="p-3.5 rounded-[8px] bg-[#ffffff] border border-[rgba(0,0,0,0.06)] shadow-xs">
                    <span className="text-[11px] font-semibold text-[#878787] block">Doctor</span>
                    <span className="font-semibold text-sm text-[#000000] mt-0.5 block truncate">{scanResults.doctorName}</span>
                  </div>
                  <div className="p-3.5 rounded-[8px] bg-[#ffffff] border border-[rgba(0,0,0,0.06)] shadow-xs">
                    <span className="text-[11px] font-semibold text-[#878787] block">Date Issued</span>
                    <span className="font-semibold text-sm text-[#000000] mt-0.5 block">{scanResults.dateIssued}</span>
                  </div>
                  <div className="p-3.5 rounded-[8px] bg-[#ffffff] border border-[rgba(0,0,0,0.06)] shadow-xs">
                    <span className="text-[11px] font-semibold text-[#878787] block">Diagnosis</span>
                    <span className="font-semibold text-sm text-[#000000] mt-0.5 block truncate">{scanResults.diagnosis}</span>
                  </div>
                </div>

                {/* Medications List */}
                <div className="space-y-3">
                  <h4 className="font-['Inter'] text-sm font-semibold text-[#000000] tracking-wide">
                    Extracted Medicines ({scanResults.medications?.length || 0})
                  </h4>
                  <div className="space-y-2">
                    {scanResults.medications?.map((med, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-[8px] bg-[#ffffff] border border-[rgba(0,0,0,0.08)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 interactive-card"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#244cff]" />
                            <span className="font-semibold text-sm text-[#000000]">{med.name}</span>
                          </div>
                          <p className="text-xs text-[#878787] mt-1 ml-4.5">
                            Dose: {med.dosage} • Frequency: {med.frequency} • Course: {med.duration}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-4.5 sm:ml-0">
                          <span className="badge-ice text-xs">{med.dosage}</span>
                          <span className="badge-lavender text-xs">{med.frequency}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Patient Review Confirmation Safeguard */}
                <div className="p-4.5 rounded-[8px] bg-[#ffffbd]/30 border border-[#9e770b]/30 text-xs space-y-2.5">
                  <div className="flex items-center gap-2 text-[#9e770b] font-semibold">
                    <ShieldCheck className="w-4 h-4 text-[#9e770b]" />
                    <span>Please Verify Your Medicines</span>
                  </div>
                  <p className="text-[#2b2b2b] leading-relaxed">
                    Always compare these scanned details against your physical paper prescription slip. If anything looks incorrect or unreadable, edit the details or check with your doctor or pharmacist.
                  </p>
                  <label className="flex items-center gap-2.5 pt-2 border-t border-[#9e770b]/20 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      id="confirm-review-checkbox"
                      checked={isConfirmed}
                      onChange={(e) => setIsConfirmed(e.target.checked)}
                      className="cursor-pointer w-4 h-4 text-[#244cff] rounded"
                    />
                    <span className="font-medium text-[#000000]">
                      I have checked these medicines against my original prescription slip.
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Actions Bar */}
            <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
              {!scanComplete ? (
                <>
                  <button
                    type="button"
                    onClick={handleScan}
                    disabled={isScanning}
                    className="btn-cobalt w-full sm:flex-1 disabled:opacity-50 interactive-pill"
                    style={{ height: "42px" }}
                  >
                    {isScanning ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                        <span>Scanning prescription...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        <span>{errorMessage ? "Retry Scanning" : "Scan Prescription"}</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    disabled={isScanning}
                    className="btn-outline-pill w-full sm:w-auto interactive-pill"
                    style={{ height: "42px" }}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleSavePrescription}
                    disabled={!isConfirmed || isSaving}
                    className="btn-cobalt w-full sm:flex-1 disabled:opacity-50 interactive-pill"
                    style={{ height: "42px" }}
                  >
                    {isSaving ? "Saving to Records..." : "Save Prescription to Records"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      navigate("/set-reminder", { state: { prefill: scanResults } });
                    }}
                    disabled={!isConfirmed}
                    className="btn-obsidian w-full sm:flex-1 disabled:opacity-50 interactive-pill"
                    style={{ height: "42px" }}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>Configure Reminders</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="btn-outline-pill text-xs interactive-pill"
                    style={{ height: "42px" }}
                  >
                    Scan Another
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
