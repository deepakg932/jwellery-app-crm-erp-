import Brand from "../Models/models/brandModel.js"


export const createBrand = async (req, res) => {
  try {
    const { name } = req.body;

    let exists = await Brand.findOne({ name });
    console.log(exists,"exits")
    if (exists) {
      return res.status(400).json({status: false,message: "Brand already exists"});
    }

  
    const baseUrl = `${req.protocol}://${req.headers.host}`;
    console.log(baseUrl,"baseurl")

    const brand = await Brand.create({name,logo: req.file ? `/uploads/brands/${req.file.filename}` : null });
    console.log(brand,'brand')

  
    const fullLogoUrl = brand.logo ? `${baseUrl}${brand.logo}` : null;

    return res.status(200).json({status: true,message: "Brand created",brand: { ...brand._doc, fullLogoUrl}});

  } catch (err) {
    console.error(err);
   return res.status(500).json({ status: false, message: "Server error", error: err.message});
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
    const brands = await Brand.find().sort({ createdAt: -1 });
    console.log(brands,"all brands")

 
    const baseUrl = `${req.protocol}://${req.headers.host}`;
    console.log(baseUrl,"baseurl")

    const brandsWithFullUrl = brands.map(brand => ({
      ...brand._doc,
      fullLogoUrl: brand.logo ? `${baseUrl}${brand.logo}` : null
    }));
console.log(brandsWithFullUrl,"brands with full url")
    return res.status(200).json({status: true,brands: brandsWithFullUrl});

  } catch (err) {
    return res.status(500).json({status: false,message: "Server error",error: err.message});
  }
};



export const deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id,"delete by id")
    const brand = await Brand.findByIdAndDelete(id);
    console.log(brand,"deleted brand")

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
  
    const totalBrands = await Brand.countDocuments();

  
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
