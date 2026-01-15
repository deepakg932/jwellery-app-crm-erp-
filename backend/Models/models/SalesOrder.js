import mongoose from "mongoose";

const SalesOrderSchema = new mongoose.Schema(
  {
    // so_number: {
    //   type: String,
    //   unique: true,
    //   default: () => `SO-${Date.now()}`,
    // },

    sale_date: {
      type: Date,
      required: true,
    },

    reference_no: String,

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

    items: [
      {
        product_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },

        product_name: String,
        product_code: String,

        quantity: {
          type: Number,
          required: true,
        },

        price_before_tax: Number,
        gst_rate: Number,
        gst_amount: Number,
        selling_total: Number, // price + gst (per unit)
        final_total: Number, // selling_total * qty
      },
    ],

    shipping_cost: {
      type: Number,
      default: 0,
    },

    discount: {
      type: Number,
      default: 0,
    },

    subtotal: Number,
    total_tax: Number,
    total_amount: Number,

    payment_status: {
      type: String,
      enum: ["pending", "partial", "paid", "overdue"],
      default: "pending",
    },

    sale_status: {
      type: String,
      enum: [
        "draft",
        "pending",
        "approved",
        "completed",
        "returned",
        "cancelled",
        "shipped",
      ],
      default: "draft",
    },
    paid_amount: {
      type: Number,
      default: 0,
    },
 balance_amount: {
  type: Number,
  default: 0,
},


    payment_date: Date,

    payment_method: String,

    payment_notes: String,
    sale_note: String,

    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Sale", SalesOrderSchema);
