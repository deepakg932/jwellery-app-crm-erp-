// routes/jobCardStageRoutes.js
import express from "express";
import {
  getJobStages,
  completeStage,
  updateJobStage
} from "../Controller/jobCardStageController.js";

const router = express.Router();

router.get("/job-cards/:jobId/stages", getJobStages);
router.post(
  "/job-cards/:jobId/stages/:stageId/complete",
  completeStage
);

import { jobStageUpload } from "../middleware/jobStageUpload.js";

router.put(
  "/job-card-stages/:stageId",
  jobStageUpload.array("files"), // 🔥 IMPORTANT
  updateJobStage
);



export default router;
