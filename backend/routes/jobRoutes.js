
import express from 'express';
import { getJobCards, createJobCard,updateJobCard ,deleteJobCard,getDesignStageJobs,getCadStageJobs,
    getCastingStageJobs,getFilingStageJobs,getStoneSettingStageJobs,getPolishingStageJobs,getPlatingStageJobs,getQualityStageJobs,getPackagesStageJobs} from "../Controller/jobController.js";

// import { protect } from '../middleware/authMiddleware.js';
// import {jobCardUpload}from "../middleware/jobCardUpload.js";
import jobCardUpload from "../middleware/jobCardUpload.js"

const router = express.Router();



// router.post('/create-job-card', jobCardUpload, createJobCard);
router.post(
  "/create-job-card",
  jobCardUpload.array("images", 5),
  createJobCard
);


// router.post('/create-job-card', jobStageUpload.array('images'), createJobCard);
router.get('/get-job-cards', getJobCards);
// router.put('/update-job-card/:id', jobStageUpload.array('images', 5), updateJobCard);
// router.put('/update-job-card/:id', jobCardUpload, updateJobCard);
router.put('/update-job-card/:id', jobCardUpload.array("images",5), updateJobCard);
router.delete('/delete-job-card/:id', deleteJobCard);
// router.post('/cards', protect, createJobCard);
// router.get('/cards', protect, getJobCards);
 





router.get("/design-stage/jobs", getDesignStageJobs);

router.get("/cad-stage/jobs",getCadStageJobs)



router.get("/casting-stage-jobs", getCastingStageJobs);



router.get("/filing-stage-jobs", getFilingStageJobs);


router.get("/setting-stage-jobs",getStoneSettingStageJobs)

router.get("/polishing-stage-jobs",getPolishingStageJobs)

router.get("/plating-stage-jobs",getPlatingStageJobs);

router.get("/quality-stage-jobs",getQualityStageJobs);

router.get("/packages-stage-jobs",getPackagesStageJobs)

export default router;
