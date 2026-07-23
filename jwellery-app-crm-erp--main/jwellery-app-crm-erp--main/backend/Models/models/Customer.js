// src/models/Customer.js
import mongoose from 'mongoose';
const CustomerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, trim: true, index: true },
    email: { type: String, lowercase: true, trim: true },
    address: { type: String, trim: true },
    city: { type: String, trim: true },
    loyaltypoints: { type: Number, default: 0 },
  },
  { timestamps: true }
);
export default mongoose.model('Customer', CustomerSchema);
