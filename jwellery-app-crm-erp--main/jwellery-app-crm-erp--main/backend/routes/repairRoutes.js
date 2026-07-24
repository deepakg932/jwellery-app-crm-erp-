import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import {
  createRepair, getRepairs, getRepairById,
  updateRepair, deleteRepair, updateRepairPayment,
} from "../Controller/repairController.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads/repairs"));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

const router = express.Router();

router.post("/create-repair", upload.array("repair_images", 10), createRepair);
router.get("/get-repairs", getRepairs);
router.get("/get-repair/:id", getRepairById);
router.put("/update-repair/:id", upload.array("repair_images", 10), updateRepair);
router.delete("/delete-repair/:id", deleteRepair);
router.put("/update-repair-payment/:id", updateRepairPayment);

export default router;
