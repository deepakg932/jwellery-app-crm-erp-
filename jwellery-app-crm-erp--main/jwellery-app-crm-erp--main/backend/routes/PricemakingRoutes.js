import express from 'express';
const  router = express.Router()
import {createPriceMaking,getPriceMakings,updatePriceMaking,deletePriceMaking,getPriceMakingDropdowns} from "../Controller/PriceMakingController.js"

router.get("/get-dropdowns", getPriceMakingDropdowns);
router.post("/create-price-making", createPriceMaking);
router.get("/get-price-makings", getPriceMakings);
router.put("/update-price-making/:id", updatePriceMaking);
router.delete("/delete-price-making/:id", deletePriceMaking);
export default router;
