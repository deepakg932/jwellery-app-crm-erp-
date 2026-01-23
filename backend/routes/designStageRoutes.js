import express from "express";
import {
  createDesignStage,
  getDesignStages,
  updateDesignStage,
  deleteDesignStage,
} from "../Controller/designStageController.js"

import designUpload from "../middleware/designUpload.js"

const router = express.Router();

router.post(
  "/design-stages",
  designUpload.single("image"),
  createDesignStage
);

router.get("/design-stages", getDesignStages);

router.put(
  "/design-stages/:id",
  designUpload.single("image"),
  updateDesignStage
);

router.delete("/design-stages/:id", deleteDesignStage);

export default router;
