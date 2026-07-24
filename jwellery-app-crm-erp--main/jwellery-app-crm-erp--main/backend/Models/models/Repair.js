import mongoose from 'mongoose';

const RepairSchema = new mongoose.Schema(
  {
    repair_number: { type: String, unique: true, trim: true },
    customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
    employee_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', default: null },
    product_name: { type: String, default: '' },
    product_module: { type: String, default: '' },
    product_type: { type: String, enum: ['manual', 'existing'], default: 'manual' },
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null },
    product_code: { type: String, default: '' },
    is_custom_product: { type: Boolean, default: false },
    problem_description: { type: String, default: '' },
    note: { type: String, default: '' },
    repair_charge: { type: Number, default: 0 },
    paid_amount: { type: Number, default: 0 },
    due_amount: { type: Number, default: 0 },
    receiving_date: { type: Date, default: Date.now },
    delivery_date: { type: Date, default: null },
    status: {
      type: String,
      enum: ['pending', 'received', 'in_progress', 'in-repair', 'ready', 'ready_for_delivery', 'delivered', 'cancelled'],
      default: 'pending',
    },
    account: { type: String, enum: ['cash', 'card', 'upi', 'bank_transfer', 'credit', 'multiple'], default: 'cash' },
    payment_status: { type: String, enum: ['unpaid', 'partial', 'paid'], default: 'unpaid' },
    sale_item_id: { type: mongoose.Schema.Types.ObjectId, ref: 'SaleItem', default: null },
    repair_images: [{ type: String }],
    invoice: {
      _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' },
      invoice_number: { type: String, default: '' },
      total_amount: { type: Number, default: 0 },
      due_amount: { type: Number, default: 0 },
      payment_status: { type: String, default: 'unpaid' },
    },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

RepairSchema.pre('save', async function (next) {
  if (!this.repair_number) {
    const count = await mongoose.model('Repair').countDocuments();
    this.repair_number = `RP-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

export default mongoose.model('Repair', RepairSchema);
