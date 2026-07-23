import mongoose from "mongoose";

const costNameSchema = new mongoose.Schema(
  {
    cost_name: { type: String, required: true, unique: true }
  },
  { timestamps: true }
);

export default mongoose.model("CostName", costNameSchema);
