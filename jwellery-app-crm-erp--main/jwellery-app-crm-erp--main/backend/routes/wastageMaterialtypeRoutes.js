import express from "express";
const router = express.Router();
import { createWastageMaterialType, getWastageMaterialTypes,updateWastageMaterialType,deleteWastageMaterialType} from "../Controller/wastageMaterialtypeController.js";
router.post("/create-material-type", createWastageMaterialType);
router.get("/get-material-types", getWastageMaterialTypes);
router.put("/update-material-type/:id", updateWastageMaterialType);
router.delete("/delete-material-type/:id", deleteWastageMaterialType);
export default router;



