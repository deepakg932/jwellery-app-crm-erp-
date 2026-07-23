// src/models/MakingChargeTemplate.js
import mongoose from 'mongoose';
import { ChargeType } from './_shared.js';
const MakingChargeTemplateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    chargetype: { type: String, enum: ChargeType, required: true },
    amount: { type: Number, required: true },
  },
  { timestamps: true }
);
export default mongoose.model('MakingChargeTemplate', MakingChargeTemplateSchema);
