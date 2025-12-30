




import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  // Basic Information
  product_name: { type: String, required: true ,unique:true},
  product_code: { type: String, unique: true, sparse: true },
 
  // References to other collections (for relationships)
  product_brand_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand' },
  product_category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  product_subcategory_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Subcategory' },
 
  // String values for display (populated from IDs)
  product_brand: { type: String },
  product_category: { type: String },
  product_subcategory: { type: String },
  markup_percentage: { type: Number, default: 0 },
 
  // GST Details (as strings for display)
  gst_rate: String,
  cgst_rate: String,
  sgst_rate: String,
  igst_rate: String,
  utgst_rate: String,
 
  // Metals Table
  metals: [{
    metal_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Metal' },
    metal_type: String,
    purity_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Purity' },
    purity: String,
    weight: { type: Number, default: 0 },
    unit: String,
    rate_per_gram: { type: Number, default: 0 },
     making_charge_id: { type: mongoose.Schema.Types.ObjectId, ref: 'CostName' },
    making_charge_type: String,
    // making_charge_value: { type: Number, default: 0 },
    subtotal: { type: Number, default: 0 },
    _id: false
  }],
 
  // Stones Table
  stones: [{
    stone_id: { type: mongoose.Schema.Types.ObjectId, ref: 'StoneType' },
    stone_type: String,
    stone_purity_id:{type:mongoose.Schema.Types.ObjectId, ref: 'stonePurityModel' },
    stone_purity: String,
    size: Number,
    quantity: { type: Number, default: 0 },
    weight: { type: Number, default: 0 },
    price_per_carat: { type: Number, default: 0 },
    subtotal: { type: Number, default: 0 },
    _id: false
  }],
 
  // Materials & Wastage Table
  materials: [{
    wastage_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Wastage' },
    wastage_type: String,
     material_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'MaterialTypes' // यह model name से match होना चाहिए
  },
    material_type: String,
    weight: { type: Number, default: 0 },
    unit: String,
    rate_per_unit: { type: Number, default: 0 },
    cost: { type: Number, default: 0 },
    _id: false
  }],
 
  // Total Costs
  total_metals_cost: { type: Number, default: 0 },
  total_stones_cost: { type: Number, default: 0 },
  total_materials_cost: { type: Number, default: 0 },
 
  // GST Amounts
  gst_amount: { type: Number, default: 0 },
  cgst_amount: { type: Number, default: 0 },
  sgst_amount: { type: Number, default: 0 },
  igst_amount: { type: Number, default: 0 },
  utgst_amount:{ type: Number, default: 0 },
 
  // Price Totals
  grand_total: { type: Number, default: 0 },
  selling_price_before_tax: { type: Number, default: 0 },
  selling_price_with_gst: { type: Number, default: 0 },
 

  images: [String],
 
status: { 
    type: String, 
    enum: ["draft", "active", "inactive", "out_of_stock", "discontinued"],
    default: "draft" 
  },
}, { timestamps: true });


ProductSchema.index({ product_code: 1 });
ProductSchema.index({ product_name: 1 });
ProductSchema.index({ product_category: 1 });
ProductSchema.index({ status: 1 });

export default mongoose.model("Product", ProductSchema);