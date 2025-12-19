import mongoose from "mongoose";
import { MetalType } from "./shared.js";

const HallmarkSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },   // Hallmark Name/Code

    purity_id: { type: mongoose.Schema.Types.ObjectId, ref: "Purity",},

    // mark_id: { type: mongoose.Schema.Types.ObjectId, ref: "Mark", required: true },

    percentage: { type: Number,  min: 0, max: 100 },

    metal_type: {
      type: String,
      required: true
    },

    description: { type: String, default: "" },
    image: { type: String, default: null },
    status:{type:Boolean,default:true}
  },
  { timestamps: true }
);

export default mongoose.model("Hallmark", HallmarkSchema);
