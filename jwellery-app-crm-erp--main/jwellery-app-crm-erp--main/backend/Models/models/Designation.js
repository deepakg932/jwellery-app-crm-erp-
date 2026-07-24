import mongoose from 'mongoose';

const DesignationSchema = new mongoose.Schema(
  {
    designation_name: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    is_active: { type: Boolean, default: true },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

DesignationSchema.index({ designation_name: 1 }, { unique: true });

export default mongoose.model('Designation', DesignationSchema);
