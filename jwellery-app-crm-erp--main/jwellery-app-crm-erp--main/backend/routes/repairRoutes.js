
import express from 'express';
import { getRepairs, createRepair } from '../controllers/repairController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.get('/', protect, getRepairs);
router.post('/', protect, createRepair);

export default router;
