import mongoose from "mongoose";

const StoneSchema = new mongoose.Schema(
  {
    stone_name: { type: String, required: true },
    stone_type: { type: String, required: true },
    stone_purity: { type: String, required: true },
    stone_price: { type: Number, required: true },

    stone_image: { type: String, default: null }
  },
  { timestamps: true }
);

export default mongoose.model("Stone", StoneSchema);
