import mongoose from "mongoose";

const StockSchema = new mongoose.Schema(
  {
    inventory_item_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InventoryItem",
      required: true,
    },

    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },

    quantity: { type: Number, default: 0 },
    weight: { type: Number, default: 0 },

    avg_rate: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Stock", StockSchema);
