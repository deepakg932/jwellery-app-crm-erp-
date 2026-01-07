// import mongoose from "mongoose";

// const InventoryItemSchema = new mongoose.Schema(
//   {
//     item_name: {
//       type: String,
//       required: true,
//       trim: true
//     },
//     material_type_id: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "MaterialTypes",
//       // required: true
//     },

//     sku_code: {
//       type: String,
//       unique: true,

//     },

//     inventory_category_id: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "InventoryCategory",

//     },

//     // For mixed items (both metal and stone)
//     metals: [{
//       metal_id: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "Metal"
//       },
//       purity_id: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "Purity",

//       },
//       purity_name: String,
//       karat: Number,
//       percentage: Number,
//       metal_weight: Number,
//       metal_weight: Number
//     }],

//     stones: [{
//       stone_id: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "StoneType"  // Fixed: Changed from stonePurityModel to StoneType
//       },
//       stone_purity_id: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "stonePurityModel",  // Fixed: Changed from stonePurityModel to Purity

//       },
//       stone_quantity: Number,
//       stone_weight: Number // If needed
//     }],

//     // Common tracking
//     track_by: {
//       type: String,
//       enum: ['weight', 'quantity', 'both'],

//     },
//     other_materials: [{
//       details: String,
//       additional_info: String,
//       // Add other fields as needed
//     }],

//     // Overall weight/quantity
//     total_weight: Number,
//     total_quantity: Number,
//      stone_purity_value: String, // The purity value like "22"
//   percentage: Number, // Percentage value
//   stone_quantity: Number,
//   stone_weight: Number, // If needed,

//     unit_id: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Unit",

//     },

//     product_id: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Product"
//     },

//     status: {
//       type: Boolean,
//       default: true
//     }
//   },
//   { timestamps: true }
// );

// export default mongoose.model("InventoryItem", InventoryItemSchema);

import mongoose from "mongoose";


const InventoryItemSchema = new mongoose.Schema(
  {
    // ==================== BASIC INFORMATION ====================
    item_name: {
      type: String,
      required: true,
      trim: true,
    },
    
    item_code: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    
    sku_code: {
      type: String,
      unique: true,
      sparse: true,
    },

    inventory_category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InventoryCategory",
      required: true,
    },

    item_type: {
      type: String,
      enum: ["metal", "stone", "material", "jewelry"],
      default: "jewelry",
    },

    // ==================== METAL DETAILS ====================
    metals: [
      {
        metal_type: String,
        purity: String,
        weight: Number,
        color: String,
        hallmark: String,
        _id: false,
      },
    ],

    // ==================== STONE DETAILS ====================
    stones: [
      {
        stone_type: String,
        shape: String,
        color: String,
        clarity: String,
        carat_weight: Number,
        quantity: Number,
        certificate_type: String,
        _id: false,
      },
    ],

    // ==================== JEWELRY DETAILS ====================
    design_number: {
      type: String,
      unique: true,
      sparse: true,
    },
    
    jewelry_type: String,
    size: String,
    gender: String,
    occasion: String,

    // ==================== COST & PRICING ====================
    gold_rate: Number,
    metal_weight: Number,
    metal_cost: Number,
    
    stone_rate: Number,
    total_carat: Number,
    stone_cost: Number,
    
    making_charges: {
      type: Number,
      default: 0,
    },
    
    making_type: {
      type: String,
      default: "percentage",
    },
    
    wastage_percentage: {
      type: Number,
      default: 5,
    },
    
    wastage_charges: {
      type: Number,
      default: 0,
    },
    
    total_cost_price: {
      type: Number,
      default: 0,
    },
    
    profit_margin: {
      type: Number,
      default: 20,
    },
    
    selling_price: {
      type: Number,
      default: 0,
    },
    
    mrp: {
      type: Number,
      default: 0,
    },
    
    discount_type: {
      type: String,
      default: "none",
    },
    
    discount_value: {
      type: Number,
      default: 0,
    },
    
    final_price: {
      type: Number,
      default: 0,
    },

    // ==================== TAX ====================
    gst_percentage: {
      type: Number,
      default: 3,
    },
    
    cgst: {
      type: Number,
      default: 1.5,
    },
    
    sgst: {
      type: Number,
      default: 1.5,
    },
    
    total_tax: {
      type: Number,
      default: 0,
    },
    
    price_with_tax: {
      type: Number,
      default: 0,
    },

    // ==================== BRANCH & STOCK ====================
    branch_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },
    
    branch_name: String,
    
    current_stock: {
      type: Number,
      default: 1,
    },
    
    minimum_stock: {
      type: Number,
      default: 1,
    },
    
    stock_status: {
      type: String,
      default: "available",
    },
    
    location_type: {
      type: String,
      default: "showcase",
    },
    
    location_details: String,

    // ==================== SUPPLIER ====================
    supplier_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
    },
    
    supplier_name: String,
    
    purchase_date: Date,
    
    purchase_invoice: String,
    
    purchase_price: {
      type: Number,
      default: 0,
    },

    // ==================== IMAGES ====================
    images: [String],

    // ==================== ADDITIONAL INFO ====================
    description: String,
    
    tags: String,

    // ==================== STATUS ====================
    status: {
      type: String,
      default: "active",
    },
    
    is_new_arrival: {
      type: Boolean,
      default: true,
    },
    
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    
    created_at: {
      type: Date,
      default: Date.now,
    },
    
    updated_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

// ==================== PRE-SAVE MIDDLEWARE (SIMPLIFIED) ====================
// ==================== PRE-SAVE MIDDLEWARE (FIXED) ====================
// ==================== PRE-SAVE MIDDLEWARE (NO NEXT FUNCTION) ====================
InventoryItemSchema.pre("save", function() {
  console.log("🔍 Pre-save middleware triggered");
  
  // Simple date updates - no async operations
  const now = new Date();
  this.updated_at = now;
  
  if (!this.created_at) {
    this.created_at = now;
  }
  
  // Calculate metal weight
  if (this.metals && this.metals.length > 0) {
    this.metal_weight = this.metals.reduce((sum, metal) => sum + (metal.weight || 0), 0);
  }
  
  // Calculate total carat
  if (this.stones && this.stones.length > 0) {
    this.total_carat = this.stones.reduce((sum, stone) => sum + (stone.carat_weight || 0), 0);
  }
  
  // Calculate metal cost
  if (this.gold_rate && this.metal_weight) {
    this.metal_cost = this.gold_rate * this.metal_weight;
  }
  
  // Calculate stone cost
  if (this.stone_rate && this.total_carat) {
    this.stone_cost = this.stone_rate * this.total_carat;
  }
  
  // Calculate wastage charges
  if (this.wastage_percentage > 0 && this.metal_cost) {
    this.wastage_charges = (this.metal_cost * this.wastage_percentage) / 100;
  }
  
  // Calculate making charges
  let makingChargesAmount = this.making_charges;
  if (this.making_type === "per_gram" && this.metal_weight) {
    makingChargesAmount = this.metal_weight * this.making_charges;
  } else if (this.making_type === "percentage" && this.metal_cost) {
    makingChargesAmount = (this.metal_cost * this.making_charges) / 100;
  }
  
  // Calculate total cost
  this.total_cost_price = (this.metal_cost || 0) + 
                         (this.stone_cost || 0) + 
                         makingChargesAmount + 
                         (this.wastage_charges || 0);
  
  // Calculate selling price
  if (this.total_cost_price > 0 && this.profit_margin > 0) {
    this.selling_price = this.total_cost_price * (1 + this.profit_margin / 100);
  }
  
  // Calculate MRP
  if (this.selling_price > 0 && !this.mrp) {
    this.mrp = this.selling_price * 1.18;
  }
  
  // Calculate final price
  this.final_price = this.selling_price;
  if (this.discount_type === "percentage" && this.discount_value > 0) {
    this.final_price = this.selling_price * (1 - this.discount_value / 100);
  } else if (this.discount_type === "fixed" && this.discount_value > 0) {
    this.final_price = this.selling_price - this.discount_value;
  }
  
  // Calculate tax
  if (this.final_price > 0) {
    this.total_tax = this.final_price * (this.gst_percentage / 100);
    this.cgst = this.total_tax / 2;
    this.sgst = this.total_tax / 2;
    this.price_with_tax = this.final_price + this.total_tax;
  }
  
  // Update stock status
  if (this.current_stock <= 0) {
    this.stock_status = "sold";
  } else if (this.current_stock <= this.minimum_stock) {
    this.stock_status = "low";
  } else {
    this.stock_status = "available";
  }
  
  // Generate SKU code
  if (!this.sku_code) {
    const jewelryCode = this.jewelry_type ? 
      this.jewelry_type.substring(0, 3).toUpperCase() : 
      "JWL";
    const dateCode = new Date().getFullYear().toString().slice(-2) + 
                    (new Date().getMonth() + 1).toString().padStart(2, '0');
    const randomCode = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.sku_code = `${jewelryCode}-${dateCode}-${randomCode}`;
  }
  
  // No need to call next() - Mongoose will automatically continue
  console.log("✅ Pre-save calculations completed");
});

// ==================== INDEXES ====================
InventoryItemSchema.index({ item_code: 1 }, { unique: true });
InventoryItemSchema.index({ sku_code: 1 }, { unique: true, sparse: true });
InventoryItemSchema.index({ design_number: 1 }, { unique: true, sparse: true });
InventoryItemSchema.index({ branch_id: 1 });
InventoryItemSchema.index({ jewelry_type: 1 });

export default mongoose.model("InventoryItem", InventoryItemSchema);


