import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import {
  createCustomOrder, getCustomOrders, updateCustomOrder, deleteCustomOrder,
} from "../Controller/customOrderController.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads/custom-orders"));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

const router = express.Router();

router.post("/custom-order", upload.array("images", 5), createCustomOrder);
router.get("/get-custom-orders", getCustomOrders);
router.put("/update-custom-order/:id", upload.array("images", 5), updateCustomOrder);
router.delete("/delete-custom-order/:id", deleteCustomOrder);

export default router;
