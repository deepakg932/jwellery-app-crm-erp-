import express from 'express';
import {
  getStockMovements,
  getStockMovementById,
  createStockMovement,
  updateStockMovement,
  deleteStockMovement,
} from '../Controller/stockMovementController.js';

const router = express.Router();

router.get('/get-stock-grns', getStockMovements);
router.get('/get-stock-grn/:id', getStockMovementById);
router.post('/create-receive-item', createStockMovement);
router.put('/update-receive-item/:id', updateStockMovement);
router.delete('/delete-stock-movement/:id', deleteStockMovement);

export default router;
