import express from "express";
import { getMetalTypes ,createMetal,getMetalsWithPagination,updateMetal,deleteMetal} from "../Controller/metalController.js"
import metalUpload from "../middleware/metalUpload.js"
const router = express.Router();

router.get("/metal-types", getMetalTypes);
router.post("/metal", metalUpload.single("image"), createMetal);
router.get("/metals", getMetals);
router.put("/metal/:id", upload.single("image"), updateMetal);
router.get("/metals", getMetalsWithPagination);


router.delete("/metal/:id", deleteMetal);

export default router;
