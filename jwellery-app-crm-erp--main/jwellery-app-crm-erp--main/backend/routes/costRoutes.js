import express from 'express';
import { createCostMaster,getCostMasters ,updateCostMaster,deleteCostMaster,createCostType,getCostTypes,updateCostType,deleteCostType, getCostNames} from "../Controller/costMaster.js";

const router = express.Router();

router.post("/create-cost-master", createCostMaster);
router.get("/get-cost-masters", getCostNames);
router.put("/update-cost-master/:id", updateCostMaster);
router.delete("/delete-cost-master/:id", deleteCostMaster);

router.post("/create-cost-type", createCostType);
router.get("/all-cost-types", getCostTypes);
router.put("/update-cost-type/:id", updateCostType);
router.delete("/delete-cost-type/:id", deleteCostType);
export default router;
