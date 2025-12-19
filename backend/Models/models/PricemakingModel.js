import mongoose from "mongoose";
const PricemakingSchema = new mongoose.Schema(
  {
    stage_name: { type: String, required: true,ref:"MakingStage" },
    sub_stage_name: { type: String, required: true,ref:"MakingSubStage" },
    cost_type: { type: String, required: true,ref:"CostMaster" },
    cost_amount: { type: Number,default:0 },
    unit_name:{ type: String, required: true,ref:"Unit" },

    is_active: { type: Boolean, default: true },
  },
  { timestamps: true }
);
export default mongoose.model("PriceMaking", PricemakingSchema);