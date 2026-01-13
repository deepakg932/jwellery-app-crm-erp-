import express from "express";
const router = express.Router();
import { createCustomerGroup, updateCustomerGroup, getCustomerGroups,deleteCustomerGroup} from "../Controller/customerGroup.js"

router.post("/create-customer-group", createCustomerGroup);
router.put("/update-customer-group/:id", updateCustomerGroup);
router.get("/get-customer-groups", getCustomerGroups);
// router.get("/get-customer-group/:id", getCustomerGroupById);
router.delete("/delete-customer-group/:id", deleteCustomerGroup);

export default router;