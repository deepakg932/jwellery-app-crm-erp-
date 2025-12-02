
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


const router = express.Router();

router.get('/', getCategories);



router.post('/category', createCategory);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);
router.get('/:id', getCategoryById);
router.get('/:id/with-subcategories', getCategoryWithSubcategories);
router.get('/with-subcategories/all', getCategoriesWithSubcategories);
router.get('/count', getCategoriesCount);
router.get('/pagination', getCategoriesWithPagination);
router.get('/search', searchCategoriesByName);

export default router;