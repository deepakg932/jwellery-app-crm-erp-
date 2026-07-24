import express from 'express';
import {
  getDepartments, createDepartment, updateDepartment, deleteDepartment,
  getDesignations, createDesignation, updateDesignation, deleteDesignation,
} from '../Controller/hrController.js';

const router = express.Router();

router.get('/get-departments', getDepartments);
router.post('/create-department', createDepartment);
router.put('/update-department/:id', updateDepartment);
router.delete('/delete-department/:id', deleteDepartment);

router.get('/get-designations', getDesignations);
router.post('/create-designation', createDesignation);
router.put('/update-designation/:id', updateDesignation);
router.delete('/delete-designation/:id', deleteDesignation);

export default router;
