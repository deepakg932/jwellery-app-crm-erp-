import mongoose from "mongoose";


const ManufacturingSchema = new mongoose.Schema({
  manufacturing_no: String,
  sale_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Sale"
  },

  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product"
  },

  karigar_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Karigar"
  },

  raw_material: [
    {
      item_id: ObjectId,
      quantity: Number
    }
  ],

  expected_weight: Number,
  received_weight: Number,

  labour_charge: Number,

  status: {
    type: String,
    enum: ["assigned", "in_progress", "completed", "returned"],
    default: "assigned"
  },

  start_date: Date,
  completion_date: Date
});
const ManufacturingOrder = mongoose.model("ManufacturingOrder", ManufacturingSchema);
export default ManufacturingOrder;