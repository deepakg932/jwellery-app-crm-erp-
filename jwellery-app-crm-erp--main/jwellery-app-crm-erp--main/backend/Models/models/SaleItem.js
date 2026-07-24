import mongoose from 'mongoose';

const SaleItemSchema = new mongoose.Schema(
  {
    customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
    branch_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', default: null },
    sold_by: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', default: null },
    sale_date: { type: Date, default: Date.now },

    items: [
      {
        product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        product_name: { type: String, default: '' },
        product_code: { type: String, default: '' },
        quantity: { type: Number, default: 1 },
        price_before_tax: { type: Number, default: 0 },
        gst_rate: { type: Number, default: 0 },
        gst_amount: { type: Number, default: 0 },
        selling_total: { type: Number, default: 0 },
        final_total: { type: Number, default: 0 },
        biller_by: { type: String, default: '' },
      },
    ],

    is_exchange: { type: Boolean, default: false },
    exchange_amount: { type: Number, default: 0 },
    exchange_note: { type: String, default: '' },
    exchange_item_name: { type: String, default: '' },
    exchange_item_weight: { type: Number, default: 0 },
    exchange_item_unit: { type: String, default: '' },
    exchange_item_actual_rate: { type: Number, default: 0 },
    exchange_item_image: { type: String, default: null },

    sale_note: { type: String, default: '' },
    shipping_cost: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    subtotal: { type: Number, default: 0 },
    total_tax: { type: Number, default: 0 },
    total_amount: { type: Number, default: 0 },

    status: { type: String, enum: ['draft', 'confirmed', 'cancelled'], default: 'draft' },
    sale_status: { type: String, enum: ['draft', 'confirmed', 'cancelled'], default: 'draft' },
    payment_status: { type: String, enum: ['pending', 'partial', 'paid'], default: 'pending' },

    current_paid: { type: Number, default: 0 },
    paid_amount: { type: Number, default: 0 },
    balance_amount: { type: Number, default: 0 },
    payment_date: { type: Date, default: null },
    payment_method: { type: String, default: '' },
    payment_notes: { type: String, default: '' },

    reference_no: { type: String, default: '' },

    has_invoice: { type: Boolean, default: false },
    invoice_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', default: null },
    invoice_number: { type: String, default: null },

    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

SaleItemSchema.pre('save', async function (next) {
  if (!this.reference_no) {
    const count = await mongoose.model('SaleItem').countDocuments();
    this.reference_no = `REF-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

export default mongoose.model('SaleItem', SaleItemSchema);
