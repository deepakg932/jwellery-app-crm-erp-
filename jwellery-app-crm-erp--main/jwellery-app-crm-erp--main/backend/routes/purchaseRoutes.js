import express from 'express';
import {
  getPurchaseOrders,
  getPurchaseOrderById,
  createPurchaseOrder,
  updatePurchaseOrder,
  deletePurchaseOrder,
  getPurchaseInvoices,
} from '../Controller/purchaseController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/get-purchase-orders', getPurchaseOrders);
router.get('/get-purchase-order/:id', getPurchaseOrderById);
router.post('/create-purchase-order', createPurchaseOrder);
router.put('/update-purchase-order/:id', updatePurchaseOrder);
router.delete('/delete-purchase-order/:id', deletePurchaseOrder);
router.get('/invoices', getPurchaseInvoices);

export default router;
