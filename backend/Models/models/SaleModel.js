import mongoose from "mongoose";

const SalesOrderSchema = new mongoose.Schema(
  {
    so_number: {
      type: String,
      unique: true,
      default: () => `SO-${Date.now()}`,
    },

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

    // biller_id: {  
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Biller",
    // },

    currency: {
      type: String,
      default: "USD",
    },

    exchange_rate: {
      type: Number,
      default: 1,
    },

    items: [
      {
        item_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "InventoryItem",
          required: true,
        },
        quantity: { type: Number, default: 0 },
        weight: { type: Number, default: 0 },
        unit_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Unit",
        },
        rate: Number,
        discount: { type: Number, default: 0 },
        net_unit_price: Number,
        tax: { type: Number, default: 0 },
        total: Number,

        delivered_quantity: { type: Number, default: 0 },
        delivered_weight: { type: Number, default: 0 },

        status: {
          type: String,
          enum: ["pending", "partially_delivered", "delivered", "completed"],
          default: "pending",
        },
      },
    ],

    order_tax: { type: Number, default: 0 },
    paid_amount: { type: Number, default: 0 },

    order_discount_type: {
      type: String,
      enum: ["flat", "percentage"],
      default: "flat",
    },

    order_discount_value: { type: Number, default: 0 },

    shipping_cost: { type: Number, default: 0 },

    total_amount: Number,
    grand_total: Number,
    payment_status: { enum: ["pending", "partial", "paid", "overdue"] },

    sale_status: {
      type: String,
      enum: ["pending", "completed", "cancelled"],
      default: "pending",
    },

    sale_note: String,
    staff_note: String,

    document: String,

    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Sale", SalesOrderSchema);
