import mongoose from 'mongoose';

const CustomerGroupSchema = new mongoose.Schema(
  {
    customer_group: { type: String, required: true, trim: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

export default mongoose.model('CustomerGroup', CustomerGroupSchema);
