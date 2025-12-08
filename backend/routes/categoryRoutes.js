
import express from 'express';
import {
  getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
    getCategoryWithSubcategories,
    getCategoriesWithSubcategories,
    getCategoriesCount,
    getCategoriesWithPagination,
    searchCategoriesByName
} from '../Controller/categoryController.js';
import categoryUpload from "../middleware/categoryUpload.js"


const router = express.Router();

router.get('/', getCategories);



router.post('/category', categoryUpload.single('image'), createCategory);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);
router.get('/:id', getCategoryById);
router.get('/:id/with-subcategories', getCategoryWithSubcategories);
router.get('/with-subcategories/all', getCategoriesWithSubcategories);
router.get('/count', getCategoriesCount);
router.get('/pagination', getCategoriesWithPagination);
router.get('/search', searchCategoriesByName);
router.get("/categories",getCategories)

export default router;