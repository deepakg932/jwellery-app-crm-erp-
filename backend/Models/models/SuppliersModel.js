import mongoose from 'mongoose';

const SupplierSchema = new mongoose.Schema({
  supplier_name: { type: String, required: true },
  contact_person: String,
  phone: String,
  email: String,

  gst_no: String,
  address: String,

  payment_terms: String,
  opening_balance: { type: Number, default: 0 },

  status: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Supplier', SupplierSchema);