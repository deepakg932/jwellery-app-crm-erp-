import express from "express";
import { createPurity, getAllPurities, updatePurity, deletePurity, getPurityById } from "../Controller/purityController.js";

const router = express.Router();

router.post("/create-purity", createPurity);
router.get("/get-purity", getAllPurities);
router.get("/get-purity/:id", getPurityById);
router.put("/update-purity/:id", updatePurity);
router.delete("/delete-purity/:id", deletePurity);

export default router;
