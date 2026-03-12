import mongoose from "mongoose";
import { MetalType } from "./shared.js";

const CategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },

    metal_type: {type: String,ref: "Metal"},

    image: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Category", CategorySchema);
