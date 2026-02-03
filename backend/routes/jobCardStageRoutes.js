
import express from "express";
import {
  updatedesignStage,
  updateCadStage,
  updateCastingStage,
  updateFilingStage,
  updateStoneSettingStage,
  updatePolishingStage,
  updatePlatingStage,
  updateQualityCheckStage,
  updatePackagingStage
} from "../Controller/jobCardStageController.js";

const router = express.Router();



import { jobStageUpload } from "../middleware/jobStageUpload.js"
import jobCastingUpload from "../middleware/jobCastingUpload.js";
import  jobFilingUpload  from "../middleware/jobFilingUpload.js";
import jobSettingjob from "../middleware/jobSettingjob.js";
import jobPolishing from "../middleware/jobPolishing.js";
import jobPlating from "../middleware/jobPlating.js";
import jobQuality from "../middleware/jobQuality.js";
import jobPackaging from "../middleware/jobPackaging.js"












router.put(
  "/job-card-stages/:stageId",
  jobStageUpload.array("files"),
  // jobStageUpload.array("files",5), 
  updatedesignStage
);






router.put(
  "/cad-stage-update/:stageId",
  jobStageUpload.any(),  
  updateCadStage
);




router.put(
  "/casting-stage-update/:stageId",
  jobCastingUpload.any(),
  updateCastingStage
);






router.put(
  "/filing-stage-update/:stageId",
  jobFilingUpload.any(),
  updateFilingStage
);







router.put(
  "/setting-stage-update/:stageId",
  jobSettingjob.any(),
  updateStoneSettingStage
);

router.put(
  "/polishing-stage-update/:stageId",
  jobPolishing.any(),
  updatePolishingStage
);

router.put(
  "/plating-stage-update/:stageId",
  jobPlating.any(),
  updatePlatingStage
);




router.put(
  "/quality-stage-update/:stageId",
  jobQuality.any(),
  updateQualityCheckStage
);



router.put(
  "/packaging-stage-update/:stageId",
  jobPackaging.any(), 
  updatePackagingStage
);



export default router;
