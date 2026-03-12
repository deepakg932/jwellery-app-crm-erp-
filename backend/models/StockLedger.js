import mongoose from "mongoose";
const StockLedgerSchema = new mongoose.Schema({
  item_id: { type: mongoose.Schema.Types.ObjectId, ref: "InventoryItem" },
  branch_id: { type: mongoose.Schema.Types.ObjectId, ref: "Branch" },
  

  quantity: { type: Number, default: 0 },
  weight: { type: Number, default: 0 },  
  value: { type: Number, default: 0 },
  
  
  last_movement_id: { type: mongoose.Schema.Types.ObjectId, ref: "StockMovement" },
  last_updated: Date,
  
 
  reorder_point: Number,
  minimum_stock: Number,
  maximum_stock: Number
  
}, { timestamps: true });


StockLedgerSchema.index({ item_id: 1, branch_id: 1 }, { unique: true });

export default mongoose.model("StockLedger", StockLedgerSchema);