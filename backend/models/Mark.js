import mongoose from "mongoose";

const MarkSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true }
  },
  { timestamps: true }
);

export default mongoose.model("Mark", MarkSchema);
