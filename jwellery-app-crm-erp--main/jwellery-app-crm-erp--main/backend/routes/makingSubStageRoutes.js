import express from "express";
import {
  createSubStage,
  getSubStages,
  updateSubStage,
  deleteSubStage
} from "../Controller/makingSubStageController.js"

const router = express.Router();

router.post("/create-making-sub-stage", createSubStage);
router.get("/get-making-sub-stage", getSubStages);
router.put("/update-making-sub-stage/:id", updateSubStage);
router.delete("/delete-making-sub-stage/:id", deleteSubStage);

export default router;
