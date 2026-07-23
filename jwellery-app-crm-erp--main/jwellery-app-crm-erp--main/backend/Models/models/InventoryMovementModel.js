
import mongoose from 'mongoose';

const InventoryMovementSchema = new mongoose.Schema({
  item_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InventoryItem",
    required: true
  },

  movement_type: {
    type: String,
    enum: ["purchase", "sale", "transfer", "repair", "melt", "adjustment"],
    required: true
  },

  from_location_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Location"
  },

  to_location_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Location"
  },

  quantity: Number,
  weight: Number,

  reference_type: String, // PO, GRN, SALE
  reference_id: mongoose.Schema.Types.ObjectId,

  created_by: mongoose.Schema.Types.ObjectId
}, { timestamps: true });

export default mongoose.model('InventoryMovement', InventoryMovementSchema);