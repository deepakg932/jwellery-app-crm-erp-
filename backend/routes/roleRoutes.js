import express from "express";
import Role from "../Models/models/Role.js"
import { authenticate } from "../middleware/auth.js";
import { requireRole } from "../middleware/authorize.js";

const router = express.Router();

router.post("/", authenticate, requireRole(["admin"]), async (req, res) => {
  try {
    const { name, permissions = [], description } = req.body;
    const role = new Role({ name, permissions, description });
    await role.save();
    res.status(201).json({ role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


router.put("/:roleName", authenticate, requireRole(["admin"]), async (req, res) => {
  try {
    const { roleName } = req.params;
    const { permissions } = req.body;
    const role = await Role.findOneAndUpdate({ name: roleName }, { permissions }, { new: true, upsert: false });
    if (!role) return res.status(404).json({ message: "Role not found" });
    res.json({ role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/", authenticate, requireRole(["admin"]), async (req, res) => {
  const roles = await Role.find({});
  res.json({ roles });
});

export default router;
