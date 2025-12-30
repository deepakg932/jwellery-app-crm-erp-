import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
 
    name: { type: String },

  },
  { timestamps: true }
);


export default mongoose.model("Unit", userSchema);