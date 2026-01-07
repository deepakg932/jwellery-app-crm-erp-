import  express from "express"
const router   = express.Router();
import { authMiddleware } from "../middleware/auth.js";
import { createSupplier ,updateSupplier,getSuppliers,deleteSupplier} from "../Controller/supplierController.js"


router.post("/create-supplier",createSupplier)
// router.post("/create-supplier",authMiddleware,createSupplier)
router.put("/update-supplier/:id",updateSupplier)
router.get("/get-suppliers",getSuppliers)
router.delete("/delete-supplier/:id",deleteSupplier)

export default router;