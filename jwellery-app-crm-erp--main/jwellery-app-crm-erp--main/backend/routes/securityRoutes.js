
import express from 'express';
import { getActivityLogs } from '../controllers/securityController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.get('/activity-logs', protect, getActivityLogs);

export default router;
