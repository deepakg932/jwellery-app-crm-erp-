// controllers/hrController.js
import Employee from '../models/Employee.js';
import Attendance from '../models/Attendance.js';

export const getEmployees = async (req, res) => {
  const employees = await Employee.find().populate('user_id');
 return res.json(employees);
};

export const createEmployee = async (req, res) => {
  const emp = await Employee.create(req.body);
 return res.json(emp);
};

export const getAttendance = async (req, res) => {
  const records = await Attendance.find({ date: req.query.date }).populate('employee_id');
  return res.json(records);
};
