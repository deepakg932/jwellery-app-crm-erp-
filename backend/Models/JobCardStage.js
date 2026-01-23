import mongoose from "mongoose";

const JobCardStageSchema = new mongoose.Schema(
  {
    job_card_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobCard",
      required: true,
    },

    stage_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DesignStage",
      required: true,
    },

    stage_name: String, // snapshot
    department: {
      type: String,
      default: "Design",
    },

    status: {
      type: String,
      enum: ["pending", "in_progress", "completed"],
      default: "pending",
    },

    start_date: Date,
    end_date: Date,

    images: [String], // design files / screenshots

    remarks: String,
  },
  { timestamps: true }
);

export default mongoose.model("JobCardStage", JobCardStageSchema);
