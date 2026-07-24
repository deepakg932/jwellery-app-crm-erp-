import mongoose from 'mongoose';

const LeaveTypeSchema = new mongoose.Schema(
  {
    leave_type_name: { type: String, required: true, trim: true },
    leave_paid_status: { type: String, enum: ['Paid', 'Unpaid', 'paid', 'unpaid'], default: 'Paid' },
    leave_allotment_type: { type: String, trim: true, default: '' },
    no_of_leaves: { type: Number, default: 0 },
    monthly_limit: { type: Number, default: 0 },
    is_active: { type: Boolean, default: true },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.model('LeaveType', LeaveTypeSchema);
