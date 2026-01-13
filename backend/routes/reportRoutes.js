
import express from 'express';
import { getStockReport } from "../Controller/reportController.js"
// import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.get("/klklk",getStockReport)
// router.get('/:type', protect, getReport);

export default router;
