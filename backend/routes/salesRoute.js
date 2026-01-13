import express from "express";
import { createSale, deliverSale } from "../Controller/salesController.js"
import { createSalesReturn } from "../Controller/salesReturnController.js"
// import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();


router.post("/create-sales",createSale);
router.put("/sales/:id/deliver", deliverSale);
router.post("/sales-return",createSalesReturn);







// router.post("/sales", authMiddleware, createSale);
// router.put("/sales/:id/deliver", authMiddleware, deliverSale);
// router.post("/sales-return", authMiddleware, createSalesReturn);

export default router;
