import mongoose from "mongoose";

const StockLedgerSchema = new mongoose.Schema({
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InventoryItem",
    required: true
  },

  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Branch",
    required: true
  },

  transactionType: { type: String, enum: ["IN", "OUT"], required: true },
  reason: { type: String, required: true },

  quantity: Number,
  grossWeight: Number,
  netWeight: Number,
  stoneWeight: Number,

  referenceType: String,
  referenceId: mongoose.Schema.Types.ObjectId
}, { timestamps: true });


export default mongoose.model("StockLedger", StockLedgerSchema);
