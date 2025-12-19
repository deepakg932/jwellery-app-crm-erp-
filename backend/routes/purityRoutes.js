import express from "express";

import { createPurity, getAllPurities,getPurityById, updatePurity,getPurityDashboardStats, deletePurity } from "../Controller/purityController.js";
const router = express.Router();

import purityUpload from "../middleware/purityUpload.js";


router.post("/create",purityUpload.single("image"),   createPurity);

router.get("/getpurity",getAllPurities);
router.get("/getpurity/:id",getPurityById);
router.put("/updatepurity/:id", purityUpload.single("image"), updatePurity);

router.delete("/deletepurity/:id",deletePurity);
router.get("/purity/stats", getPurityDashboardStats);

export default router;
