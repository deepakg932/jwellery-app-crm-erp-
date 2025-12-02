// src/models/Repair.js
import mongoose from 'mongoose';
const RepairSchema = new mongoose.Schema(
  {
    customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
    productinfo: { type: String, trim: true },
    images: { type: [String], default: [] },
    problem: { type: String, required: true, trim: true },
    estimatedcost: { type: Number, default: 0 },
    receiveddate: { type: Date, default: Date.now },
    duedate: { type: Date },
    status: { type: String, enum: ['received', 'in-repair', 'ready', 'delivered', 'cancelled'], default: 'received' },
  },
  { timestamps: true }
);
export default mongoose.model('Repair', RepairSchema);
