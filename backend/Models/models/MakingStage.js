import mongoose from "mongoose";

const MakingStageSchema = new mongoose.Schema(
  {
    stage_name: { type: String, required: true},

    // description: { type: String, default: "" },

    // order_no: { type: Number, default: 0 },

    // is_active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model("MakingStage", MakingStageSchema);
