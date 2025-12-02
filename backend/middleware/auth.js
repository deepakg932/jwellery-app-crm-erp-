import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const token = authHeader.split(" ")[1];
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) return res.status(401).json({ message: "Invalid token" });

      // attach decoded to request
      req.user = {
        id: decoded.sub,
        tenant_id: decoded.tenant_id,
        role: decoded.role,
        email: decoded.email,
      };
      next();
    });
  } catch (err) {
    console.error("Auth middleware error:", err);
    res.status(401).json({ message: "Unauthorized" });
  }
};
