import express from "express";
import { authMiddleware} from "../middleware/auth.js";
import { requireRole, requirePermission } from "../middleware/authorize.js";
import { tenantGuard } from "../middleware/tenantGuard.js";

const router = express.Router();


router.get("/dashboard/:tenantId", authMiddleware, tenantGuard({ param: "tenantId" }), requireRole(["admin","branch"]), async (req, res) => {
  res.json({ message: `Hello ${req.user.role} from tenant ${req.user.tenant_id}` });
});

router.post("/products", authMiddleware, requirePermission("products:create"), async (req, res) => {
  
  res.json({ message: "product created (demo)" });
});

export default router;
