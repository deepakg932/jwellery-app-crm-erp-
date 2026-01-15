import express from "express";
import { generateInvoiceFromSale, getInvoices } from "../Controller/invoiceController.js";

const router = express.Router();

router.post("/generate", generateInvoiceFromSale);
router.get("/", getInvoices);

export default router;