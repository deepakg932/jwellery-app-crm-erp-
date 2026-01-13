import mongoose from "mongoose";

const SalesReturnSchema = new mongoose.Schema(
  {
    sale_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sale",
      required: true,
    },

    items: [
      {
        item_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "InventoryItem",
        },
        return_quantity: Number,
        reason: String,
      },
    ],

    status: {
      type: String,
      enum: ["approved", "rejected"],
      default: "approved",
    },

    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export default mongoose.model("SalesReturn", SalesReturnSchema);
