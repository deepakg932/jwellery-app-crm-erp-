import express from "express";

const router = express.Router();
import { createInventoryCategory,getInventoryCategories ,updateInventoryCategory,deleteInventoryCategory} from "../Controller/inventoryCategoryController.js";

router.post("/create-inventory-category",createInventoryCategory)
router.get("/get-inventory-categories",getInventoryCategories)
router.put("/update-inventory-category/:id",updateInventoryCategory)
router.delete("/delete-inventory-category/:id",deleteInventoryCategory)



export default router;
