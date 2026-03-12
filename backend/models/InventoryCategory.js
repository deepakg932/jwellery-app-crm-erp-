import mongoose from "mongoose";

const InventoryCategorySchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true 
    },
   
    description: {
      type: String,
    },
    status: { 
      type: Boolean, 
      default: true 
    },
   
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