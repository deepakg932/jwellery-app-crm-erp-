import express from "express";

import { createStonePurity, getStonePurities,getPurityById, updatePurity, deletePurity } from "../Controller/purityStoneController.js";
const router = express.Router();



router.post("/create-stonePurity", createStonePurity);

router.get("/getpurity-stonePurity",getStonePurities);
router.get("/getpurity-stonePurty/:id",getPurityById);
router.put("/updateStonepurity/:id", updatePurity);

router.delete("/deleteStonepurity/:id",deletePurity);


export default router;
