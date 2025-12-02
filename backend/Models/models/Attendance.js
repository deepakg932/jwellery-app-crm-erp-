// src/models/Attendance.js
import mongoose from 'mongoose';
const AttendanceSchema = new mongoose.Schema(
  {
    employee_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
    date: { type: Date, required: true },
    check_in: { type: Date },
    check_out: { type: Date },
  },
  { timestamps: true }
);
AttendanceSchema.index({ employee_id: 1, date: 1 }, { unique: true });
export default mongoose.model('Attendance', AttendanceSchema);
