import mongoose from "mongoose";

const DesignStageSchema = new mongoose.Schema(
  {
    stage_code: {
      type: String,
      unique: true, // STG001, STG002
    },

    stage_name: {
      type: String, // Design Pending, Design In Progress
      required: true,
    },

    description: String,

    image: String, // stage icon / image

    order: {
      type: Number, // 1,2,3,4
      required: true,
    },

    is_active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("DesignStage", DesignStageSchema);
