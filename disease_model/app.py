import json
import os
import pickle
import tempfile
import urllib.request
from typing import Any, List, Optional, Tuple

import numpy as np
import pandas as pd
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS

load_dotenv()

app = Flask(__name__)

cors_origin_raw = os.getenv(
    "CORS_ORIGIN",
    "http://localhost:5173,https://care-sentry-ai.vercel.app",
)
origins = [o.strip() for o in cors_origin_raw.split(",") if o.strip()]
CORS(app, resources={r"/*": {"origins": origins}})

MODEL_URL = os.getenv("MODEL_URL", "").strip()
MODEL_PATH = os.getenv("MODEL_PATH", "")
SYMPTOMS_JSON = os.getenv("SYMPTOMS_JSON", "").strip()
TOP_N = int(os.getenv("TOP_N", "5"))

_model: Any = None
_symptoms: List[str] = []


def _download_model(url: str) -> str:
    if not url:
        raise RuntimeError("MODEL_URL is not set")

    cache_dir = os.getenv("MODEL_CACHE_DIR") or tempfile.gettempdir()
    os.makedirs(cache_dir, exist_ok=True)

    filename = os.getenv("MODEL_FILENAME") or "disease_model.pkl"
    dest = os.path.join(cache_dir, filename)

    if os.path.exists(dest) and os.path.getsize(dest) > 0:
        return dest

    # Stream download to avoid holding the full file in memory
    req = urllib.request.Request(url, headers={"User-Agent": "Render"})
    with urllib.request.urlopen(req, timeout=60) as resp, open(dest, "wb") as f:
        while True:
            chunk = resp.read(1024 * 1024)
            if not chunk:
                break
            f.write(chunk)

    if not os.path.exists(dest) or os.path.getsize(dest) == 0:
        raise RuntimeError("Model download failed (empty file)")

    return dest


def _try_extract_symptoms(model_obj: Any) -> List[str]:
    # 1) Env override
    if SYMPTOMS_JSON:
        try:
            data = json.loads(SYMPTOMS_JSON)
            if isinstance(data, list) and all(isinstance(x, str) for x in data):
                return data
        except Exception:
            pass

    # 2) Common "bundle" shape: {"model": ..., "symptoms": [...]}
    if isinstance(model_obj, dict):
        s = model_obj.get("symptoms") or model_obj.get("features")
        if isinstance(s, list) and all(isinstance(x, str) for x in s):
            return s

    # 3) CatBoost / sklearn-style feature names
    for attr in ("feature_names_", "feature_names", "columns"):
        try:
            val = getattr(model_obj, attr)
            if isinstance(val, list) and all(isinstance(x, str) for x in val) and val:
                return val
        except Exception:
            continue

    # CatBoost models may expose feature names via a method
    try:
        if hasattr(model_obj, "get_feature_names"):
            names = model_obj.get_feature_names()
            if isinstance(names, list) and names:
                return [str(n) for n in names]
    except Exception:
        pass

    # Some pipelines store the columns on a preprocessor
    try:
        if hasattr(model_obj, "named_steps"):
            pre = model_obj.named_steps.get("preprocessor") or model_obj.named_steps.get(
                "prep"
            )
            if pre is not None and hasattr(pre, "feature_names_in_"):
                cols = list(getattr(pre, "feature_names_in_"))
                if cols:
                    return [str(c) for c in cols]
    except Exception:
        pass

    return []


def _unwrap_model(model_obj: Any) -> Any:
    if isinstance(model_obj, dict) and "model" in model_obj:
        return model_obj["model"]
    return model_obj


def _load_bundle() -> Tuple[Any, List[str]]:
    global _model, _symptoms

    if _model is not None:
        return _model, _symptoms

    path = MODEL_PATH.strip()
    if not path:
        path = _download_model(MODEL_URL)

    with open(path, "rb") as f:
        bundle = pickle.load(f)

    symptoms = _try_extract_symptoms(bundle)
    model = _unwrap_model(bundle)

    _model = model
    _symptoms = symptoms
    return model, symptoms


def _vectorize(symptoms_input: List[str], vocab: List[str]) -> pd.DataFrame:
    # One-hot vector over known symptom vocabulary
    vocab = [str(v) for v in vocab]
    present = {str(s).strip().lower() for s in symptoms_input if str(s).strip()}

    row = {col: 0 for col in vocab}
    for col in vocab:
        if col.strip().lower() in present:
            row[col] = 1

    return pd.DataFrame([row], columns=vocab)


def _predict(model: Any, X: pd.DataFrame) -> dict:
    # Prefer probabilities when available
    proba = None
    classes = None

    if hasattr(model, "predict_proba"):
        proba = model.predict_proba(X)
    else:
        # CatBoost can do predict with prediction_type='Probability'
        try:
            proba = model.predict(X, prediction_type="Probability")
        except Exception:
            proba = None

    if hasattr(model, "classes_"):
        try:
            classes = list(model.classes_)
        except Exception:
            classes = None

    if proba is None:
        # Fallback: only top class
        y = model.predict(X)
        label = y[0] if isinstance(y, (list, np.ndarray)) else y
        return {
            "predictions": [{"disease": str(label), "probability": None}],
            "accuracy": None,
        }

    proba = np.array(proba)
    if proba.ndim == 1:
        proba = np.expand_dims(proba, 0)

    probs = proba[0]
    if classes is None or len(classes) != len(probs):
        classes = [str(i) for i in range(len(probs))]

    ranked = sorted(
        zip(classes, probs), key=lambda t: float(t[1]), reverse=True
    )[: max(1, TOP_N)]

    return {
        "predictions": [
            {"disease": str(cls), "probability": float(p)} for cls, p in ranked
        ],
        "accuracy": None,
    }


def _recommend_doctor(disease: str) -> str:
    d = (disease or "").lower()

    # Keep this intentionally simple + safe: map broad categories to specialists.
    if any(k in d for k in ("migraine", "seizure", "stroke", "neu", "headache")):
        return "Neurologist"
    if any(k in d for k in ("dermat", "skin", "rash", "eczema", "psoriasis")):
        return "Dermatologist"
    if any(k in d for k in ("asthma", "pneum", "bronch", "copd", "respir")):
        return "Pulmonologist"
    if any(k in d for k in ("card", "heart", "angina", "myocard", "arrhythm")):
        return "Cardiologist"
    if any(k in d for k in ("diab", "thyroid", "endocr")):
        return "Endocrinologist"
    if any(k in d for k in ("gastro", "liver", "hepat", "ulcer", "stomach")):
        return "Gastroenterologist"
    if any(k in d for k in ("kidney", "renal", "uti", "urinar", "neph")):
        return "Nephrologist"

    # For common, non-specific viral/flu-like outputs
    if any(k in d for k in ("flu", "influenza", "cold", "viral", "infection", "fever", "cough")):
        return "General Physician"

    return "General Physician"


@app.get("/")
def root():
    return (
        "<h1>Disease Prediction Service</h1><p>Use /symptoms and /predict</p>",
        200,
    )


@app.get("/health")
def health():
    ok = True
    detail = "ok"
    try:
        _load_bundle()
    except Exception as e:
        ok = False
        detail = str(e)
    return jsonify({"ok": ok, "service": "disease_model", "detail": detail})


@app.get("/symptoms")
def symptoms():
    try:
        _, vocab = _load_bundle()
        if not vocab:
            return (
                jsonify(
                    {
                        "symptoms": [],
                        "warning": "No symptom vocabulary found in model bundle. Set SYMPTOMS_JSON env var (JSON array of strings).",
                    }
                ),
                200,
            )
        return jsonify({"symptoms": vocab})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.post("/predict")
def predict():
    body = request.get_json(silent=True) or {}
    symptoms_input = body.get("symptoms")

    if not isinstance(symptoms_input, list) or not symptoms_input:
        return jsonify({"error": "symptoms must be a non-empty array"}), 400

    try:
        model, vocab = _load_bundle()
        if not vocab:
            return (
                jsonify(
                    {
                        "error": "Model loaded but symptom vocabulary is missing",
                        "hint": "Set SYMPTOMS_JSON env var (JSON array of symptom strings) or re-export the pickle to include symptoms list.",
                    }
                ),
                500,
            )

        X = _vectorize(symptoms_input, vocab)
        out = _predict(model, X)

        # Convenience field for UI: recommended doctor for the top prediction
        top_disease = None
        try:
            if out.get("predictions"):
                top_disease = out["predictions"][0].get("disease")
        except Exception:
            top_disease = None

        out["recommended_doctor"] = _recommend_doctor(str(top_disease or ""))
        # Also attach per-prediction doctor (non-breaking if ignored)
        try:
            for p in out.get("predictions", []):
                p["doctor"] = _recommend_doctor(str(p.get("disease") or ""))
        except Exception:
            pass
        return jsonify(out)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "5001"))
    app.run(host="0.0.0.0", port=port)
