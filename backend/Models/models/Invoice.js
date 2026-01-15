import mongoose from "mongoose";

const InvoiceSchema = new mongoose.Schema(
  {
    invoice_number: {
      type: String,
      unique: true,
      required: true,
    },

    sale_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sale",
      required: true,
      unique: true, // 1 sale → 1 invoice
    },

    customer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    branch_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },

    invoice_date: {
      type: Date,
      default: Date.now,
    },

    items: Array, // copy from sale (snapshot)

    subtotal: Number,
    total_tax: Number,
    discount: Number,
    shipping_cost: Number,
    total_amount: Number,

    payment_status: {
      type: String,
      enum: ["pending", "partial", "paid"],
      default: "pending",
    },

    pdf_url: String, // stored PDF path

    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Invoice", InvoiceSchema);
