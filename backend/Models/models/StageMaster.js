// models/StageMaster.js
import mongoose from "mongoose";

const StageMasterSchema = new mongoose.Schema(
  {
    stage_code: { type: String, unique: true }, // STG001
    stage_name: { type: String },               // Design, CAD, etc
    department: { type: String },               // Design, Production
    sequence: { type: Number },                 // 1,2,3...
    next_stage_code: { type: String },           // STG002
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("StageMaster", StageMasterSchema);
