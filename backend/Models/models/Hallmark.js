import mongoose from "mongoose";
import { MetalType } from "./_shared.js";

const HallmarkSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },   // Hallmark Name/Code

    purity_id: { type: mongoose.Schema.Types.ObjectId, ref: "Purity", required: true },

    // mark_id: { type: mongoose.Schema.Types.ObjectId, ref: "Mark", required: true },

    percentage: { type: Number, required: true, min: 0, max: 100 },

    metal_type: {
      type: String,
      enum: MetalType,
      required: true
    },

    description: { type: String, default: "" },
    status:{type:Boolean,default:true}
  },
  { timestamps: true }
);

export default mongoose.model("Hallmark", HallmarkSchema);
