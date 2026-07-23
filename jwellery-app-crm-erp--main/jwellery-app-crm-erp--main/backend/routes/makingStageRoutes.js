import express from "express";
import {
  createStage,
  getStages,
  getStageById,
  updateStage,
  deleteStage
} from "../Controller/makingStageController.js"

const router = express.Router();

router.post("/create-making-stages", createStage);
router.get("/all-making-stages", getStages);
router.get("/get-making-stages/:id", getStageById);
router.put("/update-making-stages/:id", updateStage);
router.delete("/delete-making-stages/:id", deleteStage);

export default router;
