import mongoose from "mongoose";

const purchaseReturnSchema = new mongoose.Schema(
  {
    purchase_received_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StockIn",
      required: true,
    },

    supplier_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Suppliers",
      required: true,
    },

    branch_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },

    return_date: {
      type: Date,
      required: true,
    },

    return_reason: {
      type: String,
      required: true,
    },

    items: [
      {
        purchase_received_item_id: mongoose.Schema.Types.ObjectId,

        inventory_item_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "InventoryItem",
          required: true,
        },

        available_quantity: { type: Number, default: 0 },
        available_weight: { type: Number, default: 0 },

        return_quantity: { type: Number, default: 0 },
        return_weight: { type: Number, default: 0 },

        unit_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Unit",
        },
        unit_code: String,
        unit_name: String,

        cost: { type: Number, required: true },
        total_cost: { type: Number, required: true },

        reason: String,

        status: {
          type: String,
        //   enum: ["pending", "approved", "rejected", "completed"],
          default: "pending",
        },
      },
    ],

    total_cost: {
      type: Number,
      default: 0,
    },

    remarks: String,

    status: {
      type: String,
    //   enum: ["pending", "approved", "rejected", "completed"],
      default: "pending",
    },

    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("PurchaseReturn", purchaseReturnSchema);
