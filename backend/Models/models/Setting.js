
import mongoose from 'mongoose';
const SettingSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, trim: true },
    value: { type: String, required: true },
  },
  { timestamps: true }
);
export default mongoose.model('Setting', SettingSchema);
