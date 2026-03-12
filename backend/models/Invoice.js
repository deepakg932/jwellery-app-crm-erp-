import mongoose from "mongoose";

const InvoiceSchema = new mongoose.Schema(
  {
    invoice_number: {
      type: String,
      unique: true,
    },

    sale_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sale",
      // // required: true,
      // unique: true, // 1 sale → 1 invoice
    },

    customer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
  
    },

    branch_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
    
    },
    repair_id: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Repair",
  default: null,
},


    invoice_date: {
      type: Date,
      default: Date.now,
    },

    
    items: Array,

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

    pdf_url: String, 

    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Invoice", InvoiceSchema);
