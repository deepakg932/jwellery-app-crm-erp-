
import express from 'express';
import { createStonePurity ,getStonePurities,updatePurity,deletePurity} from '../Controller/stonePurityContorller.js';


const router = express.Router();
router.post("/create-stone-purity",createStonePurity)
router.get("/get-stone-purities",getStonePurities)
router.put("/update-stone-purity/:id",updatePurity);
router.delete("/delete-stone-purity/:id",deletePurity);


export default router;
