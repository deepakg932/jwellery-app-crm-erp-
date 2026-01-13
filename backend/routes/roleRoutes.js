
import express from "express";
import { createRole,updateRole,getAllRoles,deleteRole} from "../Controller/roleController.js"

// import { authMiddleware } from "../middleware/auth.js";
// import { requireRole } from "../middleware/authorize.js";

const router = express.Router();


// router.post("/",authMiddleware,requireRole(["admin"]),createRole);

// router.put("/:roleName",authMiddleware,requireRole(["admin"]),updateRolePermissions);

// router.get("/",authMiddleware,requireRole(["admin"]),getAllRoles);




router.post("/create-role",createRole);

// router.put("/:id", authMiddleware, requireRole(["admin"]), updateRole);  
router.put("/update-role/:id",updateRole);

router.get("/get-roles",getAllRoles);
router.delete("/delete-role/:id",deleteRole);

export default router;
