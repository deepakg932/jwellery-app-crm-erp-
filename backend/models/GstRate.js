import mongoose from "mongoose";

const GstRateSchema = new mongoose.Schema(
  {
    
    gst_total: {
      type: Number,
      // required: true
    },

    cgst_percentage: {
      type: Number,
      // required: true
    },

    sgst_percentage: {
      type: Number,
      // required: true
    },

    igst_percentage: {
      type: Number,
      // required: true
    },
    utgst_percentage:{
        type:Number,
    },
    

    status: {
      type: String,
      default: "active",
      enum: ["active", "inactive"]
    }
  },
  { timestamps: true }
);

export default mongoose.model("GstRate", GstRateSchema);
