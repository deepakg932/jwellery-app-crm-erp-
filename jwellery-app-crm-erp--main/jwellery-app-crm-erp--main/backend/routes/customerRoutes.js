import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import {
  createCustomer, getCustomers, getCustomerById,
  updateCustomer, deleteCustomer,
  createCustomerGroup, getCustomerGroups,
  updateCustomerGroup, deleteCustomerGroup,
} from "../Controller/customerController.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads/customer"));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

const router = express.Router();

router.post("/create-customer", upload.single("image"), createCustomer);
router.get("/get-customers", getCustomers);
router.get("/get-customer/:id", getCustomerById);
router.put("/update-customer/:id", upload.single("image"), updateCustomer);
router.delete("/delete-customer/:id", deleteCustomer);

router.post("/create-customer-group", createCustomerGroup);
router.get("/get-customer-groups", getCustomerGroups);
router.put("/update-customer-group/:id", updateCustomerGroup);
router.delete("/delete-customer-group/:id", deleteCustomerGroup);

export default router;
