// src/models/Karigar.js
import mongoose from 'mongoose';
const KarigarSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    type: { type: String, enum: ['gold', 'diamond', 'polish'], required: true },
  },
  { timestamps: true }
);
export default mongoose.model('Karigar', KarigarSchema);
