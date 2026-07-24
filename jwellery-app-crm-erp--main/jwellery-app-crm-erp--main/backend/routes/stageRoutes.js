import express from 'express';
import { updateStage, uploadJobCardImages } from '../Controller/jobController.js';

const router = express.Router();

router.put('/job-card-stages/:id', uploadJobCardImages, (req, res) => { req.body.stage = 'design'; updateStage(req, res); });
router.put('/cad-stage-update/:id', uploadJobCardImages, (req, res) => { req.body.stage = 'cad'; updateStage(req, res); });
router.put('/casting-stage-update/:id', uploadJobCardImages, (req, res) => { req.body.stage = 'casting'; updateStage(req, res); });
router.put('/filing-stage-update/:id', uploadJobCardImages, (req, res) => { req.body.stage = 'filing'; updateStage(req, res); });
router.put('/setting-stage-update/:id', uploadJobCardImages, (req, res) => { req.body.stage = 'setting'; updateStage(req, res); });
router.put('/polishing-stage-update/:id', uploadJobCardImages, (req, res) => { req.body.stage = 'polishing'; updateStage(req, res); });
router.put('/plating-stage-update/:id', uploadJobCardImages, (req, res) => { req.body.stage = 'plating'; updateStage(req, res); });
router.put('/quality-stage-update/:id', uploadJobCardImages, (req, res) => { req.body.stage = 'quality'; updateStage(req, res); });
router.put('/packaging-stage-update/:id', uploadJobCardImages, (req, res) => { req.body.stage = 'packaging'; updateStage(req, res); });

export default router;
