import express from 'express';
const  router = express.Router()
import {createPriceMaking,getPriceMakings,updatePriceMaking,deletePriceMaking} from "../Controller/PriceMakingController.js"

router.post("/create-price-making", createPriceMaking);
router.get("/get-price-makings", getPriceMakings);
router.put("/update-price-making/:id", updatePriceMaking);
router.delete("/delete-price-making/:id", deletePriceMaking);
export default router;
