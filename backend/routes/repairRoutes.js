
import express from 'express';
import { listRepairs,createRepair,updateRepair,deleteRepair } from "../Controller/repairController.js";
// import { protect } from '../middleware/authMiddleware.js';
import repairUpload from "../middleware/repairUpload.js"

const router = express.Router();


router.post('/create-repair',   repairUpload.array("repair_images", 5) ,createRepair);
router.get('/get-repairs', listRepairs);
router.put(
  "/update-repair/:id",
  repairUpload.array("repair_images", 5),
  updateRepair
);

// router.put('/update-repair/:id', updateRepair);
router.delete('/delete-repair/:id',deleteRepair);
// router.get('/', protect, getRepairs);
// router.post('/', protect, createRepair);

export default router;
