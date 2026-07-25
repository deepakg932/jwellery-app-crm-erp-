import mongoose from 'mongoose';

const StockInSchema = new mongoose.Schema({
  grn_number: { type: String, unique: true },
  po_id: { type: mongoose.Schema.Types.ObjectId, ref: 'PurchaseOrder' },
  supplier_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
  branch_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
  received_date: { type: Date, default: Date.now },
  items: [{
    po_item_id: { type: mongoose.Schema.Types.ObjectId },
    inventory_item_id: { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryItem' },
    ordered_quantity: { type: Number, default: 0 },
    ordered_weight: { type: Number, default: 0 },
    unit_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit' },
    unit_code: { type: String },
    unit_name: { type: String },
    cost: { type: Number, default: 0 },
    total_cost: { type: Number, default: 0 },
    received_quantity: { type: Number, default: 0 },
    received_weight: { type: Number, default: 0 },
    remarks: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'partially_received', 'received'], default: 'pending' },
  }],
  remarks: { type: String, default: '' },
  total_cost: { type: Number, default: 0 },
  status: { type: String, enum: ['draft', 'received', 'partial', 'cancelled'], default: 'received' },
}, { timestamps: true });

export default mongoose.model('StockIn', StockInSchema);
