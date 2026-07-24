import express from 'express';
import {
  getLeaveTypes, createLeaveType, updateLeaveType, deleteLeaveType,
  getLeaves, createLeave, updateLeave, deleteLeave,
  getHolidays, createHoliday, updateHoliday, deleteHoliday,
  getAttendance, createAttendance, updateAttendance, deleteAttendance,
} from '../Controller/hrController.js';

const router = express.Router();

router.get('/get-leave-types', getLeaveTypes);
router.post('/create-leave-type', createLeaveType);
router.put('/update-leave-type/:id', updateLeaveType);
router.delete('/delete-leave-type/:id', deleteLeaveType);

router.get('/get-leaves', getLeaves);
router.post('/create-leave', createLeave);
router.put('/update-leave/:id', updateLeave);
router.delete('/delete-leave/:id', deleteLeave);

router.get('/get-holidays', getHolidays);
router.post('/add-holiday', createHoliday);
router.put('/update-holiday/:id', updateHoliday);
router.delete('/delete-holiday/:id', deleteHoliday);

router.get('/get-attendance', getAttendance);
router.post('/create-attendance', createAttendance);
router.put('/update-attendance/:id', updateAttendance);
router.delete('/delete-attendance/:id', deleteAttendance);

export default router;
