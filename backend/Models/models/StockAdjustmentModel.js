import mongoose from "mongoose";

const StockAdjustmentSchema = new mongoose.Schema({
  inventory_item_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InventoryItem"
  },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch" },

  adjustmentType: {
    type: String,
    enum: ["IN", "OUT"]
  },

  reason: {
    type: String,
    enum: ["LOSS", "DAMAGE", "MELTING"]
  },

  grossWeight: Number,
  netWeight: Number,
  remark: String
}, { timestamps: true });

export default mongoose.model("StockAdjustment", StockAdjustmentSchema);
