
import mongoose from 'mongoose';
const LocationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location_type: {
    type: String,
    enum: ["store", "vault", "workshop", "warehouse"],
    required: true
  },
  address: String,
  status: { type: Boolean, default: true }
}, { timestamps: true });
export default mongoose.model('Location', LocationSchema);