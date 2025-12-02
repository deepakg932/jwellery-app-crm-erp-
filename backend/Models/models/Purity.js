
import mongoose from 'mongoose';
const PuritySchema = new mongoose.Schema(
  {
    purity_name: { type: String, required: true, trim: true },
    karat: { type: Number, required: true }, // e.g., 22
    percentage: { type: Number, required: true }, // e.g., 91.6
  },
  { timestamps: true }
);
PuritySchema.index({ karat: 1, percentage: 1 }, { unique: true });
export default mongoose.model('Purity', PuritySchema);
