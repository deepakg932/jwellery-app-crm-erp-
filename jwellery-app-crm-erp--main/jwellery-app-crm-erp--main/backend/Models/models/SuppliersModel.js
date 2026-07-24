import mongoose from 'mongoose';

const SupplierSchema = new mongoose.Schema({
  supplier_name: { type: String, required: true },
  company_name: { type: String },
  contact_person: String,
  contact_person_number: String,
  phone: String,
  email: String,
  gst_no: String,
  gst_number: String,
  supplier_code: String,
  tax_number: String,
  address: String,
  city: String,
  state: String,
  country: String,
  pincode: String,
  payment_terms: String,
  payment_type: String,
  opening_balance: { type: Number, default: 0 },
  status: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Supplier', SupplierSchema);