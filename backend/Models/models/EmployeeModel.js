import mongoose from "mongoose";

const EmployeeSchema = new mongoose.Schema(
  {
    pan_number: {
      type: String,
      trim: true,
    },

    aadhaar_number: {               
      type: String,
      trim: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    address: String,
    city: String,
    state: String,
    country: String,
    pincode: String,

    role_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: true,
    },

    basic_salary: {
      type: Number,
      required: true,
    },

    image: {
      type: String,
      default: null,
    },

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

export default mongoose.model("Employee", EmployeeSchema);
