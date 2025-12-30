import express  from "express"

import {createInventoryItem,getInventoryItems,updateInventoryItem,deleteinventoryitem,getInventoryPagination} from "../Controller/inventoryItemController.js"

const  router = express.Router()

router.post("/create-inventory-item",createInventoryItem)
router.get("/get-inventory-items",getInventoryItems)
router.put("/update-inventory-item/:id",updateInventoryItem)
router.delete("/delete-inventory-item/:id",deleteinventoryitem)
router.get("/get-Pagination-inventory",getInventoryPagination)

export  default router;