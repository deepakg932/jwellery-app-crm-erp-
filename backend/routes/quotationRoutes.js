
import express from "express";
import {
  createQuotation,
  listQuotations,
  updateQuotation,
  deleteQuotation,
  getQuotationWithHistory,
  getActualAndPreviousQuotationGlobal
} from "../Controller/QuatationController.js";

const router = express.Router();

router.post("/create-quotation", createQuotation);

router.get("/get-quotations", listQuotations);
router.put("/update-quotation/:id", updateQuotation);
router.delete("/delete-quotation/:id", deleteQuotation);
router.get("/quotations/:id/history", getQuotationWithHistory);
// router.get(
//   "/quotations/customer-wise",
//   // protect,   // 👈 agar JWT lagana ho
//   getCustomerQuotationActualAndPrevious
// );





router.get(
  "/quotations/actual-previous",
  getActualAndPreviousQuotationGlobal
);


export default router;
