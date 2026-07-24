import mongoose from 'mongoose';

const DepartmentSchema = new mongoose.Schema(
  {
    department_name: { type: String, required: true, trim: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

DepartmentSchema.index({ department_name: 1 }, { unique: true });

export default mongoose.model('Department', DepartmentSchema);
