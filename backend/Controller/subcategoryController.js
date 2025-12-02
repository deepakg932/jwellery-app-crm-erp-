
import Subcategory from '../Models/models/Subcategory.js';

export const getSubcategoriesByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    console.log(categoryId,"categoryid");
    const subcategories = await Subcategory.find({ category_id: categoryId });
    console.log(subcategories,"castyegory");
    return res.json({ success: true, subcategories });
  } catch (err) {
   return res.status(500).json({ success: false, message: err.message });
  }
};
export const createSubcategory = async (req, res) => {
    try {
        const newSubcategory = new Subcategory(req.body);
        console.log(newSubcategory, "new subcategory");
        const savedSubcategory = await newSubcategory.save();
        return res.json({ success: true, subcategory: savedSubcategory });
    } catch (err) {
       return res.status(500).json({ success: false, message: err.message });
    }
};
export const updateSubcategory = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(id, "Subcategory ID to update");
        const updatedSubcategory = await Subcategory.findByIdAndUpdate(id, req.body, { new: true });
        return res.json({ success: true, subcategory: updatedSubcategory });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
export const deleteSubcategory = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(id, "Subcategory ID to delete");
        const deletedSubcategory = await Subcategory.findByIdAndDelete(id);
        return res.json({ success: true, subcategory: deletedSubcategory });
    } catch (err) {
       return res.status(500).json({ success: false, message: err.message });
    }
};
export const getSubcategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(id, "Subcategory ID to get");
        const subcategory = await Subcategory.findById(id);
        return res.json({ success: true, subcategory });
    } catch (err) {
       return res.status(500).json({ success: false, message: err.message });
    }
};
export const getSubcategoriesCount = async (req, res) => {
    try {
        const count = await Subcategory.countDocuments();
        console.log("Total Subcategories Count:", count);
        return res.json({ success: true, count });
    } catch (err) {
      return  res.status(500).json({ success: false, message: err.message });
    }
};

export const getSubcategoriesWithPagination = async (req, res) => {
    try {
        let { page = 1, limit = 10 } = req.query;
        page = parseInt(page);
        limit = parseInt(limit);
        const subcategories = await Subcategory.find()
            .skip((page - 1) * limit)
            .limit(limit);
       return res.json({ success: true, subcategories });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
export const searchSubcategoriesByName = async (req, res) => {
    try {
        const { name } = req.query;
        console.log(name, "Search name");
        const subcategories = await Subcategory.find({ name: { $regex: name, $options: 'i' } });
     return   res.json({ success: true, subcategories });
    } catch (err) {
       return res.status(500).json({ success: false, message: err.message });
    }
};