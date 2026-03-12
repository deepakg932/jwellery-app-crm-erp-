import mongoose from "mongoose";
const PricemakingSchema = new mongoose.Schema(
  {
    making_stage_id: { type: String,ref:"MakingStage" },
    making_sub_stage_id: { type: String, required: true,ref:"MakingSubStage" },
    cost_type_id: { type: String, required: true,ref:"CostMaster" },
    cost_amount: { type: Number,default:0 },
    unit_id:{ type: String, required: true,ref:"Unit" },

    is_active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

PricemakingSchema.index({ making_stage_id: 1 });
PricemakingSchema.index({ making_sub_stage_id: 1 });
PricemakingSchema.index({ cost_type_id: 1 });
PricemakingSchema.index({ is_active: 1 });
export default mongoose.model("PriceMaking", PricemakingSchema);