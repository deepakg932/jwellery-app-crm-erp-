import Mongoose from "mongoose";

const WastageSchema = new Mongoose.Schema({
  wastage_type: String,
//   wastage_value: Number,
//   wastage_quantity: Number,
//   wastage_percentage: Number,
//   wastage_amount: Number,
wastage_weight: Number,
material_type: String,

  status: { type: String, default: "active" },
});
export default Mongoose.model("Wastage", WastageSchema);
