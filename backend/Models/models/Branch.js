// src/models/Branch.js
import mongoose from "mongoose";

const BranchSchema = new mongoose.Schema({
  branch_name: { type: String, trim: true },

  branch_type: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BranchType", // 🔥 REAL populate
    required: true
  },

  address: String,
  phone: String,
  status: { type: Boolean, default: true },
  gstno: String
}, { timestamps: true });

export default mongoose.model("Branch", BranchSchema);
