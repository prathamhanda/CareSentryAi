import mongoose from "mongoose";

const MedicationSchema = new mongoose.Schema(
  {
    name: { type: String, required: false },
    dosage: { type: String, required: false },
    frequency: { type: String, required: false },
    duration: { type: String, required: false },
    instructions: { type: String, required: false },
  },
  { _id: false }
);

const PrescriptionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    medications: { type: [MedicationSchema], default: [] },
    status: {
      type: String,
      enum: ["Active", "Completed", "Expired"],
      default: "Active",
      index: true, // Index for status-based queries
    },
  },
  { timestamps: true }
);

// ============================================
// INDEXES FOR MONGODB EVALUATION
// ============================================

// Single field indexes
PrescriptionSchema.index({ user: 1 });
PrescriptionSchema.index({ status: 1 });

// Compound indexes for multi-field queries
PrescriptionSchema.index({ user: 1, status: 1 }); // Search by user AND status
PrescriptionSchema.index({ user: 1, createdAt: -1 }); // Sort by user and date

// Multikey index for querying nested array fields
PrescriptionSchema.index({ "medications.name": 1 }); // Search medications by name
PrescriptionSchema.index({ "medications.frequency": 1 }); // Search by frequency

// Text index for full-text search on medication details
PrescriptionSchema.index({
  "medications.name": "text",
  "medications.instructions": "text",
}, {
  default_language: "english",
  name: "medication_text_index"
});

export const Prescription = mongoose.model("Prescription", PrescriptionSchema);
