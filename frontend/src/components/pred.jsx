import React, { useState, useEffect } from "react";
import api from "../api/axios.js";

export default function Pred() {
  const [symptomInput, setSymptomInput] = useState("");
  const [symptoms, setSymptoms] = useState([]);
  const [options, setOptions] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const addSymptom = () => {
    const v = String(symptomInput || "").trim();
    if (!v) return;
    // prevent duplicates
    setSymptoms((s) => (s.includes(v) ? s : [...s, v]));
    setSymptomInput("");
  };

  const removeSymptom = (i) =>
    setSymptoms((s) => s.filter((_, idx) => idx !== i));

  const mockPredict = (list) => {
    const joined = list.join(" ").toLowerCase();
    if (joined.includes("fever") && joined.includes("cough"))
      return { disease: "Influenza (Flu)", confidence: 0.72 };
    if (joined.includes("headache") && joined.includes("nausea"))
      return { disease: "Migraine", confidence: 0.6 };
    if (joined.includes("chest") || joined.includes("breath"))
      return { disease: "Respiratory Infection", confidence: 0.5 };
    if (joined.includes("rash"))
      return { disease: "Dermatitis", confidence: 0.55 };
    return { disease: "Unknown - needs clinical model", confidence: 0.25 };
  };

  const handlePredict = async () => {
    setError("");
    setResult(null);
    if (!symptoms.length) {
      setError("Please add at least one symptom.");
      return;
    }
    setLoading(true);
    try {
      try {
        const res = await api.post("/predict", { symptoms });
        const data = res?.data?.data || res?.data;
        if (data) {
          // normalize different response shapes:
          // - mock fallback returns { disease, confidence }
          // - model API returns { predictions: [ { disease, probability, ... } ], accuracy }
          if (Array.isArray(data.predictions)) {
            setResult({
              predictions: data.predictions,
              accuracy: data.accuracy,
            });
          } else if (data.disease) {
            setResult({
              predictions: [
                { disease: data.disease, probability: data.confidence || 0 },
              ],
            });
          } else {
            setResult(data);
          }
          setLoading(false);
          return;
        }
      } catch (e) {
        // fallback to mockPredict
      }

      const fallback = mockPredict(symptoms);
      setResult({
        predictions: [
          { disease: fallback.disease, probability: fallback.confidence },
        ],
      });
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  // load symptom vocabulary from backend proxy
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get("/predict/symptoms");
        const data = res?.data?.data || res?.data;
        if (!mounted) return;
        if (data?.symptoms && Array.isArray(data.symptoms)) {
          setOptions(data.symptoms);
        }
      } catch (err) {
        // ignore - keep manual entry available
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

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg dark:bg-gray-800 dark:text-gray-100 transition-colors">
      <h2 className="text-xl font-semibold mb-3">Disease Prediction</h2>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
        Enter patient symptoms (one at a time). Later this will call the ML
        model to predict likely diseases.
      </p>

      <div className="mb-4">
        {/* <div className="flex gap-2 items-center mb-2">
          <input
            value={symptomInput}
            onChange={(e) => setSymptomInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addSymptom()}
            className="flex-1 px-3 py-2 border rounded shadow-sm border-gray-300 dark:bg-gray-700 dark:border-gray-600"
            placeholder="e.g., fever, sore throat, headache"
          />
          <button
            onClick={addSymptom}
            className="px-4 py-2 bg-purple-600 text-white rounded"
          >
            Add
          </button>
        </div> */}

        <div className="mb-2">
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter available symptoms..."
            className="w-full px-3 py-2 border rounded shadow-sm border-gray-200 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        <div className="grid grid-cols-2 gap-2 max-h-44 overflow-auto mb-2">
          {(options || [])
            .filter((o) => o.toLowerCase().includes(filter.toLowerCase()))
            .slice(0, 200)
            .map((opt) => (
              <label
                key={opt}
                className="inline-flex items-center gap-2 px-2 py-1 bg-gray-100 rounded text-sm dark:bg-gray-700"
              >
                <input
                  type="checkbox"
                  checked={symptoms.includes(opt)}
                  onChange={() => toggleOption(opt)}
                />
                <span className="ml-1">{opt}</span>
              </label>
            ))}
        </div>

        <div>
          {symptoms.length === 0 ? (
            <div className="text-sm text-gray-500">
              No symptoms selected yet.
            </div>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {symptoms.map((s, i) => (
                <li
                  key={i}
                  className="px-3 py-1 bg-gray-100 rounded-full text-sm dark:bg-gray-700"
                >
                  {s}
                  <button
                    onClick={() => removeSymptom(i)}
                    className="ml-2 text-red-500"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handlePredict}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Predicting…" : "Predict"}
        </button>
        <button
          onClick={() => {
            setSymptoms([]);
            setResult(null);
            setError("");
          }}
          className="px-3 py-2 border rounded"
        >
          Clear
        </button>
      </div>

      <div className="mt-6">
        {error && <div className="text-red-600">{error}</div>}
        {result && (
          <div className="p-4 bg-gray-50 rounded-md mt-2 dark:bg-gray-700">
            {result.predictions && result.predictions.length > 0 && (
              <div>
                <div className="text-lg font-semibold">
                  Top Prediction: {result.predictions[0].disease}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Confidence:{" "}
                  {(result.predictions[0].probability || 0).toFixed(2)}
                </div>

                {result.predictions.length > 1 && (
                  <div className="mt-3">
                    <div className="text-sm font-medium mb-1">
                      Other candidates:
                    </div>
                    <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-200">
                      {result.predictions.slice(1).map((p, idx) => (
                        <li key={idx}>
                          {p.disease} — {(p.probability || 0).toFixed(2)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
