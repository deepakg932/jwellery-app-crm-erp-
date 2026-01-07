import mongoose from "mongoose";
const InventoryCategorySchema = new mongoose.Schema(
  {
    name: { type: String },
    


    category_code: {
       type: String,
       unique: true
      },

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

    description: {
      type: String,
    },
    status: { type: Boolean, default: true },
  },
  { timestamps: true }
);



InventoryCategorySchema.pre("save", async function () {
  if (!this.category_code) {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    this.category_code = `CAT-${Date.now()}-${randomSuffix}`;
  }
});

export default mongoose.model("InventoryCategory", InventoryCategorySchema);
