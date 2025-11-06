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
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    medications: { type: [MedicationSchema], default: [] },
    status: {
      type: String,
      enum: ["Active", "Completed", "Expired"],
      default: "Active",
    },
  },
  { timestamps: true }
);

export const Prescription = mongoose.model("Prescription", PrescriptionSchema);
