
// import mongoose from 'mongoose';
// const PuritySchema = new mongoose.Schema(
//   {
//     purity_name: { type: String, required: true, trim: true },
//     karat: { type: Number, required: true }, // e.g., 22
//     percentage: { type: Number, required: true }, // e.g., 91.6
//   },
//   { timestamps: true }
// );
// PuritySchema.index({ karat: 1, percentage: 1 }, { unique: true });
// export default mongoose.model('Purity', PuritySchema);



import mongoose from "mongoose";
import { MetalType } from "./_shared.js";

const PuritySchema = new mongoose.Schema(
  {
    purity_name: { type: String, required: true, trim: true },
    stone_name: { type: String, required: true, trim: true },

    metal_type: { 
      type: String, 
      enum: MetalType,
      required: true 
    },

    percentage: { 
      type: Number, 
      required: true,
      min: 0,
      max: 100
    },

    image: {
      type: String,
      default: null
    }
  },
  { timestamps: true }
);

export default mongoose.model("Purity", PuritySchema);

