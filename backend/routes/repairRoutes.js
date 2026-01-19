
import express from 'express';
import { listRepairs,createRepair,updateRepair,deleteRepair } from "../Controller/repairController.js";
// import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();


router.post('/create-repair', createRepair);
router.get('/get-repairs', listRepairs);
router.put('/update-repair/:id', updateRepair);
router.delete('/delete-repair/:id',deleteRepair);
// router.get('/', protect, getRepairs);
// router.post('/', protect, createRepair);

export default router;
