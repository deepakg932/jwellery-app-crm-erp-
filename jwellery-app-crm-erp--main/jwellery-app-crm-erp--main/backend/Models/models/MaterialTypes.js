import mongoose from "mongoose";

const MaterialTypesSchema = new mongoose.Schema({
  material_type: { type: String, required: true, unique: true },
  metal_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Metal",
     
    }
}, { timestamps: true });

export default mongoose.model("MaterialTypes", MaterialTypesSchema);