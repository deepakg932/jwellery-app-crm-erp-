

const PurchaseOrderSchema = new mongoose.Schema({
  po_number: { type: String, unique: true },
  supplier_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Supplier",
    required: true
  },

  items: [{
    item_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InventoryItem"
    },
    quantity: Number,
    weight: Number,
    rate: Number
  }],

  status: {
    type: String,
    enum: ["pending", "approved", "completed", "cancelled"],
    default: "pending"
  },

  expected_date: Date
}, { timestamps: true });

export default mongoose.model('PurchaseOrder', PurchaseOrderSchema);