import express from "express";

import { createPurity, getAllPurities,getPurityById, updatePurity, deletePurity } from "../Controller/purityController.js";
const router = express.Router();

router.post("/createpurity",createPurity);
router.get("/getpurity",getAllPurities);
router.get("/getpurity/:id",getPurityById);
router.put("/updatepurity/:id",updatePurity);
router.delete("/deletepurity/:id",deletePurity);
export default router;
