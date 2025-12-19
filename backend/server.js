
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
import brandRoutes from "./routes/brandRoutes.js";
import metalRoutes from "./routes/metalRoutes.js"

import hallMarkRoutes from "./routes/hallMarkRoutes.js";
import stoneType from './routes/stoneTypeRoutes.js'
import stoneRoute from "./routes/stoneRoute.js"
import stonepuriRoutes from "./routes/stonepuriRoutes.js";
import makingStageRoutes from "./routes/makingStageRoutes.js";
import makingSubStageRoutes from "./routes/makingSubStageRoutes.js";
import costRoutes from "./routes/costRoutes.js";
import PricemakingRoutes from "./routes/PricemakingRoutes.js";
import pyurityRoutes from "./routes/pyurityRoutes.js";
import gstRoutes from "./routes/gstRoutes.js";
import wastageRoutes from "./routes/wastageRoutes.js";
import wastageMaterialtypeRoutes from "./routes/wastageMaterialtypeRoutes.js";


dotenv.config(); 


connectDB();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.set("trust proxy", true);

app.use(cors())
app.use('/uploads', express.static('uploads'));


app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));

app.use("/api/auth", AuthRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api", protectedRoutes)
app.use('/api/products', productRoutes);
app.use("/api/roles", seedRolesRoute);
app.use('/api/categories', categoryRoutes);
app.use("/api/subcategories",subCategoreisRoutes)
app.use("/api/branches", branchRoutes);
app.use("/api/brands",brandRoutes);
app.use("/api/metals",metalRoutes)
app.use("/api/hallmark",hallMarkRoutes)       
app.use("/api/stonetype",stoneType)
app.use("/api/stone",stoneRoute)
app.use("/api/purity", PurityRoutes);
app.use("/api/stone-purity", stonepuriRoutes);
app.use("/api/making-stages", makingStageRoutes);
app.use("/api/making-sub-stages", makingSubStageRoutes);
app.use("/api/cost-master", costRoutes);
app.use("/api/price-making",PricemakingRoutes)
app.use("/api/purity-stone",stonepuriRoutes)
app.use("/api/stone-purity-stone",pyurityRoutes)
app.use("/api/gst",gstRoutes)
app.use("/api/wastage",wastageRoutes)
app.use("/api/material-types",wastageMaterialtypeRoutes)



const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
