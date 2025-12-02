
import express from 'express';
import { getReport } from '../controllers/reportController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.get('/:type', protect, getReport);

export default router;
