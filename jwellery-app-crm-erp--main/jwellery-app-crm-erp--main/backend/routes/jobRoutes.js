import express from 'express';
import {
  getJobCards,
  getJobCardById,
  createJobCard,
  updateJobCard,
  deleteJobCard,
  updateJobCardStatus,
  convertToSale,
  uploadJobCardImages,
  getStagesByType,
} from '../Controller/jobController.js';

const router = express.Router();

router.get('/get-job-cards', getJobCards);
router.get('/get-job-card/:id', getJobCardById);
router.post('/create-job-card', uploadJobCardImages, createJobCard);
router.put('/update-job-card/:id', uploadJobCardImages, updateJobCard);
router.delete('/delete-job-card/:id', deleteJobCard);
router.put('/update-job-card-status/:id', updateJobCardStatus);
router.post('/convert-to-sale/:id', convertToSale);

router.get('/design-stage/jobs', (req, res) => { req.query.stage = 'design'; getStagesByType(req, res); });
router.get('/cad-stage/jobs', (req, res) => { req.query.stage = 'cad'; getStagesByType(req, res); });
router.get('/casting-stage-jobs', (req, res) => { req.query.stage = 'casting'; getStagesByType(req, res); });
router.get('/filing-stage-jobs', (req, res) => { req.query.stage = 'filing'; getStagesByType(req, res); });
router.get('/setting-stage-jobs', (req, res) => { req.query.stage = 'setting'; getStagesByType(req, res); });
router.get('/polishing-stage-jobs', (req, res) => { req.query.stage = 'polishing'; getStagesByType(req, res); });
router.get('/plating-stage-jobs', (req, res) => { req.query.stage = 'plating'; getStagesByType(req, res); });
router.get('/quality-stage-jobs', (req, res) => { req.query.stage = 'quality'; getStagesByType(req, res); });
router.get('/packages-stage-jobs', (req, res) => { req.query.stage = 'packaging'; getStagesByType(req, res); });

export default router;
