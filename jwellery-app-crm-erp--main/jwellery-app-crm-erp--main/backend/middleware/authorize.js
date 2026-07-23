import Role from "../Models/models/Role.js";

/**
 * requireRole: allow when user's role is in allowedRoles
 * usage: requireRole(['admin','branch'])
 */
export const requireRole = (allowedRoles = []) => {
  return (req, res, next) => {
    const userRole = req.user?.role;
    if (!userRole || !allowedRoles.includes(userRole)) {
      return res.status(403).json({ message: "Forbidden — insufficient role" });
    }
    next();
  };
};

/**
 * requirePermission: checks Role model permissions array for user's role
 * usage: requirePermission('products:create')
 */
export const requirePermission = (permission) => {
  return async (req, res, next) => {
    try {
      const userRoleName = req.user?.role;
      if (!userRoleName) return res.status(403).json({ message: "Forbidden" });

      const role = await Role.findOne({ name: userRoleName });
      if (!role) return res.status(403).json({ message: "Role not found" });

      if (!role.permissions || !role.permissions.includes(permission)) {
        return res.status(403).json({ message: "Forbidden — missing permission" });
      }
      next();
    } catch (err) {
      console.error("Permission middleware error:", err);
      res.status(500).json({ message: "Server error" });
    }
  };
};
