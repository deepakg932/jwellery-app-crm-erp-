// src/models/Employee.js
import mongoose from 'mongoose';
const EmployeeSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, sparse: true, index: true },
    designation: { type: String, trim: true },
    salary: { type: Number, default: 0 },
    joindate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);
export default mongoose.model('Employee', EmployeeSchema);
