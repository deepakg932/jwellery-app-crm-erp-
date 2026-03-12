
import express from "express";
import dotenv from "dotenv";
import connectDB from "./db/DbConnect.js";
import AuthRoutes from "./routes/AuthRoutes.js";

// import protectedRoutes from "./routes/protectedExample.js";
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
import supplierRoute from "./routes/supplierRoutes.js";
import purchaseRoutes from "./routes/purchaseRoutes.js"
// import grn from "./routes/grn(STOCK-IN)Routes.js";

import InventoryStockRoutes from "./routes/InventoryStockRoutes.js"


import inventorySubCategory from "./routes/inventorySubCategory.js"
import stockRoutes from "./routes/stockRoutes.js";
import reportRoutes from "./routes/reportRoutes.js"
import PurchaseReturnRoutes from "./routes/PurchaseReturnRoutes.js";
import customerGroupRoutes from "./routes/customerGroupRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import roleRoutes from "./routes/roleRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import salesRoute from "./routes/salesRoute.js";
import invoiceRoutes from "./routes/invoiceRoutes.js";
import CustomRoutes from "./routes/CustomRoutes.js";
import quotationRoutes from "./routes/quotationRoutes.js";
import repairRoutes from "./routes/repairRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import jobCardStageRoutes from "./routes/jobCardStageRoutes.js"
import { fetchLiveGoldRate } from "./services/goldRateService.js"
import departmentRoutes from "./routes/deparmentRoute.js";
import designationRoutes from "./routes/designationRoutes.js";
import leaveRoutes from "./routes/leaveRoutes.js";
import leaveTypeRoutes from "./routes/leaveTypeRoutes.js";
import holidayRoute from "./routes/holidayRoute.js"

import cron from "node-cron";
dotenv.config(); 




connectDB();

const app = express();

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));



app.use(cors())
app.use('/uploads', express.static('uploads'));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));


app.use("/api/auth", AuthRoutes);
app.use("/api/roles", roleRoutes);
// app.use("/api", protectedRoutes)
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
app.use("/api/inventory-sub-categories",inventorySubCategory)
app.use("/api/inventory-item",inventoryItemRoute)
app.use('/api/supplier',supplierRoute)
app.use("/api/purchase-orders",purchaseRoutes)
app.use("/api/stock-movement",stockRoutes)
app.use("/api/purchase-return",PurchaseReturnRoutes)
app.use("/api/report",reportRoutes)
app.use("/api/customers-group",customerGroupRoutes)
app.use("/api/employees",employeeRoutes)
app.use("/api/sale-items",salesRoute)
app.use("/api/sales-invoice",invoiceRoutes)

app.use("/api/customers",customerRoutes)
app.use("/api/custom-orders",CustomRoutes)
app.use("/api/Inventory-stock",InventoryStockRoutes)
app.use("/api/quotation",quotationRoutes)
app.use("/api/repairs",repairRoutes)


app.use("/api/hr/leaves", leaveRoutes);
app.use("/api/job-card",jobRoutes)



app.use("/api/design-stage",jobCardStageRoutes)

app.use("/api/department",departmentRoutes)


app.use("/api/designation",designationRoutes)
app.use("/api/hr/leave-type", leaveTypeRoutes);
app.use("/api/hr/holiday",holidayRoute)



import uploadRoutes from "./routes/uploadRoutes.js";

app.use("/api", uploadRoutes);


app.use((req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = { _id: decoded.id };
    } catch (e) {
      req.user = null;
    }
  }
  next();
});




// cron.schedule("0 9 * * *", async () => {
//   console.log("Fetching daily gold rate...");
//   await fetchLiveGoldRate();
// });



// // 🔥 TEMP TEST — server start hote hi chalega
// (async () => {
//   console.log("MANUAL GOLD RATE FETCH START");
//   await fetchLiveGoldRate();
// })();





//2nd CRON TEST Use running
// cron.schedule("*/1 * * * *", async () => {

//   await fetchLiveGoldRate();
// });



const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
