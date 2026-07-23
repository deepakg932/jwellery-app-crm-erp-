// src/models/Payroll.js
import mongoose from 'mongoose';
const PayrollSchema = new mongoose.Schema(
  {
    employee_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
    month: { type: String, required: true }, // e.g., "2025-11"
    basic_salary: { type: Number, required: true },
    overtime: { type: Number, default: 0 },
    deductions: { type: Number, default: 0 },
    net_salary: { type: Number, required: true },
  },
  { timestamps: true }
);
PayrollSchema.index({ employee_id: 1, month: 1 }, { unique: true });
export default mongoose.model('Payroll', PayrollSchema);
