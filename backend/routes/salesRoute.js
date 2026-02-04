import express from "express";
// import { createSale, deliverSale } from "../Controller/salesController.js"
import { createSale ,updateSale,listProductsForSale,listSales,getSaleById,deleteSale,updateSalePayment} from "../Controller/salesController.js"
import { createSaleReturn ,getSaleReturns,approveSaleReturn,updateSaleReturn,deleteSaleReturn} from "../Controller/salesReturnController.js"
// import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();
import uploadExchangeImage from "../middleware/uploadExchangeImage.js"



router.post("/create-sale-item",   uploadExchangeImage.single("exchange_item_image"),createSale);
router.get("/get-sale-items",listSales);
router.get("/get-by-id/:id",getSaleById);

router.get("/list", listProductsForSale);
router.put("/update-sale-item/:id",uploadExchangeImage.single("exchange_item_image"),updateSale);
router.delete("/delete-sale-item/:id",deleteSale);

// router.put("/sales/:id/deliver", deliverSale);
router.post("/sale-return",createSaleReturn);
router.get("/get-sale-returns",getSaleReturns);
router.delete("/delete-sale-item/:id",deleteSale);

router.put("/update-sale-payment/:id", updateSalePayment);

router.put("/sale-return/approve/:id", approveSaleReturn);
router.put("/sale-return/:id", updateSaleReturn);
router.delete("/delete-sale-return/:id", deleteSaleReturn);







// router.post("/sales", authMiddleware, createSale);
// router.put("/sales/:id/deliver", authMiddleware, deliverSale);
// router.post("/sales-return", authMiddleware, createSalesReturn);

export default router;
