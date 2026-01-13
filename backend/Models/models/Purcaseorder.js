import mongoose from "mongoose";

const PurchaseOrderSchema = new mongoose.Schema({
  po_number: { type: String, unique: true },
  supplier_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Supplier",
    required: true
  },
  branch_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Branch",
    required: true
  },
  reference_no: String,
  po_date: Date,
  expected_date: Date,
  items: [{
    inventory_item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InventoryItem"
    },
    quantity: Number,
    weight: Number,
    rate: Number,
    unit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Unit"
    },
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: Number,
    metal_type: String,
    stone_type: String,
    material_type: String,
    metal_purity: String,
    stone_purity: String
  }],
  grand_total: Number,
  status: {
    type: String,
    enum: ["draft", "pending", "approved", "completed", "cancelled"],
    default: "draft"
  },
  remarks: String,
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

export default mongoose.model('PurchaseOrder', PurchaseOrderSchema);