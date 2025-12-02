// server.js
import express from "express";
import dotenv from "dotenv";
import connectDB from "./db/DbConnect.js";
import AuthRoutes from "./routes/AuthRoutes.js";
import roleRoutes from "./routes/roleRoutes.js";
import protectedRoutes from "./routes/protectedExample.js";
import cors from "cors"
import productRoutes from './routes/productRoutes.js';
import seedRolesRoute from "./routes/seedRoles.js";
import categoryRoutes from './routes/categoryRoutes.js';
import subCategoreisRoutes from "./routes/subCategoreisRoutes.js";
import PurityRoutes from "./routes/purityRoutes.js";
import branchRoutes from "./routes/branchRoutes.js";


dotenv.config(); // load .env file

// Connect Database
connectDB();

const app = express();

app.use(express.json()); // To parse JSON bodies
app.use(express.urlencoded({ extended: true })); // To parse form data
app.use(cors())
app.use('/uploads', express.static('uploads'));



// Routes
app.use("/api/auth", AuthRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api", protectedRoutes)
app.use('/api/products', productRoutes);
app.use("/api/roles", seedRolesRoute);
app.use('/api/categories', categoryRoutes);
app.use("/api/subcategories",subCategoreisRoutes)
app.use("/api/purity", PurityRoutes);
app.use("/api/branches", branchRoutes);



const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
