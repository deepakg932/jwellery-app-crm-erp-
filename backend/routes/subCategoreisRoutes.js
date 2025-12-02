import express  from 'express';
import { createSubcategory, updateSubcategory,getSubcategoriesByCategory } from '../Controller/subcategoryController.js';
const router = express.Router();

router.post("/createsubcategories",createSubcategory)
router.put("/updatesubcategories/:id",updateSubcategory)
router.get("/getcategorysubcategories/:categoryId",getSubcategoriesByCategory)
export default router;
