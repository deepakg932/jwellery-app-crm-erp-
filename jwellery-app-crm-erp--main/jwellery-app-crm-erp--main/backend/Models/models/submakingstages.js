import mongoose from "mongoose";
import { CostType } from "../models/shared.js";

const MakingSubStageSchema = new mongoose.Schema(
  {
    stage_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MakingStage",
      // required: true
    },

    sub_stage_name: { 
      type: String,
       required: true 
      },

     cost_type: {
      type: String,
    enum: CostType,
    // required: true
  },

  cost_amount: {
    type: Number,
    // required: true
  },
  

    // description: { type: String, default: "" },

    // order_no: { type: Number, default: 0 },

    is_active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model("MakingSubStage", MakingSubStageSchema);