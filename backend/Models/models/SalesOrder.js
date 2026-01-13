import mongoose from "mongoose";
const SalesOrderSchema = new mongoose.Schema({
  so_number: { type: String, unique: true, default: () => `SO-${Date.now()}` },
  customer_id: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
  branch_id: { type: mongoose.Schema.Types.ObjectId, ref: "Branch" },
  
  items: [{
    item_id: { type: mongoose.Schema.Types.ObjectId, ref: "InventoryItem" },
    quantity: Number,
    weight: Number,
    unit_id: { type: mongoose.Schema.Types.ObjectId, ref: "Unit" },
    rate: Number,
    discount: Number,
    tax: Number,
    total: Number,
    
    // Delivery tracking
    delivered_quantity: { type: Number, default: 0 },
    delivered_weight: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["pending", "partially_delivered", "delivered"],
      default: "pending"
    }
  }],
  
  payment_status: {
    type: String,
    enum: ["pending", "partial", "paid"],
    default: "pending"
  },
  
  delivery_status: {
    type: String,
    enum: ["pending", "packed", "dispatched", "delivered"],
    default: "pending"
  },
  
  total_amount: Number,
  advance_paid: Number,
  balance_due: Number,
  
}, { timestamps: true });



export default mongoose.model("SalesOrder", SalesOrderSchema);