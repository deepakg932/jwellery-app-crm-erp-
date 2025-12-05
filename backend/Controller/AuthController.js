import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import Tenant from "../Models/models/TenantModel.js";
import User from "../Models/models/UserModel.js";

import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || "7d";

function generateAccessToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}
function generateRefreshToken(payload) {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN });
}

export const register = async (req, res) => {
  try {
    let {company_name, full_name, username, email, phone, password, confirm_password } = req.body;
    console.log(req.body,"req.body in register")

    
    if (!company_name || !full_name || !username || !email || !password || !confirm_password) {
  return res.status(400).json({ message: "Missing required fields" });
}

    if (password !== confirm_password) 
      return res.status(400).json({ message: "Passwords do not match" });

    // const allowedRoles = ["admin", "branch", "customer"];
    // if (!allowedRoles.includes(role)) return res.status(400).json({ message: "Invalid role" });

    
    // if (role === "admin" && !tenant_id) {
    //   const tenant = new Tenant({ company_name });
    //   await tenant.save();
    //   tenant_id = tenant._id;
    // }

 
    // if (role !== "admin" && !tenant_id) {
    //   return res.status(400).json({ message: "tenant_id is required for non-admin roles" });
    // }

    const existingUser = await User.findOne({ email});
    if (existingUser) return res.status(400).json({ message: "User already exists with this email in this tenant" });

    const hashed = await bcrypt.hash(password, 10);

    const newUser = new User({
      // tenant_id,
      company_name,
      full_name,
      username,
      email,
      phone,
      confirm_password,
      password: hashed,
      // role,
    });

   const  check = await newUser.save();
   console.log(check,"check")

    
    return res.status(200).json({message: "User registered successfully",user: {  id: newUser._id,  tenant_id: newUser.tenant_id,  company_name: newUser.company_name,full_name: newUser.full_name, username: newUser.username, email: newUser.email,
   phone: newUser.phone,
        // role: newUser.role,
      },
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Server error" });
  }
};




export const login = async (req, res) => {
  try {
    const { email, password, tenant_id } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "email, password are required" });
    }

    const user = await User.findOne({ email });
    console.log(user,"user")
    if (!user) 
      return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    console.log(match,"match")
    if (!match) 
      return res.status(400).json({ message: "Invalid credentials" });

    const payload = {
      sub: user._id,
      // tenant_id: user.tenant_id,
      // role: user.role,
      email: user.email
    };
console.log(payload,"payload")
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

 
    user.refresh_tokens = [{ token: refreshToken, created_at: new Date() }];
    user.last_login = new Date();

    await user.save();

   return res.json({ accessToken, refreshToken, expiresIn: JWT_EXPIRES_IN, user: {   id: user._id,   email: user.email,   role: user.role,
        tenant_id: user.tenant_id,
        full_name: user.full_name
      },
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


export const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) 
      return res.status(400).json({ message: "refreshToken required" });

    jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, async (err, decoded) => {
      if (err)
         return res.status(401).json({ message: "Invalid refresh token" });

      const user = await User.findById(decoded.sub);
      if (!user) 
        return res.status(401).json({ message: "User not found" });

      const stored = user.refresh_tokens.find((r) => r.token === refreshToken);
      if (!stored) 
        return res.status(401).json({ message: "Refresh token not recognized" });

     
      const payload = { sub: user._id, tenant_id: user.tenant_id, role: user.role, email: user.email };
      console.log(payload,"payload in refresh")

      const accessToken = generateAccessToken(payload);
      console.log(accessToken,"accessToken in refresh")

     return res.json({ accessToken, expiresIn: JWT_EXPIRES_IN });
    });
  } catch (err) {
    console.error("Refresh error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) 
      return res.status(400).json({ message: "refreshToken required" });


    const decoded = jwt.decode(refreshToken);
    if (!decoded)
       return res.status(400).json({ message: "Invalid token" });

    const user = await User.findById(decoded.sub);
    comnsole.log(user,"user in logout")
    if (!user) 
      return res.status(400).json({ message: "User not found" });

   let a88 =  user.refresh_tokens = user.refresh_tokens.filter((r) => r.token !== refreshToken);
   console.log(a88,"a88 in logout")
    await user.save();

 return   res.json({ message: "Logged out" });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
