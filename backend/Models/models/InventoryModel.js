// import mongoose from "mongoose";

// const InventoryItemSchema = new mongoose.Schema(
//   {
//     item_name: { type: String, required: true },

//     sku_code: { type: String, unique: true }, // optional auto-generate

//     inventory_category_id: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "InventoryCategory",
//       required: true
//     },

//     product_id: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Product",
//       default: null
//     },

//     track_by: {
//       type: String,
//       enum: ["weight", "quantity", "both"],
//       required: true
//     },

//     // 👇 NEW FIELDS
//     weight: {
//       type: Number,
//       default: null
//     },

//     quantity: {
//       type: Number,
//       default: null
//     },

//     metals: [{
//       metal_id: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "Metal"
//       }
//     }],

//     stones: [{
//       stone_id: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "StoneType"
//       }
//     }],
//     unit_id:{
//        type: mongoose.Schema.Types.ObjectId,
//         ref: "Unit"
//     },

//     materials: [{
//       material_id: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "MaterialTypes"
//       }
//     }],

//     status: { type: Boolean, default: true }
//   },
//   { timestamps: true }
// );

// export default mongoose.model("InventoryItem", InventoryItemSchema);



import mongoose from "mongoose";

const InventoryItemSchema = new mongoose.Schema(
  {
    item_name: {
      type: String,
      required: true,
      trim: true
    },
    material_type_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MaterialTypes",
      // required: true
    },
    
    sku_code: {
      type: String,
      unique: true,
 
    },
    
    inventory_category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InventoryCategory",

    },
    
    // For mixed items (both metal and stone)
    metals: [{
      metal_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Metal"
      },
      purity_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Purity",

      },
      purity_name: String,
      karat: Number,
      percentage: Number,
      metal_weight: Number,
      metal_weight: Number
    }],
    
    stones: [{
      stone_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "StoneType"  // Fixed: Changed from stonePurityModel to StoneType
      },
      stone_purity_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "stonePurityModel",  // Fixed: Changed from stonePurityModel to Purity

      },
      stone_quantity: Number,
      stone_weight: Number // If needed
    }],
    
    // Common tracking
    track_by: {
      type: String,
      enum: ['weight', 'quantity', 'both'],

    },
    other_materials: [{
      details: String,
      additional_info: String,
      // Add other fields as needed
    }],




    // Overall weight/quantity
    total_weight: Number,
    total_quantity: Number,
     stone_purity_value: String, // The purity value like "22"
  percentage: Number, // Percentage value
  stone_quantity: Number,
  stone_weight: Number, // If needed,
    
    unit_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Unit",
     
    },
    
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product"
    },
    
    status: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("InventoryItem", InventoryItemSchema);