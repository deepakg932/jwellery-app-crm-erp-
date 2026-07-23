import mongoose from "mongoose";
import { CostType } from "../models/shared.js";

const costmasterSchema = new mongoose.Schema(
  {
    sub_stage_name: { type: String, ref: "MakingSubStage"},

    cost_name: { type: String, ref: "costmaster" },

    cost_type: {
      type: String,

    },

    is_active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("CostMaster", costmasterSchema);
