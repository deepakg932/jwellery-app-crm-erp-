import express from "express";
// import { createSale, deliverSale } from "../Controller/salesController.js"
import { createSale ,updateSale,listProductsForSale,listSales,getSaleById,deleteSale,updateSalePayment,generateInvoicePDF} from "../Controller/salesController.js"
import { createSaleReturn ,getSaleReturns,approveSaleReturn,updateSaleReturn,deleteSaleReturn} from "../Controller/salesReturnController.js"
// import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();



router.post("/create-sale-item",createSale);
router.get("/get-sale-items",listSales);
router.get("/get-by-id/:id",getSaleById);

router.get("/list", listProductsForSale);
router.put("/update-sale-item/:id",updateSale);
router.delete("/delete-sale-item/:id",deleteSale);

// router.put("/sales/:id/deliver", deliverSale);
router.post("/sale-return",createSaleReturn);
router.get("/get-sale-returns",getSaleReturns);

router.put("/update-sale-payment/:id", updateSalePayment);

router.put("/sale-return/approve/:id", approveSaleReturn);
router.put("/sale-return/:id", updateSaleReturn);
router.delete("/sale-return/:id", deleteSaleReturn);






router.get("/invoice-pdf/:invoice_id", generateInvoicePDF);


// router.post("/sales", authMiddleware, createSale);
// router.put("/sales/:id/deliver", authMiddleware, deliverSale);
// router.post("/sales-return", authMiddleware, createSalesReturn);

export default router;
