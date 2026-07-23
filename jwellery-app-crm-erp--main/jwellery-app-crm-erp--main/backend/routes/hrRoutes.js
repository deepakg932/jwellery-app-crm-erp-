
import express from 'express';
import { getEmployees, createEmployee, getAttendance } from '../controllers/hrController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.get('/employees', protect, getEmployees);
router.post('/employees', protect, createEmployee);
router.get('/attendance', protect, getAttendance);

export default router;
