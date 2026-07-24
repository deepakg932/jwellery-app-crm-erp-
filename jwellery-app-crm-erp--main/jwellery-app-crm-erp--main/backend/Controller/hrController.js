import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Department from '../Models/models/Department.js';
import Designation from '../Models/models/Designation.js';
import LeaveType from '../Models/models/LeaveType.js';
import Leave from '../Models/models/Leave.js';
import Holiday from '../Models/models/Holiday.js';
import Employee from '../Models/models/Employee.js';
import Attendance from '../Models/models/Attendance.js';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/employees';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) cb(null, true);
    else cb(new Error('Only image files allowed'));
  },
});

export const uploadEmployeeImage = upload.single('profile_picture');

// ==================== DEPARTMENT ====================
export const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find().sort({ createdAt: -1 });
    res.json({ success: true, data: departments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createDepartment = async (req, res) => {
  try {
    const department = await Department.create({ department_name: req.body.department_name });
    res.status(201).json({ success: true, data: department, message: 'Department created' });
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ success: false, message: 'Department already exists' });
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateDepartment = async (req, res) => {
  try {
    const department = await Department.findByIdAndUpdate(req.params.id, { department_name: req.body.department_name }, { new: true, runValidators: true });
    if (!department) return res.status(404).json({ success: false, message: 'Department not found' });
    res.json({ success: true, data: department, message: 'Department updated' });
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ success: false, message: 'Department already exists' });
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findByIdAndDelete(req.params.id);
    if (!department) return res.status(404).json({ success: false, message: 'Department not found' });
    res.json({ success: true, message: 'Department deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== DESIGNATION ====================
export const getDesignations = async (req, res) => {
  try {
    const designations = await Designation.find().sort({ createdAt: -1 });
    res.json({ success: true, data: designations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createDesignation = async (req, res) => {
  try {
    const designation = await Designation.create(req.body);
    res.status(201).json({ success: true, data: designation, message: 'Designation created' });
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ success: false, message: 'Designation already exists' });
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateDesignation = async (req, res) => {
  try {
    const designation = await Designation.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!designation) return res.status(404).json({ success: false, message: 'Designation not found' });
    res.json({ success: true, data: designation, message: 'Designation updated' });
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ success: false, message: 'Designation already exists' });
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteDesignation = async (req, res) => {
  try {
    const designation = await Designation.findByIdAndDelete(req.params.id);
    if (!designation) return res.status(404).json({ success: false, message: 'Designation not found' });
    res.json({ success: true, message: 'Designation deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== LEAVE TYPE ====================
export const getLeaveTypes = async (req, res) => {
  try {
    const leaveTypes = await LeaveType.find().sort({ createdAt: -1 });
    res.json({ success: true, data: leaveTypes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createLeaveType = async (req, res) => {
  try {
    const leaveType = await LeaveType.create(req.body);
    res.status(201).json({ success: true, data: leaveType, message: 'Leave type created' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateLeaveType = async (req, res) => {
  try {
    const leaveType = await LeaveType.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!leaveType) return res.status(404).json({ success: false, message: 'Leave type not found' });
    res.json({ success: true, data: leaveType, message: 'Leave type updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteLeaveType = async (req, res) => {
  try {
    const leaveType = await LeaveType.findByIdAndDelete(req.params.id);
    if (!leaveType) return res.status(404).json({ success: false, message: 'Leave type not found' });
    res.json({ success: true, message: 'Leave type deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== LEAVE ====================
export const getLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find()
      .populate('employee_id', 'name employee_id')
      .populate('leave_type_id', 'leave_type_name')
      .populate('approved_by', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: leaves });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createLeave = async (req, res) => {
  try {
    let data = req.body;
    if (req.file) data.attachment = `/uploads/employees/${req.file.filename}`;
    const leave = await Leave.create(data);
    const populated = await leave.populate('employee_id', 'name employee_id');
    res.status(201).json({ success: true, data: populated, message: 'Leave applied' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateLeave = async (req, res) => {
  try {
    let data = req.body;
    if (req.file) data.attachment = `/uploads/employees/${req.file.filename}`;
    const leave = await Leave.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true })
      .populate('employee_id', 'name employee_id')
      .populate('leave_type_id', 'leave_type_name');
    if (!leave) return res.status(404).json({ success: false, message: 'Leave not found' });
    res.json({ success: true, data: leave, message: 'Leave updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteLeave = async (req, res) => {
  try {
    const leave = await Leave.findByIdAndDelete(req.params.id);
    if (!leave) return res.status(404).json({ success: false, message: 'Leave not found' });
    res.json({ success: true, message: 'Leave deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== HOLIDAY ====================
export const getHolidays = async (req, res) => {
  try {
    const holidays = await Holiday.find()
      .populate('department_id', 'department_name')
      .populate('designation_id', 'designation_name')
      .sort({ occasion_date: -1 });
    res.json({ success: true, data: holidays });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createHoliday = async (req, res) => {
  try {
    const holiday = await Holiday.create(req.body);
    const populated = await holiday.populate('department_id designation_id');
    res.status(201).json({ success: true, data: populated, message: 'Holiday created' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateHoliday = async (req, res) => {
  try {
    const holiday = await Holiday.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('department_id', 'department_name')
      .populate('designation_id', 'designation_name');
    if (!holiday) return res.status(404).json({ success: false, message: 'Holiday not found' });
    res.json({ success: true, data: holiday, message: 'Holiday updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteHoliday = async (req, res) => {
  try {
    const holiday = await Holiday.findByIdAndDelete(req.params.id);
    if (!holiday) return res.status(404).json({ success: false, message: 'Holiday not found' });
    res.json({ success: true, message: 'Holiday deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== EMPLOYEE ====================
export const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find()
      .populate('designation_id', 'designation_name')
      .populate('department_id', 'department_name')
      .populate('user_role', 'name role_name')
      .populate('reporting_to', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: employees });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('designation_id')
      .populate('department_id')
      .populate('user_role')
      .populate('reporting_to', 'name');
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });
    res.json({ success: true, data: employee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createEmployee = async (req, res) => {
  try {
    let data = req.body;
    if (req.file) data.profile_picture = `/uploads/employees/${req.file.filename}`;

    if (!data.employee_id) {
      const count = await Employee.countDocuments();
      data.employee_id = `EMP-${String(count + 1).padStart(5, '0')}`;
    }

    const employee = await Employee.create(data);
    const populated = await employee.populate('designation_id department_id user_role');
    res.status(201).json({ success: true, data: populated, message: 'Employee created' });
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ success: false, message: 'Employee email already exists' });
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateEmployee = async (req, res) => {
  try {
    let data = req.body;
    if (req.file) data.profile_picture = `/uploads/employees/${req.file.filename}`;
    const employee = await Employee.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true })
      .populate('designation_id department_id user_role reporting_to', 'name');
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });
    res.json({ success: true, data: employee, message: 'Employee updated' });
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ success: false, message: 'Employee email already exists' });
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });
    res.json({ success: true, message: 'Employee deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== ATTENDANCE ====================
export const getAttendance = async (req, res) => {
  try {
    const { employee_id, date, from_date, to_date } = req.query;
    const filter = {};
    if (employee_id) filter.employee_id = employee_id;
    if (date) filter.date = new Date(date);
    if (from_date && to_date) {
      filter.date = { $gte: new Date(from_date), $lte: new Date(to_date) };
    }
    const attendance = await Attendance.find(filter)
      .populate('employee_id', 'name employee_id')
      .sort({ date: -1 });
    res.json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.create(req.body);
    const populated = await attendance.populate('employee_id', 'name employee_id');
    res.status(201).json({ success: true, data: populated, message: 'Attendance marked' });
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ success: false, message: 'Attendance already marked for this date' });
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('employee_id', 'name employee_id');
    if (!attendance) return res.status(404).json({ success: false, message: 'Attendance not found' });
    res.json({ success: true, data: attendance, message: 'Attendance updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndDelete(req.params.id);
    if (!attendance) return res.status(404).json({ success: false, message: 'Attendance not found' });
    res.json({ success: true, message: 'Attendance deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
