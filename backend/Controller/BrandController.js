import Brand from "../Models/models/brandModel.js"


export const createBrand = async (req, res) => {
  try {
    const { name } = req.body;
    console.log(name,"name")

    let exists = await Brand.findOne({ name });
    console.log(exists,"exits")
    if (exists) {
      return res.status(400).json({ status: false, message: "Brand already exists" });
    }

    const brand = await Brand.create({name,logo: req.file ? "/uploads/brands/" + req.file.filename : null,
    });
    console.log(brand,"brand")

    return res.status(200).json({ status: true, message: "Brand created", brand });

  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: "Server error", error: err.message });
  }
};


export const updateBrand = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id,"idd")
    const updateData = { ...req.body };

    if (req.file) {
      updateData.logo = "/uploads/brands/" + req.file.filename;
    }

    const brand = await Brand.findByIdAndUpdate(id, updateData, { new: true });
    console.log(brand,"brand for update")

    if (!brand) {
      return res.status(404).json({ status: false, message: "Brand not found" });
    }

    return res.status(200).json({ status: true, message: "Brand updated", brand });

  } catch (err) {
    res.status(500).json({ status: false, message: "Server error", error: err.message });
  }
};

export const getBrands = async (req, res) => {
  try {
    const brands = await Brand.find().sort({ created_at: -1 });
    console.log(brands,"get brands")
    return res.status(200).json({ status: true, brands });
  } catch (err) {
    return res.status(500).json({ status: false, message: "Server error" });
  }
};


export const deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id,"delete by id")
    const brand = await Brand.findByIdAndDelete(id);

    if (!brand) {
      return res.status(404).json({ status: false, message: "Brand not found" });
    }

    return res.status(200).json({ status: true, message: "Brand deleted" });

  } catch (err) {
    return res.status(500).json({ status: false, message: "Server error" });
  }
};




export const getBrandDashboardStats = async (req, res) => {
  try {
    // Total brands
    const totalBrands = await Brand.countDocuments();

    // Active brands (status = true)
    const activeBrands = await Brand.countDocuments({ status: true });

    // Brands that have a logo
    const brandsWithLogos = await Brand.countDocuments({
      logo: { $ne: null, $ne: "" }
    });

    return res.json({
      success: true,
      stats: {
        totalBrands,
        activeBrands,
        brandsWithLogos
      }
    });

  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
