import mongoose from 'mongoose';

const CustomerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    mobile: { type: String, trim: true, index: true },
    whatsapp_number: { type: String, trim: true },
    email: { type: String, lowercase: true, trim: true },
    address: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    country: { type: String, trim: true },
    country_code: { type: String, trim: true },
    state_code: { type: String, trim: true },
    pincode: { type: String, trim: true },
    aadhar_number: { type: String, trim: true },
    tax_number: { type: String, trim: true },
    customer_group_id: { type: mongoose.Schema.Types.ObjectId, ref: 'CustomerGroup', default: null },
    image: { type: String, default: null },
    image_url: { type: String, default: null },
    loyaltypoints: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

export default mongoose.model('Customer', CustomerSchema);
