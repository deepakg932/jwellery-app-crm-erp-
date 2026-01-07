// import jwt from "jsonwebtoken";
// import dotenv from "dotenv";
// dotenv.config();

// const JWT_SECRET = process.env.JWT_SECRET;

// export const authenticate = (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization || req.headers.Authorization;
//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }
//     const token = authHeader.split(" ")[1];
//     jwt.verify(token, JWT_SECRET, (err, decoded) => {
//       if (err) return res.status(401).json({ message: "Invalid token" });

//       // attach decoded to request
//       req.user = {
//         id: decoded.sub,
//         tenant_id: decoded.tenant_id,
//         role: decoded.role,
//         email: decoded.email,
//       };
//       next();
//     });
//   } catch (err) {
//     console.error("Auth middleware error:", err);
//     res.status(401).json({ message: "Unauthorized" });
//   }
// };




import jwt from "jsonwebtoken";
import User from "../Models/models/UserModel.js"
export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id || decoded.sub); 
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Unauthorized", error: err.message });
  }
};


