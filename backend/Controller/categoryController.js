// categoryController.js
import Category from "../Models/models/Category.js";

export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().select("name _id metal_type");
    console.log(categories, "get categories");
    return res.json({ success: true, categories });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, metal_type } = req.body;
    console.log(req.body, "request body");

    // if (!name || !metal_type) {
    //   return res
    //     .status(400)
    //     .json({ success: false, message: "Name & Metal type are required" });
    // }
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    console.log("baseUrl", baseUrl);
    const newCategory = new Category({
      name,
      metal_type,
      image: req.file ? `/uploads/category/${req.file.filename}` : null,
    });
    console.log("newCategory", newCategory);
    const savedCategory = await newCategory.save();
    console.log(savedCategory, "savedCategory");

    const fullImageUrl = savedCategory.image
      ? `${baseUrl}${savedCategory.image}`
      : null;
    console.log("fullImageUrl", fullImageUrl);

    return res.json({
      success: true,
      category: {
        ...savedCategory._doc,
        fullImageUrl,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id, "category id to update");
     const { name, metal_type } = req.body;

    console.log(req.body, "update category body");


    const baseUrl = `${req.protocol}://${req.headers.host}`;
    console.log("baseUrl", baseUrl);

    let category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" }); 
    }

    if (name) 
      category.name = name;
    if (metal_type) 
      category.metal_type = metal_type;

    if (req.file) {
      category.image = "/uploads/category/" + req.file.filename;
    }

  
    const updatedCategory = await category.save();

  
    const fullImageUrl = updatedCategory.image
      ? `${baseUrl}${updatedCategory.image}`
      : null;
      console.log(fullImageUrl,"fullImageUrl")

    return res.json({ success: true, message: "Category updated successfully",category: {   ...updatedCategory._doc,   fullImageUrl  },
    });

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
    const category = await Category.findById(id).populate("subcategories");
    return res.json({ success: true, category });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
export const getCategoriesWithSubcategories = async (req, res) => {
  try {
    const categories = await Category.find().populate("subcategories");
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
    const categories = await Category.find({ name: new RegExp(name, "i") });
    return res.json({ success: true, categories });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
