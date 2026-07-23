// // src/models/Product.js
// import mongoose from 'mongoose';
// import { MetalType, ProductStatus ,StoneType} from './shared.js';

// const ProductSchema = new mongoose.Schema(
//   {
//     // sku: { type: String, unique: true, required: true, trim: true },
//     sku: { type: String, unique: true,  trim: true },
//     barcode: { type: String, unique: true, sparse: true, trim: true },
//     name: { type: String, required: true, trim: true },
//     category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
//     subcategory_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Subcategory', index: true },
//     purity_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Purity', required: true, index: true },
//     metaltype: { type: String, enum: MetalType, required: true },
//     grossweight: { type: Number, required: true }, // DECIMAL(10,3)
//     net_weight: { type: Number, required: true },
//     stoneweight: { type: Number, default: 0 },
//     wastage: { type: Number, default: 0 },
//     makingcharge: { type: Number, default: 0 },
//     stone_charge: { type: Number, default: 0 },
//     certificationno: { type: String, trim: true },
//     cost_price: { type: Number, required: true },
//     mrp: { type: Number, required: true },
//     stone_type: { type: String, enum: StoneType, default: 'none' },
//        hallmark_verified: { type: Boolean, default: false },
//     hallmark_number: { type: String, trim: true },
//     hallmark_center: { type: String, trim: true },
//     hallmark_year: { type: Number },
//     branch_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true, index: true },
//     status: { type: String, enum: ProductStatus, default: 'in-stock', index: true },
//   },
//   { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
// );
// ProductSchema.index({ branch_id: 1, status: 1 });
// export default mongoose.model('Product', ProductSchema);




// import mongoose from "mongoose";

// const MetalSchema = new mongoose.Schema({
//   metal_type: String,
//   purity: String,
//   weight: Number,
//   unit: String,
//   rate_per_gram: Number,

//   // NEW FIELD
//   wastage: Number,            // numeric
//   wastage_type: String,       // "Percentage" | "Fixed"

//   making_charge_type: String,
//   making_charge_value: Number,

//   subtotal: Number
// }, { _id: false });

// const StoneSchema = new mongoose.Schema({
//   stone_name: String,
//   stone_type: String,
//   stone_purity: String,          // NEW

//   shape: String,
//   size: Number,
//   quantity: Number,
//   weight: Number,
//   price_per_carat: Number,

//   subtotal: Number
// }, { _id: false });

// const MaterialSchema = new mongoose.Schema({
//   material_type: String,
//   weight: Number,
//   unit: String,
//   rate_per_gram: Number,
//   subtotal: Number
// }, { _id: false });

// const ProductSchema = new mongoose.Schema({
//   // Basic
//   product_name: { type: String},
//   product_code: { type: String},
//   product_brand: { type: String, ref: "Brand" },

//   // Dropdowns
//   product_category: { type: String, ref:"Category" },
//   product_subcategory: { type: String ,ref:"Subcategory"},

//   // Pricing Logic
//   markup_percentage: { type: Number, default: 0 },

//   // Components
//   metals: [MetalSchema],
//   stones: [StoneSchema],
//   materials: [MaterialSchema],

//   // Totals
//   total_metals_cost: Number,
//   total_stones_cost: Number,
//   total_materials_cost: Number,
//   grand_total: Number,
//   selling_price: Number,

//   // GST / TAX
//   gst_no: { type: String },         // NEW
//   gst_percentage: { type: Number }, // optional

//   // Hallmark
//   hallmark_verified: { type: Boolean, default: false },
//   hallmark_number: { type: String },
//   hallmark_center: { type: String },
//   hallmark_year: { type: Number },

//   // Images
//   images: [{ type: String }],

//   // Status
//   status: { type: String, default: "active", index: true },

//   // Branch (optional)
//   branch_id: { type: mongoose.Schema.Types.ObjectId, ref: "Branch" }

// }, { timestamps: true });

// export default mongoose.model("Product", ProductSchema);




// import mongoose from "mongoose";
// const ProductSchema = new mongoose.Schema({
//   product_name: String,
//   product_code: String,
//   product_brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand' },

//   product_category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
//   product_subcategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Subcategory' },

//    gst_id: { type: mongoose.Schema.Types.ObjectId, ref: 'GstRate' },

//   metals: [
//     {
//       metal_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Metal' },
//       purity_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Purity' },
//       weight: Number,
//       unit: String,
//       rate_per_gram: Number,
//       wastage: Number,
//       wastage_type: String,
//       making_charge_type: String,
//       making_charge_value: Number,
//       subtotal: Number
//     }
//   ],

//   stones: [
//     {
//       stone_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Stone' },
//       quantity: Number,
//       weight: Number,
//       price_per_carat: Number,
//       subtotal: Number
//     }
//   ],

//   materials: [
//     {
//       material_type: String,
//       weight: Number,
//       unit: String,
//       rate_per_gram: Number,
//       subtotal: Number
//     }
//   ],

//   total_metals_cost: Number,
//   total_stones_cost: Number,
//   total_materials_cost: Number,
//   grand_total: Number,
//   selling_price: Number,

//   images: [String],
//   status: { type: String, default: "active" }
// });


// export default mongoose.model("Product", ProductSchema);














// import mongoose from "mongoose";

// const ProductSchema = new mongoose.Schema({
//   product_name: { type: String, required: true },
//   product_code: { type: String, unique: true },
//   product_brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand' },
//   product_category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
//   product_subcategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Subcategory' },
//   gst_id: { type: mongoose.Schema.Types.ObjectId, ref: 'GstRate' },
  
//   // Metals array
//   metals: [{
//     metal_type: String,
//     metal_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Metal' },
//     purity: String,
//     purity_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Purity' },
//     weight: { type: Number, default: 0 },
//     unit: String,
//     rate_per_gram: { type: Number, default: 0 },
//     making_charge_type: String,
//     making_charge_value: { type: Number, default: 0 },
//     subtotal: { type: Number, default: 0 }
//   }],
  
//   // Stones array
//   stones: [{
//     stone_name: String,
//     stone_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Stone' },
//     shape: String,
//     size: Number, // in mm
//     quantity: { type: Number, default: 0 },
//     weight: { type: Number, default: 0 }, // in carats
//     price_per_carat: { type: Number, default: 0 },
//     subtotal: { type: Number, default: 0 }
//   }],
  
//   // Materials array (from Materials & Wastage table)
//   materials: [{
//     wastage_type: String,
//     material_type: String,
//     weight: { type: Number, default: 0 },
//     unit: String,
//     rate_per_unit: { type: Number, default: 0 },
//     cost: { type: Number, default: 0 }
//   }],
  
//   // Pricing calculations
//   markup_percentage: { type: Number, default: 0 },
  
//   // Cost totals
//   total_metals_cost: { type: Number, default: 0 },
//   total_stones_cost: { type: Number, default: 0 },
//   total_materials_cost: { type: Number, default: 0 },
  
//   // GST details
//   gst_rate: String,
//   cgst_rate: String,
//   sgst_rate: String,
//   igst_rate: String,
  
//   // GST amounts
//   gst_amount: { type: Number, default: 0 },
//   cgst_amount: { type: Number, default: 0 },
//   sgst_amount: { type: Number, default: 0 },
//   igst_amount: { type: Number, default: 0 },
  
//   // Price totals
//   grand_total: { type: Number, default: 0 },
//   selling_price_before_tax: { type: Number, default: 0 },
//   selling_price_with_gst: { type: Number, default: 0 },
  
//   // Images
//   images: [String],
//   status: { type: String, default: "active" }
// }, { timestamps: true });

// export default mongoose.model("Product", ProductSchema);













// import mongoose from "mongoose";

// const ProductSchema = new mongoose.Schema({
//   // Basic Information
//   product_name: { type: String, required: true },
//   product_code: { type: String, unique: true },
//   product_brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand' },
//   product_category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
//   product_subcategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Subcategory' },
//   markup_percentage: { type: Number, default: 0 },
  
//   // Metals Table
//   metals: [{
//     metal_type: String,
//     metal_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Metal' },
//     purity: String,
//     purity_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Purity' },
//     weight: { type: Number, default: 0 },
//     unit: String,
//     rate_per_gram: { type: Number, default: 0 },
//     making_charge_type: String,
//     making_charge_value: { type: Number, default: 0 },
//     subtotal: { type: Number, default: 0 }
//   }],
  
//   // Stones Table
//   stones: [{
//     stone_name: String,
//     stone_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Stone' },
//     shape: String,
//     size: Number,
//     quantity: { type: Number, default: 0 },
//     weight: { type: Number, default: 0 },
//     price_per_carat: { type: Number, default: 0 },
//     subtotal: { type: Number, default: 0 }
//   }],
  
//   // Materials & Wastage Table
//   materials: [{
//     wastage_type: String,
//     material_type: String,
//     weight: { type: Number, default: 0 },
//     unit: String,
//     rate_per_unit: { type: Number, default: 0 },
//     cost: { type: Number, default: 0 }
//   }],
  

// wastage: [{
//     wastage_type: String,
//     material_type: String,
//     weight: { type: Number, default: 0 },
//     unit: String,
//     rate_per_unit: { type: Number, default: 0 },
//     cost: { type: Number, default: 0 },
//     _id: false
//   }],
  



//   // GST Rates
//   gst_rate: String,
//   cgst_rate: String,
//   sgst_rate: String,
//   igst_rate: String,
  
//   // GST Amounts
//   gst_amount: { type: Number, default: 0 },
//   cgst_amount: { type: Number, default: 0 },
//   sgst_amount: { type: Number, default: 0 },
//   igst_amount: { type: Number, default: 0 },
  
//   // Total Costs
//   total_metals_cost: { type: Number, default: 0 },
//   total_stones_cost: { type: Number, default: 0 },
//   total_materials_cost: { type: Number, default: 0 },
  
//   // Price Totals
//   grand_total: { type: Number, default: 0 },
//   selling_price_before_tax: { type: Number, default: 0 },
//   selling_price_with_gst: { type: Number, default: 0 },
  
//   // GST Details (Structured object)
//   gst_details: {
//     gst_rate: String,
//     cgst_rate: String,
//     sgst_rate: String,
//     igst_rate: String,
//     gst_amount: Number,
//     cgst_amount: Number,
//     sgst_amount: Number,
//     igst_amount: Number,
//     total_with_cgst_sgst: Number,
//     total_with_igst: Number
//   },
  
//   // Images
//   images: [String],
//   status: { type: String, default: "active" }
// }, { timestamps: true });

// export default mongoose.model("Product", ProductSchema);



// import mongoose from "mongoose";

// const ProductSchema = new mongoose.Schema({
//   // Basic Information
//   product_name: { type: String, required: true },
//   product_code: { type: String, unique: true, sparse: true },
  
//   // References to other collections (optional - for advanced filtering)
//   product_brand_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand' },
//   product_category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
//   product_subcategory_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Subcategory' },
//   gst_id: { type: mongoose.Schema.Types.ObjectId, ref: 'GstRate' },
  
//   // String values from frontend (for display and search)
//   product_brand: { type: String },
//   product_category: { type: String },
//   product_subcategory: { type: String },
//   markup_percentage: { type: Number, default: 0 },
  
//   // GST Details (both ID and string rates)
//   gst_rate: String,
//   cgst_rate: String,
//   sgst_rate: String,
//   igst_rate: String,
  
//   // Metals Table
//   metals: [{
//     metal_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Metal' },
//     metal_type: String,
//     purity_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Purity' },
//     purity: String,
//     weight: { type: Number, default: 0 },
//     unit: String,
//     rate_per_gram: { type: Number, default: 0 },
//     making_charge_type: String,
//     making_charge_value: { type: Number, default: 0 },
//     wastage: { type: Number, default: 0 },
//     wastage_type: { type: String, default: "Percentage" },
//     subtotal: { type: Number, default: 0 },
//     _id: false
//   }],
  
//   // Stones Table
//   stones: [{
//     stone_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Stone' },
//     stone_name: String,
//     stone_purity: String,
//     shape: String,
//     size: Number,
//     quantity: { type: Number, default: 0 },
//     weight: { type: Number, default: 0 },
//     price_per_carat: { type: Number, default: 0 },
//     subtotal: { type: Number, default: 0 },
//     _id: false
//   }],
  
//   // Materials & Wastage Table
//   materials: [{
//     wastage_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Wastage' },
//     wastage_type: String,
//     material_type: String,
//     weight: { type: Number, default: 0 },
//     unit: String,
//     rate_per_unit: { type: Number, default: 0 },
//     cost: { type: Number, default: 0 },
//     _id: false
//   }],
  
//   // Total Costs
//   total_metals_cost: { type: Number, default: 0 },
//   total_stones_cost: { type: Number, default: 0 },
//   total_materials_cost: { type: Number, default: 0 },
  
//   // GST Amounts
//   gst_amount: { type: Number, default: 0 },
//   cgst_amount: { type: Number, default: 0 },
//   sgst_amount: { type: Number, default: 0 },
//   igst_amount: { type: Number, default: 0 },
  
//   // Price Totals
//   grand_total: { type: Number, default: 0 },
//   selling_price_before_tax: { type: Number, default: 0 },
//   selling_price_with_gst: { type: Number, default: 0 },
  
//   // Images
//   images: [String],
  
//   // Status
//   status: { type: String, default: "active" }
// }, { timestamps: true });

// // Indexes for better performance
// ProductSchema.index({ product_code: 1 });
// ProductSchema.index({ product_name: 1 });
// ProductSchema.index({ product_category: 1 });
// ProductSchema.index({ status: 1 });

// export default mongoose.model("Product", ProductSchema);





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