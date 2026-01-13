// Models/models/Customer.js
import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    customer_group_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CustomerGroup",
      required: true,
    },

    // customer_type: {
    //   type: String,
    //   enum: ["individual", "business"],
    //   default: "individual",
    // },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    mobile: {
      type: String,
      required: true,
      unique: true,
    },

    whatsapp_number: String,
    email: String,
    tax_number: String,

    address: String,
    city: String,
    state: String,
    country: String,
    pincode: String,

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Customer", customerSchema);
