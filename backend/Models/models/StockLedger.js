import mongoose from "mongoose";
const StockLedgerSchema = new mongoose.Schema({
  item_id: { type: mongoose.Schema.Types.ObjectId, ref: "InventoryItem" },
  branch_id: { type: mongoose.Schema.Types.ObjectId, ref: "Branch" },
  
  // Current stock
  quantity: { type: Number, default: 0 },
  weight: { type: Number, default: 0 },  // in grams
  value: { type: Number, default: 0 },
  
  // Last update info
  last_movement_id: { type: mongoose.Schema.Types.ObjectId, ref: "StockMovement" },
  last_updated: Date,
  
  // Safety stock levels
  reorder_point: Number,
  minimum_stock: Number,
  maximum_stock: Number
  
}, { timestamps: true });

// Compound index for quick lookup
StockLedgerSchema.index({ item_id: 1, branch_id: 1 }, { unique: true });

export default mongoose.model("StockLedger", StockLedgerSchema);