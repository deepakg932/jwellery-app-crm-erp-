import mongoose from "mongoose";

const SupplierSchema = new mongoose.Schema(
  {
    supplier_name: { type: String, required: true },
    supplier_code: { type: String, unique: true },
    payment_terms: { type: String },
    gst_number: { type: String },
    tax_number: { type: String },
    payment_type: {
      type: String,
      enum: ["cash", "bank_transfer", "cheque", "upi", "card"],
      default: "bank_transfer",
    },
    country: String,
    state: String,
    city: String,
    pincode: String,

    contact_person: String,
    phone: String,
    email: String,
    address: String,

    // opening_balance: { type: Number },

    status: { type: Boolean, default: true },
  },
  { timestamps: true }
);
SupplierSchema.pre("save", function () {
  if (!this.supplier_code) {
    this.supplier_code = "SUP" + Date.now().toString().slice(-4);
  }
});

export default mongoose.model("Suppliers", SupplierSchema);
