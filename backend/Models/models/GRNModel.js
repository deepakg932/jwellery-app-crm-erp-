import mongoose from 'mongoose';



const GRNSchema = new mongoose.Schema({
  grn_number: { type: String, unique: true },

  po_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PurchaseOrder"
  },

  supplier_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Supplier"
  },

  location_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Location",
    required: true
  },

  items: [{
    item_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InventoryItem"
    },
    quantity: Number,
    gross_weight: Number,
    net_weight: Number,
    wastage_weight: Number,
    rate: Number,
    making_charge: Number,
    total_cost: Number
  }]
}, { timestamps: true });

export default mongoose.model('GRN', GRNSchema);