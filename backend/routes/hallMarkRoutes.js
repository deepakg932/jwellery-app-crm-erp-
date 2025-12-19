import express from "express";
import {
  createHallmark,
  getAllHallmarks,
  getHallmarkById,
  updateHallmark,
  deleteHallmark,
  getPurityPercentages,getHallmarkDashboardStats
} from "../Controller/hallMarkController.js"

import hallMarkupload from "../middleware/hallMarkUpload.js";

const router = express.Router();

router.post("/create-hallmark", hallMarkupload.single('image'), createHallmark);
router.get("/all-hallmarks", getAllHallmarks);
router.get("/get-hallmark/:id", getHallmarkById);
router.put("/update-hallmark/:id",hallMarkupload.single('image'), updateHallmark);
router.delete("/delete-hallmark/:id", deleteHallmark);
router.get("/getperc",getPurityPercentages)
router.get("/hallmark/stats", getHallmarkDashboardStats);



export default router;
