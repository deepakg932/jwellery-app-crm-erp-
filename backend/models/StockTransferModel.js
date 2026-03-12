import mongoose from "mongoose";

const StockTransferSchema = new mongoose.Schema({
  fromBranch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch" },
  toBranch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch" },

  items: [{
    inventory_item_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InventoryItem"
    },
    quantity: Number,
    grossWeight: Number,
    netWeight: Number
  }],

  status: {
    type: String,
    enum: ["PENDING", "APPROVED"],
    default: "PENDING"
  }
}, { timestamps: true });

export default mongoose.model("StockTransfer", StockTransferSchema);
