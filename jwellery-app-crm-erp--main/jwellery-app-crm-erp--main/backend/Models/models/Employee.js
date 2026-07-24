import mongoose from 'mongoose';

const EmployeeSchema = new mongoose.Schema(
  {
    employee_id: { type: String, trim: true, unique: true, sparse: true },
    salutation: { type: String, trim: true, default: '' },
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true, sparse: true },
    phone: { type: String, trim: true, default: '' },
    mobile: { type: String, trim: true, default: '' },
    gender: { type: String, enum: ['male', 'female', 'other', ''], default: '' },
    date_of_birth: { type: Date },
    profile_picture: { type: String, default: '' },
    designation_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Designation' },
    department_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    user_role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' },
    reporting_to: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    joining_date: { type: Date, default: Date.now },
    basic_salary: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'inactive', 'terminated'], default: 'active' },
    address: { type: String, trim: true, default: '' },
    city: { type: String, trim: true, default: '' },
    state: { type: String, trim: true, default: '' },
    country: { type: String, trim: true, default: '' },
    about: { type: String, trim: true, default: '' },
    language: { type: String, trim: true, default: 'English' },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

EmployeeSchema.index({ email: 1 }, { sparse: true });

export default mongoose.model('Employee', EmployeeSchema);
