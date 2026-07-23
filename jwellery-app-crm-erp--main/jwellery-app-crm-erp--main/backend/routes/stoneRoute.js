import express from 'express';
const router = express.Router()
import {
  createStone,
  getAllStoneTypes,
  updateStoneType,
  deleteStoneType,
  getStoneTypeById


} from "../Controller/stoneController.js"
import stone from "../middleware/stone.js";

router.post('/create-stone',stone.single('stone_image'),createStone);

router.get('/all-stones', getAllStoneTypes);

router.put('/updates-stone/:id',stone.single('stone_image'),updateStoneType);

router.delete('/deletes-stone/:id', deleteStoneType);

router.get('/:id', getStoneTypeById); 





export default router;
