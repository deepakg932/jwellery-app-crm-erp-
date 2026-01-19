import express from "express";
const router = express.Router();
import {createCustomOrder,getCustomOrders,updateCustomOrder,deleteCustomOrder} from "../Controller/customOrderController.js";
import CustomOrderUpload from "../middleware/CustomOrderUpload.js"

router.post("/custom-order", CustomOrderUpload.array("images"), createCustomOrder);
router.put("/update-custom-order/:id",CustomOrderUpload.array("images"), updateCustomOrder);
router.get("/get-custom-orders", getCustomOrders);
router.delete("/delete-custom-order/:id",deleteCustomOrder);
export default router;