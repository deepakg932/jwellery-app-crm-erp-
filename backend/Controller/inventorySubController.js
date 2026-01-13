import mongoose from "mongoose";
import InventorySubCategory from "../Models/models/inventorySubCategory.js"
import InventoryCategory from "../Models/models/InventoryCategory.js";



export const createSubCategory = async (req, res) => {
  try {
    const { name, description, category, status } = req.body;
    console.log("Request Body:", req.body);
    console.log("Category ID:", category);

    
    if (!name || !category) {
      return res.status(400).json({
        success: false,
        message: "Name and Category are required"
      });
    }

    
    if (!mongoose.Types.ObjectId.isValid(category)) {
      return res.status(400).json({success: false,message: "Invalid Category ID format"});
    }

  
    const categoryExists = await InventoryCategory.findById(category);
    console.log("Category Found:", categoryExists);
    
    if (!categoryExists) {
      return res.status(404).json({success: false,message: "Parent category not found" });
    }

    
    const existingSubCategory = await InventorySubCategory.findOne({
      name,
      category
    });
    
    console.log("Duplicate Check:", existingSubCategory);
    
    if (existingSubCategory) {
      return res.status(400).json({success: false,message: "SubCategory name already exists in this category"});
    }

   
    const subCategory = await InventorySubCategory.create({
      name,
      description,
      category,
      status: status !== undefined ? Boolean(status) : true
    });

    console.log("SubCategory Created:", subCategory);


    await InventoryCategory.findByIdAndUpdate(
      category,
      { $push: { subcategories: subCategory._id } },
      { new: true }
    );

    return res.status(201).json({success: true,message: "SubCategory created successfully",data: subCategory});

  } catch (err) {
    console.error("Create SubCategory Error:", err);
    console.error("Error Details:", err.message);
    console.error("Error Code:", err.code);

   

    return res.status(500).json({success: false,message: err.message || "Internal server error"});
  }
};

export const getAllSubCategories = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      category, 
      status 
    } = req.query;

    const query = {};

 
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
       
      ];
    }

    if (category) {
      query.category = category;
    }

    
    if (status !== undefined) {
      query.status = status === "true";
    }


    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    
    const total = await InventorySubCategory.countDocuments(query);

    
    const subCategories = await InventorySubCategory.find(query)
      .populate({
        path: "category",
        select: "name "
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const totalPages = Math.ceil(total / limitNum);
    console.log(totalPages,"kkk")

    return res.status(200).json({success: true,message: "SubCategories fetched successfully",data: {
        data: subCategories,
        totalDocs: total,
        limit: limitNum,
        totalPages: totalPages,
        page: pageNum,
        pagingCounter: (pageNum - 1) * limitNum + 1,
        hasPrevPage: pageNum > 1,
        hasNextPage: pageNum < totalPages,
        prevPage: pageNum > 1 ? pageNum - 1 : null,
        nextPage: pageNum < totalPages ? pageNum + 1 : null
      }
    });

  } catch (err) {
    console.error("Get SubCategories Error:", err);
    return res.status(500).json({success: false,message: err.message});
  }
};


export const getSubCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id,"id")

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({success: false,message: "Invalid SubCategory ID"});
    }

    const subCategory = await InventorySubCategory.findById(id)
      .populate({
        path: "category",
        select: "name description"
      });

    if (!subCategory) {
      return res.status(404).json({success: false,message: "SubCategory not found"});
    }

    return res.status(200).json({success: true,message: "SubCategory fetched successfully",data: subCategory});

  } catch (err) {
    console.error("Get SubCategory Error:", err);
    return res.status(500).json({success: false,message: err.message});
  }
};


export const updateSubCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, category, status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({success: false,message: "Invalid SubCategory ID"});
    }

  
    const existingSubCategory = await InventorySubCategory.findById(id);
    if (!existingSubCategory) {
      return res.status(404).json({success: false,message: "SubCategory not found"});
    }

    
    if (name && name !== existingSubCategory.name) {
      const duplicate = await InventorySubCategory.findOne({name,category: category || existingSubCategory.category});
      
      if (duplicate && duplicate._id.toString() !== id) {
        return res.status(400).json({success: false, message: "SubCategory name already exists in this category" });
      }
    }

 
    if (category && category !== existingSubCategory.category.toString()) {
      const categoryExists = await InventoryCategory.findById(category);
      if (!categoryExists) {
        return res.status(404).json({success: false,message: "New category not found"});
      }


      await InventoryCategory.findByIdAndUpdate(
        existingSubCategory.category,
        { $pull: { subcategories: id } }
      );

      await InventoryCategory.findByIdAndUpdate(
        category,
        { $push: { subcategories: id } }
      );
    }


    const updatedData = {
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(category && { category }),
      ...(status !== undefined && { status })
    };

    const updatedSubCategory = await InventorySubCategory.findByIdAndUpdate(
      id,
      updatedData,
      { new: true, runValidators: true }
    ).populate("category");

    return res.status(200).json({success: true,message: "SubCategory updated successfully",data: updatedSubCategory});

  } catch (err) {
    console.error("Update SubCategory Error:", err);
    
    if (err.code === 11000) {
      return res.status(400).json({success: false, message: "SubCategory code already exists"});
    }
    
    return res.status(500).json({success: false,message: err.message});
  }
};

export const deleteSubCategory = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id,"id")

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({success: false,message: "Invalid SubCategory ID" });
    }

  
    const subCategory = await InventorySubCategory.findById(id);
    if (!subCategory) {
      return res.status(404).json({ success: false, message: "SubCategory not found"});
    }

   
    await InventoryCategory.findByIdAndUpdate(
      subCategory.category,
      { $pull: { subcategories: id } }
    );

 
    let a8 = await InventorySubCategory.findByIdAndDelete(id);
    console.log(a8,"a8")

    return res.status(200).json({success: true,message: "SubCategory deleted successfully"});

  } catch (err) {
    console.error("Delete SubCategory Error:", err);
    return res.status(500).json({ success: false, message: err.message
    });
  }
};


export const getSubCategoriesByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { status = "true" } = req.query;

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({success: false,message: "Invalid Category ID"});
    }

  
    const category = await InventoryCategory.findById(categoryId);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found"});
    }

    const query = { 
      category: categoryId,
      status: status === "true" 
    };

    const subCategories = await InventorySubCategory.find(query)
      .sort({ name: 1 })
      .select("name  description status");

    return res.status(200).json({success: true,message: "SubCategories fetched successfully",data: subCategories,category: { name: category.name,
        category_code: category.category_code
      }
    });

  } catch (err) {
    console.error("Get SubCategories by Category Error:", err);
    return res.status(500).json({success: false,message: err.message });
  }
};


export const toggleSubCategoryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id,"id")

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({success: false,message: "Invalid SubCategory ID"});
    }

    const subCategory = await InventorySubCategory.findById(id);
    if (!subCategory) {
      return res.status(404).json({success: false,message: "SubCategory not found" });
    }

    subCategory.status = !subCategory.status;
    await subCategory.save();

    return res.status(200).json({success: true,message: `SubCategory ${subCategory.status ? 'activated' : 'deactivated'} successfully`,data: subCategory
    });

  } catch (err) {
    console.error("Toggle SubCategory Status Error:", err);
    return res.status(500).json({success: false,message: err.message });
  }
};