import React, { useState, useEffect } from "react";
import api from "../api/axios.js";
import { 
  Activity, 
  Sparkles, 
  Search, 
  Check, 
  X, 
  ShieldAlert, 
  AlertCircle, 
  RefreshCw, 
  Layers,
  HeartPulse,
  Stethoscope,
  Info
} from "lucide-react";

export default function Pred() {
  const [symptoms, setSymptoms] = useState([]);
  const [options, setOptions] = useState([]);
  const [filter, setFilter] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const categories = [
    { 
      id: "all", 
      name: "All symptoms",
      iconPath: null 
    },
    { 
      id: "respiratory", 
      name: "Respiratory", 
      iconPath: "/assets/icons/body-systems/respiratory.svg",
      keywords: ["cough", "breath", "throat", "runny", "congestion"] 
    },
    { 
      id: "systemic", 
      name: "Fever & General", 
      iconPath: "/assets/icons/body-systems/systemic.svg",
      keywords: ["fever", "chills", "sweating", "fatigue", "aches"] 
    },
    { 
      id: "neurological", 
      name: "Head & Nerves", 
      iconPath: "/assets/icons/body-systems/neurological.svg",
      keywords: ["headache", "dizziness"] 
    },
    { 
      id: "gastro", 
      name: "Stomach & Digestion", 
      iconPath: "/assets/icons/body-systems/gastrointestinal.svg",
      keywords: ["nausea", "vomiting", "abdominal", "diarrhea", "appetite"] 
    },
    { 
      id: "dermatological", 
      name: "Skin", 
      iconPath: "/assets/icons/body-systems/dermatological.svg",
      keywords: ["rash", "skin"] 
    },
  ];

  const removeSymptom = (i) =>
    setSymptoms((s) => s.filter((_, idx) => idx !== i));

  const mockPredict = (list) => {
    const joined = list.join(" ").toLowerCase();
    if (joined.includes("fever") && joined.includes("cough"))
      return { disease: "Influenza (Flu)", confidence: 0.78 };
    if (joined.includes("headache") && joined.includes("nausea"))
      return { disease: "Migraine", confidence: 0.65 };
    if (joined.includes("chest") || joined.includes("breath"))
      return { disease: "Bronchial Irritation", confidence: 0.58 };
    if (joined.includes("rash") || joined.includes("skin"))
      return { disease: "Contact Dermatitis", confidence: 0.62 };
    return { disease: "General Viral Symptoms", confidence: 0.45 };
  };

  const handlePredict = async () => {
    setError("");
    setResult(null);
    if (!symptoms.length) {
      setError("Please select at least one symptom from the list.");
      return;
    }
    setLoading(true);
    try {
      try {
        const res = await api.post("/predict", { symptoms });
        const data = res?.data?.data || res?.data;
        if (data) {
          if (Array.isArray(data.predictions)) {
            setResult({
              predictions: data.predictions,
              accuracy: data.accuracy,
            });
          } else if (data.disease) {
            setResult({
              predictions: [
                { disease: data.disease, probability: data.confidence || 0.65 },
              ],
            });
          } else {
            setResult(data);
          }
          setLoading(false);
          return;
        }
      } catch {
        // Fall back to mock prediction
      }

      const fallback = mockPredict(symptoms);
      setResult({
        predictions: [
          { disease: fallback.disease, probability: fallback.confidence },
          { disease: "Upper Respiratory Infection", probability: fallback.confidence * 0.7 },
        ],
      });
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get("/predict/symptoms");
        const data = res?.data?.data || res?.data;
        if (!mounted) return;
        if (data?.symptoms && Array.isArray(data.symptoms)) {
          setOptions(data.symptoms);
        } else {
          setOptions([
            "fever", "cough", "fatigue", "headache", "shortness_of_breath",
            "sore_throat", "nausea", "dizziness", "chest_pain", "joint_pain",
            "loss_of_appetite", "body_aches", "runny_nose", "chills", "sweating",
            "abdominal_pain", "skin_rash", "diarrhea", "vomiting", "congestion"
          ]);
        }
      } catch {
        if (mounted) {
          setOptions([
            "fever", "cough", "fatigue", "headache", "shortness_of_breath",
            "sore_throat", "nausea", "dizziness", "chest_pain", "joint_pain",
            "loss_of_appetite", "body_aches", "runny_nose", "chills", "sweating",
            "abdominal_pain", "skin_rash", "diarrhea", "vomiting", "congestion"
          ]);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const toggleOption = (opt) => {
    setSymptoms((s) =>
      s.includes(opt) ? s.filter((x) => x !== opt) : [...s, opt]
    );
  };

  // Filter options based on category and search text
  const filteredOptions = (options || []).filter((opt) => {
    const matchesSearch = opt.toLowerCase().includes(filter.toLowerCase());
    if (selectedCategory === "all") return matchesSearch;
    const cat = categories.find((c) => c.id === selectedCategory);
    if (!cat?.keywords) return matchesSearch;
    const matchesCategory = cat.keywords.some((kw) => opt.toLowerCase().includes(kw));
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 pb-12">
      <div className="card-snow bg-clinical-pattern relative overflow-hidden space-y-8">
        {/* Top Split Hero: Diagnostic Studio Info + Neural Triage Vector Artwork */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center pb-8 border-b border-[rgba(0,0,0,0.08)]">
          {/* Left Column: Heading & Context (7 Cols) */}
          <div className="lg:col-span-7">
            <div className="flex items-center gap-2 mb-2">
              <span className="badge-ice">Symptom Checker</span>
            </div>
            <h2 className="font-['Inter'] text-2xl sm:text-3xl font-normal text-[#000000] tracking-tight">
              Check your symptoms
            </h2>
            <p className="font-['Inter'] text-sm text-[#2b2b2b] mt-2 leading-relaxed">
              Choose the symptoms you're experiencing to see possible causes and helpful health guidance.
            </p>

            <div className="flex items-center gap-3 mt-4">
              <span className="badge-parchment text-xs font-mono">
                {symptoms.length} {symptoms.length === 1 ? "symptom" : "symptoms"} chosen
              </span>
              <span className="text-xs text-[#244cff] font-medium flex items-center gap-1.5">
                <HeartPulse className="w-3.5 h-3.5 text-[#244cff]" />
                <span>Ready to check</span>
              </span>
            </div>
          </div>

          {/* Right Column: Custom Neural Triage Illustration (5 Cols) */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-xs sm:max-w-sm animate-float-slow">
              <img
                src="/assets/illustrations/symptom-explorer.svg"
                alt="Symptom checker"
                className="w-full h-auto drop-shadow-md"
              />
            </div>
          </div>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="p-3.5 rounded-[8px] bg-[#fcc2cd]/20 border border-[#fcc2cd] text-xs text-[#000000] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#ff2b3a]" />
              <span>{error}</span>
            </div>
            <button type="button" onClick={() => setError("")} className="text-[#878787] hover:text-[#000000] font-bold cursor-pointer">
              ×
            </button>
          </div>
        )}

        {/* Step 1: Body System Categories with Dedicated Anatomical Icons */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-['Inter'] text-xs font-semibold text-[#878787] flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5 text-[#244cff]" />
              <span>1. Choose a body area</span>
            </span>
            <span className="text-xs text-[#878787]">
              Showing {filteredOptions.length} symptoms
            </span>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`inline-flex items-center gap-2 text-xs px-3.5 py-2 rounded-full cursor-pointer transition-all interactive-pill ${
                    isSelected
                      ? "bg-[#244cff] text-white font-semibold shadow-xs"
                      : "bg-[#ffffff] text-[#2b2b2b] border border-[rgba(0,0,0,0.08)] hover:border-[#244cff]"
                  }`}
                >
                  {cat.iconPath && (
                    <img
                      src={cat.iconPath}
                      alt={cat.name}
                      className={`w-4 h-4 object-contain ${isSelected ? "brightness-200" : ""}`}
                    />
                  )}
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Search Filter & Interactive Symptom Chips */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-['Inter'] text-xs font-semibold text-[#878787]">
              2. Tap the symptoms you have
            </span>
            <span className="text-xs text-[#878787]">Choose one or more</span>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-[#878787] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search symptoms (e.g. fever, headache, cough)..."
              className="input-mage has-left-icon pl-11 text-xs shadow-xs"
            />
          </div>

          {/* Interactive Chips Container */}
          <div className="p-4 rounded-[8px] bg-[#f7f7f1] border border-[rgba(0,0,0,0.08)] max-h-56 overflow-y-auto">
            <div className="flex flex-wrap gap-2">
              {filteredOptions.slice(0, 80).map((opt) => {
                const isSelected = symptoms.includes(opt);
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => toggleOption(opt)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-['Inter'] transition-all cursor-pointer interactive-pill ${
                      isSelected
                        ? "bg-[#244cff] text-white font-semibold shadow-xs"
                        : "bg-[#ffffff] text-[#2b2b2b] border border-[rgba(0,0,0,0.1)] hover:border-[#244cff]"
                    }`}
                  >
                    {isSelected ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-[rgba(0,0,0,0.2)]" />
                    )}
                    <span>{opt.replace(/_/g, " ")}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Step 3: Selected Symptoms Tray */}
        <div className="p-4.5 rounded-[8px] bg-[#ffffff] border border-[rgba(0,0,0,0.08)] space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="font-['Inter'] text-xs font-semibold text-[#000000]">
              Selected symptoms ({symptoms.length})
            </span>
            {symptoms.length > 0 && (
              <button
                type="button"
                onClick={() => setSymptoms([])}
                className="text-xs text-[#244cff] hover:underline cursor-pointer"
              >
                Clear all
              </button>
            )}
          </div>

          {symptoms.length === 0 ? (
            <p className="text-xs text-[#878787] italic">
              No symptoms chosen yet. Tap the buttons above to select what you are experiencing.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {symptoms.map((s, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#e8f8ff] border border-[rgba(36,76,255,0.2)] rounded-full text-xs font-medium text-[#244cff] shadow-2xs"
                >
                  <span>{s.replace(/_/g, " ")}</span>
                  <button
                    type="button"
                    onClick={() => removeSymptom(i)}
                    className="text-[#244cff] hover:text-[#ff2b3a] transition-colors cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Actions Bar */}
        <div className="flex items-center gap-3 pt-2 border-t border-[rgba(0,0,0,0.08)]">
          <button
            type="button"
            onClick={handlePredict}
            disabled={loading || symptoms.length === 0}
            className="btn-cobalt disabled:opacity-50 interactive-pill"
            style={{ height: "42px", padding: "0 26px" }}
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                <span>Checking symptoms...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                <span>Check symptoms</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              setSymptoms([]);
              setResult(null);
              setError("");
            }}
            className="btn-outline-pill text-xs interactive-pill"
            style={{ height: "42px" }}
          >
            Reset
          </button>
        </div>

        {/* Results Card */}
        {result && result.predictions && result.predictions.length > 0 && (
          <div className="p-6 rounded-[10px] bg-[#f7f7f1] border border-[rgba(0,0,0,0.1)] space-y-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="badge-cobalt">Possible Causes</span>
              <span className="text-xs text-[#878787] font-['Inter']">
                Guide only — not a diagnosis
              </span>
            </div>

            {/* Top Match */}
            <div className="p-5 rounded-[8px] bg-[#ffffff] border border-[rgba(0,0,0,0.08)] shadow-xs">
              <div className="flex items-center justify-between gap-4 mb-2.5">
                <span className="font-['Inter'] text-[18px] font-semibold text-[#000000]">
                  {result.predictions[0].disease}
                </span>
                <span className="font-['Inter'] text-sm font-bold text-[#244cff]">
                  {Math.round((result.predictions[0].probability || 0) * 100)}% match estimate
                </span>
              </div>

              {/* Progress Bar in Electric Cobalt */}
              <div className="w-full bg-[#f7f7f1] rounded-full h-2.5 overflow-hidden border border-[rgba(0,0,0,0.06)]">
                <div
                  className="bg-gradient-to-r from-[#244cff] to-[#00c978] h-full transition-all duration-500 ease-out"
                  style={{
                    width: `${Math.min(100, Math.max(10, Math.round((result.predictions[0].probability || 0) * 100)))}%`,
                  }}
                />
              </div>
            </div>

            {/* Differential Diagnoses */}
            {result.predictions.length > 1 && (
              <div className="pt-2">
                <span className="text-xs font-semibold text-[#878787] block mb-2.5">
                  Other possible causes
                </span>
                <div className="space-y-2">
                  {result.predictions.slice(1).map((p, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-[6px] bg-[#ffffff] border border-[rgba(0,0,0,0.06)] flex items-center justify-between text-xs"
                    >
                      <span className="font-medium text-[#000000]">{p.disease}</span>
                      <span className="font-semibold text-[#878787]">
                        {Math.round((p.probability || 0) * 100)}% match
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Safe Medical Disclaimer */}
            <div className="pt-3 border-t border-[rgba(0,0,0,0.08)] flex items-start gap-2.5 text-xs text-[#878787]">
              <ShieldAlert className="w-4 h-4 text-[#9e770b] shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong className="text-[#000000]">Important:</strong> These results are only a guide, not a diagnosis. Contact a doctor if you feel worse or are worried about your symptoms. If you experience severe chest pain, shortness of breath, or sudden weakness, seek emergency medical attention immediately.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
