// src/models/Vendor.js
import mongoose from 'mongoose';
const VendorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, trim: true },
    phone: { type: String, trim: true },
    gst: { type: String, trim: true },
  },
  { timestamps: true }
);
export default mongoose.model('Vendor', VendorSchema);
