import express from "express";
import { generateInvoice, getInvoices } from "../Controller/invoiceController.js";

const router = express.Router();

router.post("/generate", generateInvoice);
router.get("/", getInvoices);

export default router;