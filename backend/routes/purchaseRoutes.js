
import express from 'express';
import {  createPurchaseOrder ,getAllPurchaseOrders,
  getPurchaseOrderById,updatePOItemStatus,updatePOStatus,getPOHistory,generatePOPDF,
  getPurchaseOrdersPaginated,updatePurchaseOrder,deletePurchaseOrder,exportPurchaseOrders} from "../Controller/purchaseController.js";
// import { protect } from '../middleware/authMiddleware.js';
// import { authMiddleware } from "../middleware/auth.js"
const router = express.Router();
router.post('/create-purchase-order',createPurchaseOrder);
// router.post('/create-purchase-order',authMiddleware, createPurchaseOrder);
router.get('/get-purchase-orders', getAllPurchaseOrders);

router.get('/purchase-orders/paginated', getPurchaseOrdersPaginated);

router.get('/purchase-orders/:id', getPurchaseOrderById);
router.put('/update-purchase-order/:id', updatePurchaseOrder);
router.patch('/change-purchase-orders/:poId/items/:itemId/status', updatePOItemStatus);

router.patch('/change-status-purchase-orders/:id/status', updatePOStatus);
router.delete("/delete-purchase-order/:id",deletePurchaseOrder)
router.get("/purchase-orders/export",exportPurchaseOrders)
router.get("/purchase-orders/:id/history",getPOHistory)
router.get("/purchase-orders/:id/pdf",generatePOPDF)
// router.get('/orders', protect, getPurchaseOrders);
// // router.post('/orders', protect, createPurchaseOrder);
// router.get('/invoices', protect, getPurchaseInvoices);

export default router;
