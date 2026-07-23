
import mongoose from 'mongoose';



const InventoryStockSchema = new mongoose.Schema({
  item_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InventoryItem",
    required: true
  },

  location_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Location",
    required: true
  },

  available_quantity: { type: Number, default: 0 },
  available_weight: { type: Number, default: 0 },

  average_cost: { type: Number, default: 0 }
});

export default mongoose.model('InventoryStock', InventoryStockSchema);