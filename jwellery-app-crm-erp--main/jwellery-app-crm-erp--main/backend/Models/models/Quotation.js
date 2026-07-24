import mongoose from 'mongoose';

const QuotationItemSchema = new mongoose.Schema({
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  product_name: { type: String, default: '' },
  product_code: { type: String, default: '' },
  quantity: { type: Number, default: 1 },
  unit_price: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  tax_rate: { type: Number, default: 0 },
  tax_amount: { type: Number, default: 0 },
  net_price: { type: Number, default: 0 },
  subtotal: { type: Number, default: 0 },
}, { _id: true });

const QuotationSchema = new mongoose.Schema(
  {
    quotation_number: { type: String, unique: true, trim: true },
    customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
    branch_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', default: null },
    quotation_date: { type: Date, default: Date.now },
    expiry_date: { type: Date, default: null },
    items: [QuotationItemSchema],
    status: { type: String, enum: ['draft', 'sent', 'accepted', 'rejected', 'converted', 'expired', 'cancelled'], default: 'draft' },
    note: { type: String, default: '' },
    shipping_cost: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    tax_amount: { type: Number, default: 0 },
    subtotal: { type: Number, default: 0 },
    total_amount: { type: Number, default: 0 },
    grand_total: { type: Number, default: 0 },
    terms_conditions: { type: String, default: '' },
    valid_days: { type: Number, default: 30 },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

QuotationSchema.pre('save', async function (next) {
  if (!this.quotation_number) {
    const count = await mongoose.model('Quotation').countDocuments();
    this.quotation_number = `QTN-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

export default mongoose.model('Quotation', QuotationSchema);
