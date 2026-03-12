
import mongoose from "mongoose";

const RepairSchema = new mongoose.Schema(
  {
    repair_number: {
      type: String,
      unique: true,
      index: true,
    },

    
    customer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      // required: true,
    },

    sale_item_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sale",
      default: null,
    },

    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null, 
    },

    

    product_name: {
      type: String,
  
    },

    product_module: String,

   
    problem_description: {
      type: String,
  
    },

    employee_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",

    },

  repair_images: [
    {
      type: String,
    },
  ],

    repair_charge: {
      type: Number,

    },

    paid_amount: {
      type: Number,
      default: 0,
    },

    due_amount: {
      type: Number,
      default: 0,
    },

    payment_status: {
      type: String,
      enum: ["unpaid", "partial", "paid"],
      default: "unpaid",
    },

    account: {
      type: String,
      enum: ["cash", "bank", "upi"],
      default: "cash",
    },

   
    receiving_date: {
      type: Date,

    },

    delivery_date: Date,


    status: {
      type: String,
      // enum: ["pending", "in_progress", "ready", "delivered", "cancelled"],
      default: "pending",
    },

    note: String,

    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);


RepairSchema.virtual("invoice", {
  ref: "Invoice",
  localField: "_id",
  foreignField: "repair_id",
  justOne: true,
});

RepairSchema.set("toObject", { virtuals: true });
RepairSchema.set("toJSON", { virtuals: true });


export default mongoose.model("Repair", RepairSchema);
