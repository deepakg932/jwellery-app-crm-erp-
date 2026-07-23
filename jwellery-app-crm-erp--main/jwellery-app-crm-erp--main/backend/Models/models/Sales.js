import mongoose from 'mongoose';



const InventoryIssueSchema = new mongoose.Schema({
  customer_id: mongoose.Schema.Types.ObjectId,

  items: [{
    item_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InventoryItem"
    },
    quantity: Number,
    weight: Number,
    rate: Number
  }],

  status: {
    type: String,
    enum: ["reserved", "sold", "cancelled"],
    default: "reserved"
  }
}, { timestamps: true });

export default mongoose.model('InventoryIssue', InventoryIssueSchema);