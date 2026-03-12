
import mongoose from "mongoose";

const StageMasterSchema = new mongoose.Schema(
  {
    stage_code: { type: String, unique: true }, 
    stage_name: { type: String },             
    department: { type: String },              
    sequence: { type: Number },                
    next_stage_code: { type: String },      
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("StageMaster", StageMasterSchema);
