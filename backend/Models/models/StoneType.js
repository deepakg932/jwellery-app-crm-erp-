
import mongoose from 'mongoose';
const StoneTypeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    quality: { type: String, trim: true },
    color: { type: String, trim: true },
    clarity: { type: String, trim: true },
  },
  { timestamps: true }
);
export default mongoose.model('StoneType', StoneTypeSchema);
