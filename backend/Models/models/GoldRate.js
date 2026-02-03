// // models/GoldRate.js
// import mongoose from "mongoose";

// const goldRateSchema = new mongoose.Schema(
//   {
//     rate: Number,          // per gram
//     currency: String,      // INR
//     purity: String,        // 24K
//     source: String,        // goldapi
//     fetched_at: Date,
//   },
//   { timestamps: true }
// );

// export default mongoose.model("GoldRate", goldRateSchema);


import mongoose from "mongoose";

const GoldRateSchema = new mongoose.Schema(
  {
    karat: {
      type: String,
      enum: ["24K", "22K", "18K", "14K"],
      required: true,
    },

    rate_per_gram: Number,
    rate_per_10_gram: Number,

    currency: { type: String, default: "INR" },
    source: String,
    fetched_at: Date,
  },
  { timestamps: true }
);

export default mongoose.model("GoldRate", GoldRateSchema);

