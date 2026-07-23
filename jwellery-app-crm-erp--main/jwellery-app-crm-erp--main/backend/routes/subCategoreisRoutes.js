import express  from 'express';
import { createSubcategory, updateSubcategory,getSubcategoriesByCategory, deleteSubcategory,getAllSubcategories } from '../Controller/subcategoryController.js';
const router = express.Router();

import subCategoryUpload from "../middleware/subcategoryUpload.js"

router.post("/createsubcategories",subCategoryUpload.single('image'),createSubcategory)
router.put("/updatesubcategories/:id",subCategoryUpload.single('image'),updateSubcategory)
router.get("/getcategorysubcategories/:categoryId",getSubcategoriesByCategory)
router.delete("/deletesubcategories/:id",deleteSubcategory)
router.get("/getallsubcategories",getAllSubcategories)
export default router;
