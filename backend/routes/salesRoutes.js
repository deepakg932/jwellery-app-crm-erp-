
import express from 'express';
import { getInvoices, getInvoiceById, createInvoice } from '../controllers/salesController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.get('/invoices', protect, getInvoices);
router.get('/invoices/:id', protect, getInvoiceById);
router.post('/invoices', protect, createInvoice);

export default router;
