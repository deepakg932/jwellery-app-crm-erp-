import mongoose from "mongoose";
const InventoryCategorySchema = new mongoose.Schema({
  name: { type: String },

  // parent_category_id: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "InventoryCategory",
  //   default: null
  // },

  // metals: [{
  //   metal_id: {
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: "Metal"
  //   }
  // }],

  // stones: [{
  //   stone_id: {
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: "StoneType"
  //   }
  // }],

  // materials: [{
  //   material_id: {
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: "MaterialTypes"
  //   }
  // }],

  status: { type: Boolean, default: true }
}, { timestamps: true });


export default mongoose.model("InventoryCategory", InventoryCategorySchema);
