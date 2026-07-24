import mongoose from 'mongoose';

const CustomOrderSchema = new mongoose.Schema(
  {
    order_number: { type: String, unique: true, trim: true },
    customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
    weight: { type: Number, default: 0 },
    unit_id: { type: mongoose.Schema.Types.ObjectId, ref: 'unitModel', default: null },
    metal_type_id: { type: mongoose.Schema.Types.ObjectId, ref: 'MetalType', default: null },
    purity_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Purity', default: null },
    delivery_date: { type: Date, default: null },
    status: { type: String, enum: ['pending', 'design', 'making', 'stone_setting', 'polishing', 'quality_check', 'ready', 'completed', 'cancelled', 'in_progress'], default: 'pending' },
    notes: { type: String, default: '' },
    images: [{ type: String }],
  },
  { timestamps: true }
);

CustomOrderSchema.pre('save', async function (next) {
  if (!this.order_number) {
    const count = await mongoose.model('CustomOrder').countDocuments();
    this.order_number = `ORD-${Date.now()}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

export default mongoose.model('CustomOrder', CustomOrderSchema);
