

import mongoose from "mongoose";

const SalesOrderSchema = new mongoose.Schema(
  {
    sale_date: { type: Date},

    reference_no: String,

    paid_amount: {
  type: Number,
  default: 0,
},


    customer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      
    },

    branch_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
   
    },

    items: [
      {
        product_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          
        },
        product_name: String,
        product_code: String,
        quantity: { type: Number},
        price_before_tax: Number,
        gst_rate: Number,
        gst_amount: Number,
        selling_total: Number,
        final_total: Number,
      },
    ],

    // ================= EXCHANGE =================
    is_exchange: { type: Boolean, default: false },

    exchange_amount: { type: Number, default: 0 },
    exchange_note: String,

    exchange_details: {
      item_name: String,
     weight: Number,              // 🔥 original value (10)
  unit: String,     // 🔥 normalized (10000)
  weight_in_gram: Number,   // ✅ YE LINE ADD KARO

  actual_rate: Number,         // per gram
  calculated_value: Number,

      image: String,
    },

    // ================= TOTALS =================
    shipping_cost: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },

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
      default: "draft",
    },

    sold_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },

    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);


export default mongoose.model("Sale", SalesOrderSchema);