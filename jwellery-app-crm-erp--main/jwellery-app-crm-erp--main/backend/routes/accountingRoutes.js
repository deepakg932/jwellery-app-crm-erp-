
import express from 'express';
import { getLedgers, getLedgerEntries } from '../controllers/accountingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.get('/ledgers', protect, getLedgers);
router.get('/ledger-entries', protect, getLedgerEntries);

export default router;
