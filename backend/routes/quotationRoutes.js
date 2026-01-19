// routes/quotationRoutes.js
import express from "express";
import {
  createQuotation,
  listQuotations,
  updateQuotation,
  deleteQuotation,
} from "../Controller/QuatationController.js";

const router = express.Router();

router.post("/create-quotation", createQuotation);

router.get("/get-quotations", listQuotations);
router.put("/update-quotation/:id", updateQuotation);
router.delete("/delete-quotation/:id", deleteQuotation);

export default router;
