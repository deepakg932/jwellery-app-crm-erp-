

import mongoose from "mongoose";

const InventoryItemSchema = new mongoose.Schema(
  {
   item_code: {
      type: String,
      unique: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },

    // branch: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Branch",
    //   required: true
    // },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InventoryCategory",
      required: true
    },

    sub_category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InventorySubCategory",
      default: null
    },

    purity: {
      type: String,
      trim: true,
      default: ""
    },

    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Suppliers",
      default: null
    },

    description: {
      type: String,
      trim: true,
      default: ""
    },

    
    purchase_price: {
      type: Number,
      required: true,
      min: 0
    },

    profit_margin: {
      type: Number,
      default: 25
    },

    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },

    tax: {
      type: Number,
      default: 0,
    
    },

  
    // selling_price: Number,
    discount_amount: Number,
    tax_amount: Number,
    final_price: Number,

    
    images: [{ type: String }],

   
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active"
    },

    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

export default mongoose.model("InventoryItem", InventoryItemSchema);



