// src/models/Task.ts
import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    scheduledAt: { type: Date, required: true },
    userId: {
      type: String, 
      required: true,
    },
    status: {
      type: String,
      enum: ["Scheduled", "Completed", "Missed"],
      default: "Scheduled",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Task || mongoose.model("Task", TaskSchema);
