// import mongoose from "mongoose";

// const userSchema = new mongoose.Schema(
//   {
 
//     name: { type: String },

//   },
//   { timestamps: true }
// );


// export default mongoose.model("Unit", userSchema);




import mongoose from "mongoose";

const unitSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // Unit Name
code: { type: String, required: true, unique: true },
    base_unit_id: { type: mongoose.Schema.Types.ObjectId, ref: "Unit" }, // Reference to another Unit
    conversion_factor: { type: Number, default: 1 }, // Conversion factor
    is_active: { type: Boolean, default: true }, // Active/Inactive
  },
  { timestamps: true }
);

// unitSchema.pre("save", async function () {
//   if (!this.code) {
//     this.code =
//       this.name.substring(0, 3).toUpperCase() +
//       Date.now().toString().slice(-4);
//   }
// });



export default mongoose.model("Unit", unitSchema);
