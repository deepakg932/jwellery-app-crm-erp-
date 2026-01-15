




import jwt from "jsonwebtoken";
import User from "../Models/models/UserModel.js"
export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded,decoded)
    const user = await User.findById(decoded.id).select("_id");
    console.log("user",user)

    // const user = await User.findById(decoded.id || decoded.sub); 
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Unauthorized", error: err.message });
  }
};


