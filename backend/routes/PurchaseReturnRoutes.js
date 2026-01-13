import express from "express";
const router = express.Router();

import { createPurchaseReturn ,getAllPurchaseReturns,getPurchaseReturnById,updatePurchaseReturn,deletePurchaseReturn} from "../Controller/PurchasereturnController.js";


router.post("/create-purchase-return", createPurchaseReturn);
router.put("/update-purchase-return/:id", updatePurchaseReturn);
router.delete("/delete-purchase-return/:id", deletePurchaseReturn);
router.get("/get-purchase-returns", getAllPurchaseReturns);
router.get("/purchase-returns/:id", getPurchaseReturnById);


export default router;