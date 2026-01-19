// models/Quotation.js
import mongoose from "mongoose";

const QuotationItemSchema = new mongoose.Schema(
  {
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    product_code: String,
    product_name: String,

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    unit_price: {
      type: Number,
      required: true,
      min: 0,
    },

    discount: {
      type: Number,
      default: 0,
      min: 0,
    },

    tax_rate: {
      type: Number,
      default: 0,
      min: 0,
    },

    tax_amount: {
      type: Number,
      default: 0,
    },

    net_price: {
      type: Number,
      default: 0,
    },

    subtotal: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const QuotationSchema = new mongoose.Schema(
  {
    quotation_number: {
      type: String,
      unique: true,
      index: true,
    },

    customer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    quotation_date: {
      type: Date,
      required: true,
    },

    expiry_date: {
      type: Date,
      required: true,
    },

    items: [QuotationItemSchema],

    note: String,
    terms_conditions: String,

    shipping_cost: {
      type: Number,
      default: 0,
    },

    discount: {
      type: Number,
      default: 0,
    },

    tax_amount: {
      type: Number,
      default: 0,
    },

    subtotal: {
      type: Number,
      default: 0,
    },

    total_amount: {
      type: Number,
      default: 0,
    },

    grand_total: {
      type: Number,
      default: 0,
    },

    branch_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },

    status: {
      type: String,
      enum: ["draft", "sent", "approved", "rejected", "converted"],
      default: "draft",
    },

    valid_days: {
      type: Number,
      default: 30,
    },

    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Quotation", QuotationSchema);
