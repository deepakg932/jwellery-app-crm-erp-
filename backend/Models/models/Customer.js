// src/models/Customer.js
import mongoose from 'mongoose';
const customerSchema = new mongoose.Schema({
  name: String,
  mobile: String,
  address: String,
  gstNo: String,
  openingBalance: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model("Customer", customerSchema);

