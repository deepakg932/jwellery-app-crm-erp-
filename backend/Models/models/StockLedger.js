import mongoose from "mongoose";

const StockLedgerSchema = new mongoose.Schema({
  item: { type: mongoose.Schema.Types.ObjectId, ref: "InventoryItem", required: true },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", required: true },

  transactionType: {
    type: String,
    enum: ["IN", "OUT"],
    required: true
  },

  reason: {
    type: String,
    enum: [
      "PURCHASE",
      "SALE",
      "TRANSFER_IN",
      "TRANSFER_OUT",
      "ADJUSTMENT",
      "REPAIR_IN",
      "REPAIR_OUT",
      "OLD_GOLD"
    ],
    required: true
  },

  quantity: { type: Number, default: 0 },
  grossWeight: { type: Number, default: 0 },
  netWeight: { type: Number, default: 0 },
  stoneWeight: { type: Number, default: 0 },

  referenceId: mongoose.Schema.Types.ObjectId,
  createdBy: mongoose.Schema.Types.ObjectId
}, { timestamps: true });

export default mongoose.model("StockLedger", StockLedgerSchema);
