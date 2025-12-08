import mongoose from "mongoose";

const MetalSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    image: { type: String, default: null }
  },
  { timestamps: true }
);

export default mongoose.model("Metal", MetalSchema);
