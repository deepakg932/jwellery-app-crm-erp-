// src/models/BranchType.js
import mongoose from "mongoose";

const BranchTypeSchema = new mongoose.Schema({
  branch_type: { type: String, unique: true },
  status: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model("BranchType", BranchTypeSchema);
