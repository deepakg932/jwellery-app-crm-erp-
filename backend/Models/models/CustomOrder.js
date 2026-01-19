import mongoose from "mongoose";

const CustomOrderSchema = new mongoose.Schema(
  {
    order_number: {
      type: String,
      unique: true,
    //   required: true,
    },

    customer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
    //   required: true,
    },
    unit_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Unit",
    },
    weight: {
       type: Number,
    //    required: true,
     },
     purity: {
       type: String, // 916 / 750
    //    required: true,
     },
    jewellery_type: String, // Ring, Chain
    design_name: String,

    karat: {
      type: String, // 18K / 22K
    //   required: true,
    },

    approx_weight: Number,

    stone_details: String,

    images: [{ type: String }],

    order_date: {
      type: Date,
      default: Date.now,
    },

    delivery_date: Date,

    status: {
      type: String,
      enum: ["pending", "in_progress", "completed", "delivered"],
      default: "pending",
    },

    notes: String,
  },
  { timestamps: true }
);

export default mongoose.model("CustomOrder", CustomOrderSchema);
