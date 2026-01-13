// models/Invoice.js
import mongoose from "mongoose";

const InvoiceSchema = new mongoose.Schema(
  {
    invoice_number: {
      type: String,
      unique: true,
      default: () => `INV-${Date.now()}`
    },

    sale_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SalesOrder",
      required: true
    },

    customer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true
    },

    items: [
      {
        item_id: { type: mongoose.Schema.Types.ObjectId, ref: "InventoryItem" },
        quantity: Number,
        rate: Number,
        tax: Number,
        total: Number
      }
    ],

    subtotal: Number,
    tax_amount: Number,
    grand_total: Number,

    payment_status: {
      type: String,
      enum: ["pending", "partial", "paid"],
      default: "pending"
    },

    generated_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
);

export default mongoose.model("Invoice", InvoiceSchema);
