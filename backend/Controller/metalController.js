import { MetalType } from "../Models/models/_shared.js";
import Metal from "../Models/models/MetalTypeModel.js"

export const createMetal = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: "Metal name is required" });
    }

    const metal = new Metal({
      name,
      image: req.file ? "/uploads/metal/" + req.file.filename : null
    });

    const saved = await metal.save();

    return res.json({ success: true, metal: saved });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};






export const getMetalTypes = async (req, res) => {
  try {
    return res.json({ success: true, metal_types: MetalType });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};



export const getMetalsWithPagination = async (req, res) => {
  try {
    let { page = 1, limit = 10, search = "" } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    // Search query
    const searchQuery = search
      ? { name: { $regex: search, $options: "i" } }
      : {};

    // Get total count
    const total = await Metal.countDocuments(searchQuery);

    // Get paginated data
    const metals = await Metal.find(searchQuery)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      metals
    });

  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};


export const updateMetal = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    let metal = await Metal.findById(id);
    if (!metal) {
      return res.status(404).json({ success: false, message: "Metal not found" });
    }

    if (name) metal.name = name;

    
    if (req.file) {
      metal.image = "/metalUpload/metal/" + req.file.filename;
    }

    const updatedMetal = await metal.save();

    return res.json({success: true,message: "Metal updated successfully",metal: updatedMetal});

  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};



export const deleteMetal = async (req, res) => {
  try {
    const { id } = req.params;

    const metal = await Metal.findByIdAndDelete(id);

    if (!metal) {
      return res.status(404).json({ success: false, message: "Metal not found" });
    }

    return res.json({ success: true, message: "Metal deleted successfully" });

  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
