import express from "express";
import {
  createHallmark,
  getAllHallmarks,
  getHallmarkById,
  updateHallmark,
  deleteHallmark,
  getPurityPercentages,getHallmarkDashboardStats
} from "../Controller/hallMarkController"

const router = express.Router();

router.post("/hallmark", createHallmark);
router.get("/hallmarks", getAllHallmarks);
router.get("/hallmark/:id", getHallmarkById);
router.put("/hallmark/:id", updateHallmark);
router.delete("/hallmark/:id", deleteHallmark);
router.get("/getperc",getPurityPercentages)
router.get("/hallmark/stats", getHallmarkDashboardStats);



export default router;
