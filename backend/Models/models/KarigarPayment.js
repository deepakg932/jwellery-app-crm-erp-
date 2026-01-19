import mongoose from "mongoose";

const KarigarPaymentSchema = new mongoose.Schema(
  {
    karigar_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Karigar",
      required: true,
      index: true,
    },

    jobcard_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobCard",
      default: null,
    },

    amount: {
      type: Number,
      required: true,
    },

    payment_type: {
      type: String,
      enum: ["cash", "upi", "bank"],
      default: "cash",
    },

    status: {
      type: String,
      enum: ["paid", "advance"],
      default: "paid",
    },

    note: String,

    payment_date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("KarigarPayment", KarigarPaymentSchema);
