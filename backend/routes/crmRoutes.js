
import express from 'express';
import { getCustomers, createCustomer, getFollowups } from '../controllers/crmController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.get('/customers', protect, getCustomers);
router.post('/customers', protect, createCustomer);
router.get('/followups', protect, getFollowups);

export default router;
