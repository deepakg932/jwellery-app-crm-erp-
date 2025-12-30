import mongoose from "mongoose";


const InventoryStockSchema = new mongoose.Schema({
  inventory_item_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InventoryItem",
   
  },

  branch_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Branch"
  },


  current_quantity: {
    type: Number,
    default: 0
  },


  
  gross_weight: { type: Number, default: 0 },
  net_weight: { type: Number, default: 0 },
  stone_weight: { type: Number, default: 0 },


  current_weight: {
    type: Number,
    default: 0
  },


  average_cost: Number,
  total_value: Number,


  last_grn_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "GRN"
  },

  last_updated: {
    type: Date,
    default: Date.now
  }
});


export default mongoose.model('InventoryStock', InventoryStockSchema);


