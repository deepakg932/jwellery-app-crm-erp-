import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const SubCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "SubCategory name is required"],
      trim: true,
      minlength: [2, "SubCategory name must be at least 2 characters long"]
    },
    description: {
      type: String,
      trim: true,
      default: ""
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InventoryCategory",
      required: [true, "Parent category is required"]
    },
    status: {
      type: Boolean,
      default: true,
      enum: [true, false]
    }
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform: function(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    },
    toObject: {
      virtuals: true,
      transform: function(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

// ✅ यहां एक compound index add करें ताकि अगर कोई पुराना index है तो conflict न हो
SubCategorySchema.index({ name: 1, category: 1 }, { unique: false });

export default mongoose.model("InventorySubCategory", SubCategorySchema);