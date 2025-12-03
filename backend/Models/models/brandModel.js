import mongoose from "mongoose";

const BrandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    image: {
      type: String, // Upload path — example: /uploads/brands/abc.png
      default: null,
    },

    status: {
      type: Boolean,
      default: true, // Active / Inactive brand
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

export default mongoose.model("Brand", BrandSchema);
