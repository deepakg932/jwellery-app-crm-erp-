import mongoose from "mongoose";

const unitSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, 
    code: { type: String, required: true, unique: true },
    base_unit_id: { type: mongoose.Schema.Types.ObjectId, ref: "Unit" },
    conversion_factor: { type: Number, default: 1 },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

// unitSchema.pre("save", async function () {
//   if (!this.code) {
//     this.code =
//       this.name.substring(0, 3).toUpperCase() +
//       Date.now().toString().slice(-4);
//   }
// });

export default mongoose.model("Unit", unitSchema);
