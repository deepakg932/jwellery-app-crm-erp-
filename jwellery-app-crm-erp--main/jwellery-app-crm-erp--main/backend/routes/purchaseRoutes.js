
import express from 'express';
import { getPurchaseOrders, createPurchaseOrder, getPurchaseInvoices } from '../Controller/purchaseController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
router.get('/get-purchase-orders', authenticate, getPurchaseOrders);
router.post('/create-purchase-order', authenticate, createPurchaseOrder);
router.get('/invoices', authenticate, getPurchaseInvoices);

export default router;
