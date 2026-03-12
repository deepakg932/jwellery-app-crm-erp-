import mongoose from "mongoose";

const GRNSchema = new mongoose.Schema(
  {
    grn_number: {
      type: String,
      unique: true,
      default: () => `GRN-${Date.now()}`,
    },

    purchase_order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PurchaseOrder",
      required: true,
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

    items: [
      {
        inventory_item_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "InventoryItem",
          required: true,
        },

        unit_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Unit",
          required: true,
        },

        received_quantity: { type: Number, default: 0 },
        received_weight: { type: Number, default: 0 },

        rate: { type: Number, required: true },
      },
    ],

    notes: String,

    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("GRN", GRNSchema);
