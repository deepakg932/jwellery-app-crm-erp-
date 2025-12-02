
import express from 'express';
import { getPurchaseOrders, createPurchaseOrder, getPurchaseInvoices } from '../controllers/purchaseController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.get('/orders', protect, getPurchaseOrders);
router.post('/orders', protect, createPurchaseOrder);
router.get('/invoices', protect, getPurchaseInvoices);

export default router;
