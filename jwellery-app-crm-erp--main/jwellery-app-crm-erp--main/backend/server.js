
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
import inventorycategoryRoute from "./routes/inventorycategoryRoute.js";

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
import inventoryItemRoute from "./routes/inventoryItemRoute.js"
import supplierRoute from "./routes/supplierRoutes.js"
import jobRoutes from "./routes/jobRoutes.js"
import stageRoutes from "./routes/stageRoutes.js"
import purchaseRoutes from "./routes/purchaseRoutes.js"
import customerRoutes from "./routes/customerRoutes.js"
import saleItemRoutes from "./routes/saleItemRoutes.js"
import customOrderRoutes from "./routes/customOrderRoutes.js"
import quotationRoutes from "./routes/quotationRoutes.js"
import repairRoutes from "./routes/repairRoutes.js"
import deptDesigRoutes from "./routes/departmentDesignationRoutes.js"
import hrRoutes from "./routes/hrRoutes.js"
import employeeRoutes from "./routes/employeeRoutes.js"
import stockMovementRoutes from "./routes/stockMovementRoutes.js"


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
app.use("/api/inventory-categories", inventorycategoryRoute);
app.use("/api/inventory-item",inventoryItemRoute)
app.use('/api/supplier',supplierRoute)
app.use("/api/job-card", jobRoutes)
app.use("/api/design-stage", stageRoutes)
app.use("/api/purchase-orders", purchaseRoutes)
app.use("/api/customers", customerRoutes)
app.use("/api/customers-group", customerRoutes)
app.use("/api/sale-items", saleItemRoutes)
app.use("/api/custom-orders", customOrderRoutes)
app.use("/api/quotation", quotationRoutes)
app.use("/api/repairs", repairRoutes)
app.use("/api/department", deptDesigRoutes)
app.use("/api/designation", deptDesigRoutes)
app.use("/api/hr", hrRoutes)
app.use("/api/employees", employeeRoutes)
app.use("/api/stock-movement", stockMovementRoutes)



const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Jewellery CRM ERP API is running 🚀",
    version: "1.0.0",
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
