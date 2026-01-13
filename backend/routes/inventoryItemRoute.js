import express  from "express"

import {createInventoryItem,getInventoryItems,updateInventoryItem,deleteinventoryitem,getInventoryPagination} from "../Controller/inventoryItemController.js"
import inventoryUpload from "../middleware/inventoryUpload.js";
// import {authMiddleware} from "../middleware/auth.js"

const  router = express.Router()

router.post(
  "/create-inventory-item",
  inventoryUpload.single("image"),
  createInventoryItem
);

router.get("/get-inventory-items",getInventoryItems)
router.put(
  "/update-inventory-item/:id",
  inventoryUpload.single("image"),
  updateInventoryItem
);
router.delete("/delete-inventory-item/:id",deleteinventoryitem)
router.get("/get-pagination-inventory-items",getInventoryPagination)

export  default router;