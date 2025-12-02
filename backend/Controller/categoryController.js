// categoryController.js
import Category from '../Models/models/Category.js';

export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
   return res.json({ success: true, categories });
  } catch (err) {
  return  res.status(500).json({ success: false, message: err.message });
  }
};
export const createCategory = async (req, res) => {
    try {
        const newCategory = new Category(req.body);
        const savedCategory = await newCategory.save();
       return res.json({ success: true, category: savedCategory });
    } catch (err) {
         return res.status(500).json({ success: false, message: err.message });
    }
};
export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedCategory = await Category.findByIdAndUpdate(id, req.body, { new: true });
        return res.json({ success: true, category: updatedCategory });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(id, "category id to delete");
        const deletedCategory = await Category.findByIdAndDelete(id);
        return res.json({ success: true, category: deletedCategory });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
export const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(id, "category id to get");
        const category = await Category.findById(id);
        return res.json({ success: true, category });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
export const getCategoryWithSubcategories = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(id, "category id to get with subcategories");
        const category = await Category.findById(id).populate('subcategories');
        return res.json({ success: true, category });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
export const getCategoriesWithSubcategories = async (req, res) => {
    try {
        const categories = await Category.find().populate('subcategories');
        return res.json({ success: true, categories });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
export const getCategoriesCount = async (req, res) => {
    try {
        const count = await Category.countDocuments();
        return res.json({ success: true, count });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
export const getCategoriesWithPagination = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const categories = await Category.find()
            .skip((page - 1) * limit)
            .limit(parseInt(limit));
        return res.json({ success: true, categories });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }

};
export const searchCategoriesByName = async (req, res) => {
    try {
        const { name } = req.query;
        const categories = await Category.find({ name: new RegExp(name, 'i') });
        return res.json({ success: true, categories });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};