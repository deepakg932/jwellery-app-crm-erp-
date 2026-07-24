import express from 'express';
import { uploadEmployeeImage, getEmployees, getEmployeeById, createEmployee, updateEmployee, deleteEmployee } from '../Controller/hrController.js';

const router = express.Router();

router.get('/get-employees', getEmployees);
router.get('/get-employee/:id', getEmployeeById);
router.post('/create-employee', uploadEmployeeImage, createEmployee);
router.put('/update-employee/:id', uploadEmployeeImage, updateEmployee);
router.delete('/delete-employee/:id', deleteEmployee);

export default router;
