import express from "express";

const router = express.Router();

// Proxy to disease model server. Configure base via env DISEASE_MODEL_BASE
const MODEL_BASE = process.env.DISEASE_MODEL_BASE || "http://127.0.0.1:5001";
const MODEL_URL = `${MODEL_BASE}/predict`;

// POST /api/predict
router.post("/predict", async (req, res) => {
  const { symptoms } = req.body || {};

  if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
    return res
      .status(400)
      .json({ error: "symptoms must be a non-empty array" });
  }

  try {
    // Use global fetch (Node 18+) to forward the request to the Python model server
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    const r = await fetch(MODEL_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symptoms }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!r.ok) {
      const text = await r.text();
      return res
        .status(502)
        .json({ error: "Model server error", detail: text });
    }

    const data = await r.json();
    // Return data under a consistent envelope
    return res.json({ data });
  } catch (err) {
    if (err.name === "AbortError") {
      return res.status(504).json({ error: "Model server timed out" });
    }
    return res
      .status(500)
      .json({ error: "Failed to contact model server", detail: String(err) });
  }
});

// GET /api/predict/symptoms -> returns list of available symptoms from model server
router.get("/predict/symptoms", async (req, res) => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5_000);

    const r = await fetch(`${MODEL_BASE}/symptoms`, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!r.ok) {
      const text = await r.text();
      return res
        .status(502)
        .json({ error: "Model server error", detail: text });
    }

    const data = await r.json();
    return res.json({ data });
  } catch (err) {
    if (err.name === "AbortError") {
      return res.status(504).json({ error: "Model server timed out" });
    }
    return res
      .status(500)
      .json({ error: "Failed to contact model server", detail: String(err) });
  }
});

export default router;
