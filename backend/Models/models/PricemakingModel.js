import mongoose from "mongoose";
const PricemakingSchema = new mongoose.Schema(
  {
    stage_name: { type: String,ref:"MakingStage" },
    sub_stage_name: { type: String, required: true,ref:"MakingSubStage" },
    cost_type: { type: String, required: true,ref:"CostMaster" },
    cost_amount: { type: Number,default:0 },
    unit_name:{ type: String, required: true,ref:"Unit" },

    is_active: { type: Boolean, default: true },
  },
  { timestamps: true }
);
// Add indexes for better search performance
PricemakingSchema.index({ stage_name: 1 });
PricemakingSchema.index({ sub_stage_name: 1 });
PricemakingSchema.index({ cost_type: 1 });
PricemakingSchema.index({ is_active: 1 });
export default mongoose.model("PriceMaking", PricemakingSchema);