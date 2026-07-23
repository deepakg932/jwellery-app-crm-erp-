
import mongoose from 'mongoose';
const SubcategorySchema = new mongoose.Schema(
  {
    category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    name: { type: String, required: true, trim: true },
    image:{type:String,default:null}
  },
  { timestamps: true }
);
SubcategorySchema.index({ category_id: 1, name: 1 }, { unique: true });
export default mongoose.model('Subcategory', SubcategorySchema);
