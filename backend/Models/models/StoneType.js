// import mongoose from 'mongoose';
// const StoneTypeSchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true, trim: true },
//     quality: { type: String, trim: true },
//     color: { type: String, trim: true },
//     clarity: { type: String, trim: true },
//   },
//   { timestamps: true }
// );
// export default mongoose.model('StoneType', StoneTypeSchema);

// import mongoose from "mongoose";

// const StoneTypeSchema = new mongoose.Schema(
//   {
//     stone_name: { type: String, trim: true },

//     stone_type: {
//       type: String,

//       // required: true
//     },

//     stone_purity: {
//       type: String,
//       // enum: [
//       //   "AAA", "AA", "A", "B", "Premium", "Commercial",
//       //   "IF", "VVS1", "VVS2", "VS1", "VS2", "SI1", "SI2", "I1", "I2"
//       // ],
//       // default: null
//     },
//     percentage: {
//       type: Number,
//       // required: true,
//       min: 0,
//       max: 100,
//     },
//     color: { type: String, trim: true },
//     clarity: { type: String, trim: true },
//     quality: { type: String, trim: true },

//     shape: { type: String, trim: true },
//     cut: { type: String, trim: true },
//     size_mm: { type: String, trim: true },

//     carat_weight: { type: Number, default: 0 },
//     stone_count: { type: Number, default: 1 },
//     hardness: { type: Number, default: null },

//     rate_per_carat: { type: Number, default: 0 },
//     stone_price: { type: Number, default: 0 },
//     selling_price: { type: Number, default: 0 },

//     certificate_number: { type: String, trim: true },
//     lab: { type: String, trim: true },
//     certificate_image: { type: String, default: null },

//     stone_image: { type: String, default: null },

//     status: { type: Boolean, default: true },
//   },
//   { timestamps: true }
// );

// export default mongoose.model("StoneType", StoneTypeSchema);

import mongoose from "mongoose";

const StoneTypeSchema = new mongoose.Schema(
  {
    stone_type: {
      type: String,
      required: true  // Added required
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
