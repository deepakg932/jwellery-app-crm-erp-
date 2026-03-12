
import mongoose from "mongoose";
const KarigarSchema = new mongoose.Schema(
  {
    employee_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },
    name: { type: String, trim: true },
    mobile: String,

    skills: [
      {
        type: String, 
      },
    ],

    labour_type: {
      type: String,
      enum: ["per_piece", "per_gram", "per_day"],
      default: "per_piece",
    },
    labour_rate: Number,
    address: String,
    notes: String,
  },
  { timestamps: true }
);
export default mongoose.model("Karigar", KarigarSchema);
