import mongoose from "mongoose";

const saleReturnSchema = new mongoose.Schema(
  {
    return_number: {
      type: String,
      unique: true,
      required: true,
    },

    sale_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sale",
      required: true,
    },

    sale_number: String,

    customer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    customer_name: String,

    return_date: {
      type: Date,
      required: true,
    },

    reference_no: String,

    items: [
      {
        product_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        product_name: String,
        product_code: String,

        original_quantity: Number,
        return_quantity: Number,

        price_before_tax: Number,
        gst_rate: Number,
        gst_amount: Number,
        selling_total: Number,
        final_total: Number,

        return_reason: String,
      },
    ],

    reason: String,

    return_type: {
      type: String,
      enum: ["full", "partial"],
      default: "partial",
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "completed"],
      default: "pending",
    },

    refund_amount: Number,
    total_amount: Number,

    notes: String,

    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    approved_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    approved_at: Date,
  },
  { timestamps: true }
);

export default mongoose.model("SaleReturn", saleReturnSchema);
