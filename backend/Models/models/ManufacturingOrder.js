import mongoose from "mongoose";
const ManufacturingOrderSchema = new mongoose.Schema({
  mo_number: { type: String, unique: true, default: () => `MO-${Date.now()}` },
  status: {
    type: String,
    enum: ["draft", "in_progress", "completed", "cancelled"],
    default: "draft"
  },
  
  // Input Materials (जो सामान use होगा)
  input_materials: [{
    item_id: { type: mongoose.Schema.Types.ObjectId, ref: "InventoryItem" },
    quantity: Number,
    weight: Number,
    unit_id: { type: mongoose.Schema.Types.ObjectId, ref: "Unit" },
    rate: Number,
    total_value: Number
  }],
  
  // Output Products (जो जेवर बनेगा)
  output_products: [{
    item_id: { type: mongoose.Schema.Types.ObjectId, ref: "InventoryItem" },
    quantity: Number,
    weight: Number,
    unit_id: { type: mongoose.Schema.Types.ObjectId, ref: "Unit" },
    expected_weight: Number,  // Design के according expected weight
    actual_weight: Number,    // Actual produced weight
    wastage: Number           // Loss/wastage in production
  }],
  
  // Labour & Costs
  labour_cost: Number,
  other_costs: Number,
  total_cost: Number,
  
  branch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch" },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  completed_date: Date
  
}, { timestamps: true });


export default mongoose.model('ManufacturingOrder', ManufacturingOrderSchema);