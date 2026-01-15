import mongoose from "mongoose";

const counterSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true, // e.g. "sale_return", "invoice"
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

// unique per key + year
counterSchema.index({ key: 1, year: 1 }, { unique: true });

export default mongoose.model("Counter", counterSchema);
