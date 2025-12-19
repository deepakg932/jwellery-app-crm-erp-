import express from "express"
const router = express.Router();
import { createGstRate,getGstRates,updateGstRate,deleteGstRate } from "../Controller/gstController.js";

router.post("/create-gst",createGstRate)
router.get("/all-gst",getGstRates)
router.put("/update-gst/:id",updateGstRate)
router.delete("/delete-gst/:id",deleteGstRate)

export default router;