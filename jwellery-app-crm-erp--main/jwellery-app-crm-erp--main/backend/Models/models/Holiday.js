import mongoose from 'mongoose';

const HolidaySchema = new mongoose.Schema(
  {
    occasion: { type: String, required: true, trim: true },
    occasion_date: { type: Date, required: true },
    department_id: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Department' }],
    designation_id: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Designation' }],
    employment_types: [{ type: String, trim: true }],
    description: { type: String, trim: true, default: '' },
    is_active: { type: Boolean, default: true },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.model('Holiday', HolidaySchema);
