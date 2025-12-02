/**
 * Ensures that tenant_id in resource or request body matches the authenticated user's tenant.
 * Use this on routes that accept a :tenantId param or tenant_id in body.
 *
 * Example usage:
 * app.post('/products', authenticate, tenantGuard, (req,res)=>{})
 */
export const tenantGuard = (options = {}) => {
  // options.param = name of param containing tenant id (default: tenantId)
  // options.body = if true, check req.body.tenant_id
  const paramName = options.param || "tenantId";
  const checkBody = options.body ?? true;

  return (req, res, next) => {
    const userTenant = String(req.user?.tenant_id);
    const paramTenant = req.params?.[paramName] ? String(req.params[paramName]) : null;
    const bodyTenant = checkBody && req.body?.tenant_id ? String(req.body.tenant_id) : null;

    if (paramTenant && paramTenant !== userTenant) {
      return res.status(403).json({ message: "Forbidden — tenant mismatch" });
    }
    if (bodyTenant && bodyTenant !== userTenant) {
      return res.status(403).json({ message: "Forbidden — tenant mismatch" });
    }

    // if neither provided, we allow — other checks should ensure tenant is present
    next();
  };
};
