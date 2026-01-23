// models/JobCardStage.js
import mongoose from "mongoose";

const JobCardStageSchema = new mongoose.Schema(
  {
    job_card_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobCard",
      // required: true,
    },

    // ✅ MASTER REFERENCE (MOST IMPORTANT)
    stage_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DesignStage",
      // required: true,
    },

    // ✅ SNAPSHOT (UI + history)
    stage_name: { type: String },
    department: { type: String },

    assigned_to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },

    status: {
      type: String,
      enum: ["pending", "in_progress", "completed", "approved","hold"],
      default: "pending",
    },

    start_date: Date,
    end_date: Date,
    completed_at: Date,

    // 🔥 STAGE FORM DATA
    data: mongoose.Schema.Types.Mixed,

    remarks: String,
  },
  { timestamps: true }
);

export default mongoose.model("JobCardStage", JobCardStageSchema);
