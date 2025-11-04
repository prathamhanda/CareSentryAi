import { Schema } from "mongoose";
import mongoose from "mongoose";

const scheduleSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false, // optional now
    },
    chatId: {
      type: String,
      required: true, // Telegram chat ID
    },
    medicine: {
      type: String,
      required: true,
    },
    time: {
      type: String, // "HH:mm" format
      required: true,
    },
    duration: {
      type: Number, // in days
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    cronTime: {
      type: String,
      required: true,
    },
    remainingRuns: {
      type: Number,
      default: 1,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const Schedule = mongoose.model("Schedule", scheduleSchema);
