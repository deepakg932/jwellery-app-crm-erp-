
import mongoose from 'mongoose';
import InvoiceItemSchema from './InvoiceItem.js';
const WholesaleInvoiceSchema = new mongoose.Schema(
  {
    invoice_no: { type: String, required: true, unique: true },
    vendor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', index: true },
    branch_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    invoice_date: { type: Date, default: Date.now },
    total_amount: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    netamount: { type: Number, required: true },
    paidamount: { type: Number, default: 0 },
    dueamount: { type: Number, default: 0 },
    paymentstatus: { type: String, enum: ['unpaid', 'partial', 'paid'], default: 'unpaid' },
    paymentmode: { type: String, enum: ['cash', 'upi', 'card'], default: 'cash' },
    items: { type: [InvoiceItemSchema], default: [] },
  },
  { timestamps: true }
);
export default mongoose.model('WholesaleInvoice', WholesaleInvoiceSchema);
