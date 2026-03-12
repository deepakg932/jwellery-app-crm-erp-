import mongoose from "mongoose";

const customerGroupSchema = new mongoose.Schema(
  {
    customer_group: {
      type: String,
      // required: true,
      unique: true,
      // trim: true,
    },
    // percentage: {
    //   type: Number,
    // },


    // description: {
    //   type: String,
    //   default: "",
    // },

   
    // default_discount: {
    //   type: Number,
    //   default: 0, // %
    //   min: 0,
    //   max: 100,
    // },

    // credit_limit: {
    //   type: Number,
    //   default: 0,
    // },

    // payment_terms_days: {
    //   type: Number,
    //   default: 0,
    // },

   
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("CustomerGroup", customerGroupSchema);
