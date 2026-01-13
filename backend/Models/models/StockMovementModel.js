import mongoose from "mongoose";

// models/StockMovement.js
const StockMovementSchema = new mongoose.Schema({
  movement_type: {
    type: String,
    enum: ["PURCHASE", "SALE", "TRANSFER", "ADJUSTMENT", "MANUFACTURE", "WASTAGE"],
    required: true
  },
  item_id: { type: mongoose.Schema.Types.ObjectId, ref: "InventoryItem" },
  quantity: { type: Number, required: true },  // +ve for in, -ve for out
  weight: { type: Number, default: 0 },        // grams
  rate: Number,  // per unit rate
  total_value: Number,
  
  // References
  reference_id: { type: mongoose.Schema.Types.ObjectId },  // PO, SO, etc.
  reference_type: String,  // "PURCHASE_ORDER", "SALES_ORDER", etc.
  reference_number: String, // "PO-123", "SO-456"
  
  from_branch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch" },
  to_branch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch" },
  
  // Stock after movement
  balance_quantity: Number,
  balance_weight: Number,
  balance_value: Number,
  
  remarks: String,
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

export default mongoose.model("StockMovement", StockMovementSchema);
