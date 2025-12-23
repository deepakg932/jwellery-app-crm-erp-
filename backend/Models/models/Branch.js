// src/models/Branch.js
import mongoose from "mongoose";
const BranchSchema = new mongoose.Schema(
  {
    location_name: { type: String, required: true, trim: true },
    location_type: {
      type: String,
      enum: ["Store", "Vault", "Workshop"],
    },
    address: { type: String, trim: true },
    phone: { type: String, trim: true },
    status: { type: Boolean, default: true },
    gstno: { type: String, trim: true },
  },
  { timestamps: true }
);
export default mongoose.model("Branch", BranchSchema);
