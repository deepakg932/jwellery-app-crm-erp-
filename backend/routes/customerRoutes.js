import express from "express";
const router = express.Router();
import { createCustomer, updateCustomer, getCustomers, getCustomerById, deleteCustomer } from "../Controller/customerController.js"

import { uploadCustomerImage } from "../middleware/uploadCustomer.js";
// router.post("/create-customer", createCustomer);
router.post(
  "/create-customer",
  uploadCustomerImage.single("image"),
  createCustomer
);
router.put("/update-customer/:id", updateCustomer);
router.get("/get-customers", getCustomers);
router.get("/get-customer/:id", getCustomerById);
router.delete("/delete-customer/:id", deleteCustomer);


export default router;