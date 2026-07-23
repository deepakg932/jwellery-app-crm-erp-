
import express from 'express';
import { getJobCards, createJobCard } from '../controllers/jobController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.get('/cards', protect, getJobCards);
router.post('/cards', protect, createJobCard);

export default router;
