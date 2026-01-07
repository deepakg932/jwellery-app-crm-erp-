import mongoose from "mongoose";

const SaleSchema = new mongoose.Schema({
  invoiceNo: String,
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch" },

  items: [{
    inventory_item_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InventoryItem"
    },
    quantity: Number,
    grossWeight: Number,
    netWeight: Number,
    price: Number
  }],

  totalAmount: Number
}, { timestamps: true });

export default mongoose.model("Sale", SaleSchema);
