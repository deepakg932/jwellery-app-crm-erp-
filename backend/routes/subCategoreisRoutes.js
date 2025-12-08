import express  from 'express';
import { createSubcategory, updateSubcategory,getSubcategoriesByCategory } from '../Controller/subcategoryController.js';
const router = express.Router();

import subCategoryUpload from "../middleware/subcategoryUpload.js"

router.post("/createsubcategories",subCategoryUpload.single('image'),createSubcategory)
router.put("/updatesubcategories/:id",updateSubcategory)
router.get("/getcategorysubcategories/:categoryId",getSubcategoriesByCategory)
export default router;
