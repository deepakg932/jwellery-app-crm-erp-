
import express  from "express";
import { getStockLedger } from "../Controller/StockLedgerContorller.js"
const router = express.Router()



router.get("/getStockledgers", getStockLedger);

export default router;
