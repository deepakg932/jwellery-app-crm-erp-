import express from "express";
import { createStoneType, getAllStoneTypes, updateStoneType, deleteStoneType, getStoneTypeById } from "../Controller/stoneTypeController.js";
import stoneUpload from "../middleware/stoneUpload.js";

const router = express.Router();

router.post("/create-stonetype", stoneUpload.single("stone_image"), createStoneType);
router.get("/stone-types", getAllStoneTypes);
router.get("/:id", getStoneTypeById);
router.put("/update-stonetype/:id", stoneUpload.single("stone_image"), updateStoneType);
router.delete("/delete-stonetype/:id", deleteStoneType);

export default router;
