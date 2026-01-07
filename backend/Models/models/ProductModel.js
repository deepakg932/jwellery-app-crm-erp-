import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    product_name: { type: String, unique: true },
    product_code: { type: String, sparse: true },

    hallmark_id: { type: mongoose.Schema.Types.ObjectId, ref: "Hallmark" },
    hallmark_name: { type: String },
    hallmark_purity: { type: String },

    product_brand_id: { type: mongoose.Schema.Types.ObjectId, ref: "Brand" },
    product_category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    product_subcategory_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subcategory",
    },

    product_brand: { type: String },
    product_category: { type: String },
    product_subcategory: { type: String },
    markup_percentage: { type: Number, default: 0 },

    gst_rate: String,
    cgst_rate: String,
    sgst_rate: String,
    igst_rate: String,
    utgst_rate: String,

    metals: [
      {
        metal_id: { type: mongoose.Schema.Types.ObjectId, ref: "Metal" },
        metal_type: String,
        purity_id: { type: mongoose.Schema.Types.ObjectId, ref: "Purity" },
        purity: String,
        hallmark_id: { type: mongoose.Schema.Types.ObjectId, ref: "Hallmark" },
        hallmark_name: String,
        weight: { type: Number, default: 0 },
        unit: String,
        rate_per_gram: { type: Number, default: 0 },
        making_charge_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "CostName",
        },
        making_charge_type: String,
        // making_charge_value: { type: Number, default: 0 },
        subtotal: { type: Number, default: 0 },
        _id: false,
      },
    ],

    stones: [
      {
        stone_id: { type: mongoose.Schema.Types.ObjectId, ref: "StoneType" },
        stone_type: String,
        stone_purity_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "stonePurityModel",
        },
        stone_purity: String,
        size: Number,
        quantity: { type: Number, default: 0 },
        weight: { type: Number, default: 0 },
        price_per_carat: { type: Number, default: 0 },
        subtotal: { type: Number, default: 0 },
        _id: false,
      },
    ],

    materials: [
      {
        wastage_id: { type: mongoose.Schema.Types.ObjectId, ref: "Wastage" },
        wastage_type: String,
        material_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "MaterialTypes",
        },
        material_type: String,
        weight: { type: Number, default: 0 },
        unit: String,
        rate_per_unit: { type: Number, default: 0 },
        cost: { type: Number, default: 0 },
        _id: false,
      },
    ],

    price_making_costs: [
      {
        price_making_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "PriceMaking",
        },
        stage_name: String,
        sub_stage_name: String,
        cost_type: String,
        unit_name: String,
        cost_amount: { type: Number, default: 0 },
        is_active: { type: Boolean, default: true },
        _id: false,
      },
    ],

    total_metals_cost: { type: Number, default: 0 },
    total_stones_cost: { type: Number, default: 0 },
    total_materials_cost: { type: Number, default: 0 },
    total_price_making_costs: { type: Number, default: 0 },
    base_total: { type: Number, default: 0 }, // metals + stones + materials
    grand_total: { type: Number, default: 0 }, // base_total + price_making_costs

    gst_amount: { type: Number, default: 0 },
    cgst_amount: { type: Number, default: 0 },
    sgst_amount: { type: Number, default: 0 },
    igst_amount: { type: Number, default: 0 },
    utgst_amount: { type: Number, default: 0 },

    selling_price_before_tax: { type: Number, default: 0 },
    selling_price_with_gst: { type: Number, default: 0 },

    images: [String],

    status: {
      type: String,
      enum: ["draft", "active", "inactive", "out_of_stock", "discontinued"],
      default: "draft",
    },
  },
  { timestamps: true }
);

ProductSchema.index({ product_code: 1 });
ProductSchema.index({ product_name: 1 });
ProductSchema.index({ product_category: 1 });
ProductSchema.index({ status: 1 });
ProductSchema.index({ "price_making_costs.cost_type": 1 });

export default mongoose.model("Product", ProductSchema);
