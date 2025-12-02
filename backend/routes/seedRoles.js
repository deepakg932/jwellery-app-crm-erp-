
import express from "express";
import Role from "../Models/models/Role.js";

const router = express.Router();


router.post("/seed", async (req, res) => {
  try {
    const roles = [
      {
        name: "admin",
        permissions: [
          "products:create",
          "products:update",
          "products:delete",
          "products:view",
          "roles:create",
          "roles:update",
          "users:create",
          "users:update"
        ],
        description: "Super admin role"
      },
      {
        name: "branch",
        permissions: [
          "products:create",
          "products:view"
        ],
        description: "Branch user role"
      },
      {
        name: "customer",
        permissions: [
          "products:view"
        ],
        description: "Customer role"
      }
    ];

    for (const role of roles) {
      const exists = await Role.findOne({ name: role.name });
      if (!exists) {
        await Role.create(role);
      }
    }

    return res.json({ message: "Roles seeded successfully" });
  } catch (error) {
    console.error("Seed roles error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
