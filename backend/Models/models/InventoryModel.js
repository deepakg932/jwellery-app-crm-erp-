import mongoose from "mongoose";

const InventoryItemSchema = new mongoose.Schema(
  {
    item_name: { type: String, required: true },

    sku_code: { type: String, unique: true }, // optional auto-generate

    inventory_category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InventoryCategory",
      required: true
    },

    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null
    },

    track_by: {
      type: String,
      enum: ["weight", "quantity", "both"],
      required: true
    },

    // 👇 NEW FIELDS
    weight: {
      type: Number,
      default: null
    },

    quantity: {
      type: Number,
      default: null
    },

    metals: [{
      metal_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Metal"
      }
    }],

    stones: [{
      stone_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "StoneType"
      }
    }],
    unit_id:{
       type: mongoose.Schema.Types.ObjectId,
        ref: "Unit"
    },

    materials: [{
      material_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MaterialTypes"
      }
    }],

    status: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model("InventoryItem", InventoryItemSchema);
