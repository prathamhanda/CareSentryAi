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

    // Create new prescription — only medications and status now
    const doc = await Prescription.create({
      user: userId,
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
    res.status(500).json({
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
    res.status(500).json({
      status: 500,
      message: "Failed to list prescriptions",
      error: err.message,
    });
  }
};

export const deletePrescription = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId)
      return res.status(401).json({ status: 401, message: "Unauthorized" });

    const { id } = req.params;
    if (!id)
      return res.status(400).json({ status: 400, message: "Missing prescription ID" });

    const doc = await Prescription.findOneAndDelete({ _id: id, user: userId });
    if (!doc)
      return res.status(404).json({ status: 404, message: "Prescription not found" });

    res.json({ status: 200, message: "Prescription deleted successfully" });
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: "Failed to delete prescription",
      error: err.message,
    });
  }
};

export const updatePrescription = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId)
      return res.status(401).json({ status: 401, message: "Unauthorized" });

    const { id } = req.params;
    const { medications } = req.body;

    if (!Array.isArray(medications))
      return res
        .status(400)
        .json({ status: 400, message: "Invalid medications format" });

    const doc = await Prescription.findOneAndUpdate(
      { _id: id, user: userId },
      { medications },
      { new: true }
    );

    if (!doc)
      return res
        .status(404)
        .json({ status: 404, message: "Prescription not found" });

    const updated = doc.toObject();
    updated.id = updated._id;

    res.json({
      status: 200,
      message: "Prescription updated successfully",
      data: updated,
    });
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: "Failed to update prescription",
      error: err.message,
    });
  }
};

