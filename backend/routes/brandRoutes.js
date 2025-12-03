import express from "express";

import { createBrand, updateBrand, deleteBrand, getBrands } from "../Controller/BrandController.js"
const router = express.Router();


import { brandUpload } from "../middleware/brandUpload.js"


router.post("/create", brandUpload.single("image"), createBrand);
router.put("/update/:id", brandUpload.single("image"), updateBrand);
router.delete("/delete/:id", deleteBrand);
router.get("/list", getBrands);

export default router;

