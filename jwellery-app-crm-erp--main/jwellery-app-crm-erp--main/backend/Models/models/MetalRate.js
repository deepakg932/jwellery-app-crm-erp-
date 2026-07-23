// src/models/MetalRate.js
import mongoose from 'mongoose';
import { MetalType } from './_shared.js';

const MetalRateSchema = new mongoose.Schema(
  {
    metaltype: { type: String, enum: MetalType, required: true },
    purity_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Purity', required: true, index: true },
    ratepergram: { type: Number, required: true },
    date: { type: Date, required: true, index: true },
  },
  { timestamps: true }
);
MetalRateSchema.index({ metaltype: 1, purity_id: 1, date: 1 }, { unique: true });
export default mongoose.model('MetalRate', MetalRateSchema);
