

import mongoose from "mongoose";

const PurchaseOrderSchema = new mongoose.Schema(
  {
    po_number: {
      type: String,
      unique: true,
      default: () => `PO-${Date.now()}`,
    },

    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },

    supplier_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Suppliers",
      required: true,
    },

    reference_no: String,

    currency: { type: String, default: "USD" },
    exchange_rate: { type: Number, default: 1 },

    order_date: { type: Date, default: Date.now },

    items: [
      {
        inventory_item_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "InventoryItem",
          required: true,
        },

        quantity: { type: Number, default: 0 },
        weight: { type: Number, default: 0 },

        received_quantity: { type: Number, default: 0 },
        received_weight: { type: Number, default: 0 },


        unit_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Unit",
          required: true,
        },

        rate: { type: Number, required: true },              
        // purchase_price: { type: Number, required: true },   // snapshot
        // net_unit_cost: { type: Number, required: true },    // landed cost

        discount: { type: Number, default: 0 },
        tax: { type: Number, default: 0 },
        total: { type: Number, default: 0 },
      },
    ],

    vat: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    shipping_cost: { type: Number, default: 0 },

    subtotal: { type: Number, default: 0 },
    total_amount: { type: Number, default: 0 },
    grand_total: { type: Number, default: 0 },

    payment_status: {
      type: String,
      enum: ["pending", "paid", "partial"],
      default: "pending",
    },

    status: {
      type: String,
      enum: ["draft", "approved", "partially_received", "received", "returned", "cancelled"],
      default: "draft",
    },

    notes: String,

    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("PurchaseOrder", PurchaseOrderSchema);

