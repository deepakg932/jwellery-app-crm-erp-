import mongoose from 'mongoose';

const LeaveSchema = new mongoose.Schema(
  {
    employee_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
    leave_type_id: { type: mongoose.Schema.Types.ObjectId, ref: 'LeaveType', required: true },
    duration_type: { type: String, enum: ['full_day', 'half_day', 'first_half', 'second_half'], default: 'full_day' },
    from_date: { type: Date, required: true },
    to_date: { type: Date, required: true },
    reason: { type: String, trim: true, default: '' },
    attachment: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'cancelled'], default: 'pending' },
    applied_on: { type: Date, default: Date.now },
    approved_by: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    approved_on: { type: Date },
    remarks: { type: String, trim: true, default: '' },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.model('Leave', LeaveSchema);
