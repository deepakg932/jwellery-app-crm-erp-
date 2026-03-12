import mongoose from "mongoose";

const counterSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true, 
    },

    year: {
      type: Number,
      required: true,
    },

    value: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);


counterSchema.index({ key: 1, year: 1 }, { unique: true });

export default mongoose.model("Counter", counterSchema);
