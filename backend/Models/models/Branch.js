// src/models/Branch.js
import mongoose from 'mongoose';
const BranchSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, trim: true },
    phone: { type: String, trim: true },
    gstno: { type: String, trim: true },
  },
  { timestamps: true }
);
export default mongoose.model('Branch', BranchSchema);
