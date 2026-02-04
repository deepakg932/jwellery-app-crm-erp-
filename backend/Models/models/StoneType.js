

import mongoose from "mongoose";

const StoneTypeSchema = new mongoose.Schema(
  {
    stone_type: {
      type: String,
      required: true  // Added required
    },
    
    stone_image: {          // ✅ ADD THIS
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

// Fixed: Changed export name from stonePurityModel to StoneType
export default mongoose.model("StoneType", StoneTypeSchema);
