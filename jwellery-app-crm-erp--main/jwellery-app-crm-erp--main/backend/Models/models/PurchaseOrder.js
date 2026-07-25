import mongoose from 'mongoose';

const parsePercent = (val) => {
  if (val === undefined || val === null || val === '') return 0;
  if (typeof val === 'number') return val;
  return parseFloat(String(val).replace('%', '').trim()) || 0;
};

const PurchaseOrderSchema = new mongoose.Schema(
  {
    vendor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', index: true },
    supplier_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', index: true },
    branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
    branch_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
    order_date: { type: Date, default: Date.now },
    orderdate: { type: Date, default: Date.now },
    status: { type: String, enum: ['draft', 'approved', 'received', 'cancelled', 'partial'], default: 'draft', index: true },
    payment_status: { type: String, enum: ['pending', 'partial', 'paid'], default: 'pending' },
    totalitems: { type: Number, default: 0 },
    items: [{ type: mongoose.Schema.Types.Mixed, default: [] }],
    vat: { type: Number, default: 0, set: parsePercent },
    tax: { type: Number, default: 0, set: parsePercent },
    discount: { type: Number, default: 0 },
    shipping_cost: { type: Number, default: 0 },
    subtotal: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    total_amount: { type: Number, default: 0 },
    grand_total: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' },
    exchange_rate: { type: Number, default: 1 },
    reference_no: { type: String, trim: true, default: '' },
    notes: { type: String, trim: true, default: '' },
    paid_amount: { type: Number, default: 0 },
    balance_amount: { type: Number, default: 0 },
    payment_method: { type: String, trim: true, default: '' },
    payment_date: { type: Date },
    payment_notes: { type: String, trim: true, default: '' },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdby: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);
export default mongoose.model('PurchaseOrder', PurchaseOrderSchema);
