import express from "express";
import {
  createQuotation, getQuotations, updateQuotation, deleteQuotation,
} from "../Controller/quotationController.js";

const router = express.Router();

router.post("/create-quotation", createQuotation);
router.get("/get-quotations", getQuotations);
router.put("/update-quotation/:id", updateQuotation);
router.delete("/delete-quotation/:id", deleteQuotation);

export default router;
