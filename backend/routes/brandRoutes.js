import express from "express";

import { createBrand, updateBrand, deleteBrand, getBrands,getBrandDashboardStats } from "../Controller/BrandController.js"
const router = express.Router();


import { brandUpload } from "../middleware/brandUpload.js"


router.post("/create-brand", brandUpload.single("logo"), createBrand);
router.put("/updatebrand/:id", brandUpload.single("logo"), updateBrand);
router.delete("/deletebrand/:id", deleteBrand);
router.get("/brand/stats", getBrandDashboardStats);

router.get("/list", getBrands);

export default router;

