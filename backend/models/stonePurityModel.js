
import mongoose from "mongoose";

const StoneTypeSchema = new mongoose.Schema(
  {
    stone_purity: { type: String, trim: true },

    stone_type: {
      type: String,

     
    },

   
    percentage: {
      type: Number,
  
      min: 0,
      max: 100,
    },
   

    status: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("stonePurityModel", StoneTypeSchema);
