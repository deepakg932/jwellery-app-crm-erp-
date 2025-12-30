// src/models/Repair.js
import mongoose from 'mongoose';
const repairSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
  itemName: String,
  problem: String,
  expectedDate: Date,
  repairCharge: Number,
  status: {
    type: String,
    enum: ["RECEIVED", "IN_PROGRESS", "READY", "DELIVERED"]
  }
}, { timestamps: true });

export default mongoose.model("Repair", repairSchema);

