

import mongoose from "mongoose";

const PuritySchema = new mongoose.Schema(
  {
    stone_purity: { type: String, trim: true },

    metal_type: {
      type: String,
    },
    stone_type: {
      type: String,
    },

    purity_name: { type: String, trim: true, ref: "Purity" },
    karat: { type: Number, min: 0, max: 24 }, // Added karat field for metals
    percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    image: {
      type: String,
      default: null,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Purity", PuritySchema);
