import { Prescription } from "../models/prescription.model.js";

export const createPrescription = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId)
      return res.status(401).json({ status: 401, message: "Unauthorized" });

    const body = req.body || {};
    // Normalize medications: ensure array
    let medications = body.medications;
    if (!Array.isArray(medications)) {
      if (medications && typeof medications === "object")
        medications = [medications];
      else medications = [];
    }

    const doc = await Prescription.create({
      user: userId,
      prescriptionNumber: body.prescriptionNumber || undefined,
      patientName: body.patientName || body.patient || body.name || "",
      doctorName: body.doctorName || body.doctor || "",
      dateIssued: body.dateIssued
        ? new Date(body.dateIssued)
        : body.date
        ? new Date(body.date)
        : undefined,
      diagnosis: body.diagnosis || body.findings || "",
      medications: medications.map((m) => ({
        name: m.name || m.medicine || "",
        dosage: m.dosage || m.dose || "",
        frequency: m.frequency || m.freq || "",
        duration: m.duration || "",
        instructions: m.instructions || "",
      })),
      status: body.status || "Active",
    });

    res
      .status(201)
      .json({ status: 201, message: "Prescription saved", data: doc });
  } catch (err) {
    res
      .status(500)
      .json({
        status: 500,
        message: "Failed to save prescription",
        error: err.message,
      });
  }
};

export const listPrescriptions = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId)
      return res.status(401).json({ status: 401, message: "Unauthorized" });

    const docs = await Prescription.find({ user: userId }).sort({
      createdAt: -1,
    });
    res.json({ status: 200, message: "OK", data: docs });
  } catch (err) {
    res
      .status(500)
      .json({
        status: 500,
        message: "Failed to list prescriptions",
        error: err.message,
      });
  }
};
