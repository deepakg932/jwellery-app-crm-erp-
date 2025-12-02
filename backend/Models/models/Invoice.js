// src/models/Invoice.js
import mongoose from 'mongoose';
import InvoiceItemSchema from './InvoiceItem.js';
const InvoiceSchema = new mongoose.Schema(
  {
    invoice_no: { type: String, required: true, unique: true, trim: true },
    customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', index: true },
    branch_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true, index: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    invoice_date: { type: Date, default: Date.now },
    total_amount: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    netamount: { type: Number, required: true },
    paidamount: { type: Number, default: 0 },
    dueamount: { type: Number, default: 0 },
    paymentstatus: { type: String, enum: ['unpaid', 'partial', 'paid'], default: 'unpaid', index: true },
    paymentmode: { type: String, enum: ['cash', 'upi', 'card'], default: 'cash' },
    items: { type: [InvoiceItemSchema], default: [] },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);
export default mongoose.model('Invoice', InvoiceSchema);
