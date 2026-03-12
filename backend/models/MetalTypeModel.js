import mongoose from "mongoose";

const MetalSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    purities: [{ type: mongoose.Schema.Types.ObjectId, ref: "Purity" }],
    image: { type: String, default: null },
    imageType: { type: String},
  },
  { timestamps: true }
);

export default mongoose.model("Metal", MetalSchema);
