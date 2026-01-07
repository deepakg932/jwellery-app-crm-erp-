import express from "express";

const router = express.Router();
import { getCurrentStock} from "../Controller/InventoryStockController.js"

router.get("/getStockCurrect",getCurrentStock)



export default router;
