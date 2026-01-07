
import express  from "express";
import { approveTransfer } from "../Controller/stockTransferController.js";
const router = express.Router()



router.post("/transfer/:id/approve", approveTransfer);

export default router;
