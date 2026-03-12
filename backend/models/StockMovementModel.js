import mongoose from "mongoose";


const StockMovementSchema = new mongoose.Schema({
  movement_type: {
    type: String,
    enum: ["PURCHASE", "SALE", "TRANSFER", "ADJUSTMENT", "MANUFACTURE", "WASTAGE"],
    required: true
  },
  item_id: { type: mongoose.Schema.Types.ObjectId, ref: "InventoryItem" },
  quantity: { type: Number, required: true },  
  weight: { type: Number, default: 0 },        
  rate: Number,
  total_value: Number,
  
  // References
  reference_id: { type: mongoose.Schema.Types.ObjectId }, 
  reference_type: String,  
  reference_number: String, 
  
  from_branch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch" },
  to_branch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch" },
  

  balance_quantity: Number,
  balance_weight: Number,
  balance_value: Number,
  
  remarks: String,
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

export default mongoose.model("StockMovement", StockMovementSchema);
