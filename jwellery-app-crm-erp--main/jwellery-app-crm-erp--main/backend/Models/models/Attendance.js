import mongoose from 'mongoose';

const AttendanceSchema = new mongoose.Schema(
  {
    employee_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
    date: { type: Date, required: true },
    check_in: { type: Date },
    check_out: { type: Date },
    status: { type: String, enum: ['present', 'absent', 'half_day', 'late', 'holiday', 'leave'], default: 'present' },
    work_hours: { type: Number, default: 0 },
    overtime_hours: { type: Number, default: 0 },
    notes: { type: String, trim: true, default: '' },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

AttendanceSchema.index({ employee_id: 1, date: 1 }, { unique: true });

export default mongoose.model('Attendance', AttendanceSchema);
