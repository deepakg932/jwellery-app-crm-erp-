
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
    const { name, category_id } = req.body;

    if (!name || !category_id) {
      return res.status(400).json({success: false,message: "Name and Parent Category are required"});
    }

    const baseUrl = `${req.protocol}://${req.headers.host}`;

    const newSubcategory = new Subcategory({
      name,
      category_id,
      image: req.file ? `/uploads/subcategory/${req.file.filename}` : null,
    });
    console.log(newSubcategory,"newsubcategory");

    const savedSubcategory = await newSubcategory.save();


    const fullImageUrl = savedSubcategory.image
      ? `${baseUrl}${savedSubcategory.image}`
      : null;

    return res.json({ success: true, subcategory: {   ...savedSubcategory._doc,   fullImageUrl
      }
    });

  } catch (err) {
    return res.status(500).json({ success: false, message: err.message});
  }
};





export const updateSubcategory = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id, "Subcategory ID to update");
    const { name, category_id } = req.body;

 
    const baseUrl = `${req.protocol}://${req.headers.host}`;
    console.log(baseUrl,"baseurl");

    let subcategory = await Subcategory.findById(id);
    if (!subcategory) {
      return res.status(404).json({success: false,message: "Subcategory not found"});
    }

  
    if (name) subcategory.name = name;
    if (category_id) subcategory.category_id = category_id;

    
    if (req.file) {
      subcategory.image = `/uploads/subcategory/${req.file.filename}`;
    }

    
    const updatedSubcategory = await subcategory.save();

    
    const fullImageUrl = updatedSubcategory.image
      ? `${baseUrl}${updatedSubcategory.image}`
      : null;

    return res.json({success: true,message: "Subcategory updated successfully",subcategory: {...updatedSubcategory._doc,fullImageUrl}
    });

  } catch (err) {
    return res.status(500).json({ success: false, message: err.message});
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

export const getAllSubcategories = async (req, res) => {
  try {
    const subcategories = await Subcategory.find();
    console.log(subcategories,"all subcategories");

    const baseUrl = `${req.protocol}://${req.headers.host}`;
    console.log(baseUrl,"baseurl");

    const subcategoriesWithFullUrl = subcategories.map(sub => ({
      ...sub._doc,
      fullImageUrl: sub.image ? `${baseUrl}${sub.image}` : null
    }));

    return res.json({success: true,subcategories: subcategoriesWithFullUrl
    });

  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
