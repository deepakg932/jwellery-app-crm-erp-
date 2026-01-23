
import express from 'express';
import { getJobCards, createJobCard,updateJobCard ,deleteJobCard,getDesignStageJobs} from "../Controller/jobController.js";

// import { protect } from '../middleware/authMiddleware.js';
import {jobStageUpload}from "../middleware/jobStageUpload.js";

const router = express.Router();
router.post('/create-job-card', jobStageUpload.array('images'), createJobCard);
router.get('/get-job-cards', getJobCards);
router.put('/update-job-card/:id', jobStageUpload.array('images', 5), updateJobCard);
router.delete('/delete-job-card/:id', deleteJobCard);
// router.post('/cards', protect, createJobCard);
// router.get('/cards', protect, getJobCards);
 





router.get("/design-stage/jobs", getDesignStageJobs);

export default router;
