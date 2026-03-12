

import mongoose from "mongoose";

const StoneTypeSchema = new mongoose.Schema(
  {
    stone_type: {
      type: String,
      required: true  
    },
    
    stone_image: {      
      type: String,
      default: null
    },
    stone_purity: { 
      type: String, 
      trim: true 
    },
    percentage: {
      type: Number,
      min: 0,
      max: 100,
    },
    status: { 
      type: Boolean, 
      default: true 
    },
  },
  { timestamps: true }
);


export default mongoose.model("StoneType", StoneTypeSchema);
