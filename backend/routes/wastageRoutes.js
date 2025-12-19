import express from "express"
const router = express.Router();

import {createWastage,getWastages,updateWastage,deleteWastage} from "../Controller/wastageController.js"

router.post("/create-wastage",createWastage)
router.get("/all-wastages",getWastages)
router.put("/update-wastage/:id",updateWastage)
router.delete("/delete-wastage/:id",deleteWastage)
export default router;

