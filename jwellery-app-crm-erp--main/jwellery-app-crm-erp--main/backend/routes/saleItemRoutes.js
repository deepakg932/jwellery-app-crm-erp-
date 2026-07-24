import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import {
  createSaleItem, getSaleItems, updateSaleItem, deleteSaleItem,
  updateSalePayment, getSaleReturns, createSaleReturn,
  updateSaleReturn, deleteSaleReturn,
} from "../Controller/saleItemsController.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads/sale-items"));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

const router = express.Router();

router.post("/create-sale-item", upload.single("exchange_item_image"), createSaleItem);
router.get("/get-sale-items", getSaleItems);
router.put("/update-sale-item/:id", upload.single("exchange_item_image"), updateSaleItem);
router.delete("/delete-sale-item/:id", deleteSaleItem);
router.put("/update-sale-payment/:id", updateSalePayment);

router.get("/get-sale-returns", getSaleReturns);
router.post("/sale-return", createSaleReturn);
router.put("/update-sale-return/:id", updateSaleReturn);
router.delete("/delete-sale-return/:id", deleteSaleReturn);

export default router;
