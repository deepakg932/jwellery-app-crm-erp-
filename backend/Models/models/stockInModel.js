import mongoose from "mongoose";

const stockInSchema = new mongoose.Schema(
  {
    po_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PurchaseOrder",
      default: null,
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

    received_date: {
      type: Date,
      required: true,
    },

    items: [
      {
        po_item_id: mongoose.Schema.Types.ObjectId,

        inventory_item_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "InventoryItem",
          required: true,
        },

        ordered_quantity: { type: Number, default: 0 },
        ordered_weight: { type: Number, default: 0 },

        // ✅ ONLY THESE TWO
        received_quantity: { type: Number, default: 0 },
        received_weight: { type: Number, default: 0 },

        unit_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Unit",
        },

        unit_code: String,
        unit_name: String,

        cost: { type: Number, required: true },
        total_cost: { type: Number, required: true },

      },
    ],

    total_cost: {
      type: Number,
      required: true,
    },

    remarks: String,

    status: {
      type: String,
      enum: ["pending", "partially_received", "received"],
      default: "received",
    },



     is_fully_returned: {
      type: Boolean,
      default: false,
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("StockIn", stockInSchema);
