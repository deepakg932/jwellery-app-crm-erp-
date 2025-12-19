import Purity from "../Models/models/Purity.js"





export const createPurity = async (req, res) => {
  try {
    const { purity_name,  metal_type, percentage } = req.body;
    console.log(req.body, "Purity Data");

    if (!purity_name || !metal_type || !percentage) {
      return res.status(400).json({ success: false, message: "All fields are required"});
    }

   
    const baseUrl = `${req.protocol}://${req.headers.host}`;
    console.log(baseUrl, "Base URL");

    const purity = new Purity({
      purity_name,
      // stone_name,
      metal_type,
      percentage,
      image: req.file ? `/uploads/purity/${req.file.filename}` : null,
    });
console.log(purity, "New Purity");
    const saved = await purity.save();




    const fullImageUrl = saved.image ? `${baseUrl}${saved.image}` : null;
    console.log(fullImageUrl, "Full Image URL");

    return res.json({success: true,purity: {  ...saved._doc,  fullImageUrl}
    });

  } catch (err) {
    return res.status(500).json({success: false,error: err.message});
  }
};





export const getAllPurities= async (req, res) => {
  try {
    const purities = await Purity.find().sort({ createdAt: -1 });

    const baseUrl = `${req.protocol}://${req.headers.host}`;

    const purityList = purities.map(p => ({
      ...p._doc,
      fullImageUrl: p.image ? `${baseUrl}${p.image}` : null
    }));

    return res.json({success: true,purity: purityList});

  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};




export const getPurityById = async (req, res) => {
  try {
    const purity = await Purity.findById(req.params.id);
    console.log("Fetched Purity by ID:", purity);
    if (!purity)
      return res.status(404).json({ success: false, message: "Purity not found" });

    return res.json({ success: true, purity });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};






export const updatePurity = async (req, res) => {
  try {
    const { id } = req.params;
    const { purity_name, stone_name, metal_type, percentage } = req.body;

    const baseUrl = `${req.protocol}://${req.headers.host}`;

    let purity = await Purity.findById(id);
    if (!purity) {
      return res.status(404).json({
        success: false,
        message: "Purity not found"
      });
    }

  
    if (purity_name) purity.purity_name = purity_name;
    if (stone_name) purity.stone_name = stone_name;
    if (metal_type) purity.metal_type = metal_type;
    if (percentage) purity.percentage = percentage;

    
    if (req.file) {
      purity.image = `/uploads/purity/${req.file.filename}`;
    }

    const updatedPurity = await purity.save();

    const fullImageUrl = updatedPurity.image
      ? `${baseUrl}${updatedPurity.image}`
      : null;

    return res.json({
      success: true,
      message: "Purity updated successfully",
      purity: {
        ...updatedPurity._doc,
        fullImageUrl
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};




export const deletePurity = async (req, res) => {
  try {
    const purity = await Purity.findByIdAndDelete(req.params.id);
    if (!purity)
      return res.status(404).json({ success: false, message: "Purity not found" });

    return res.json({ success: true, message: "Purity deleted" ,purity});
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const MetalType = ['gold', 'silver', 'platinum'];


export const getPurityDashboardStats = async (req, res) => {
  try {
    // Total purities
    const totalPurities = await Purity.countDocuments();

    // Unique stones
    const uniqueStones = await Purity.distinct("stone_name");

    // Metal types count (ENUM)
    const metalTypeCount = MetalType.length;

    // Average purity
    const purities = await Purity.find().select("percentage");
    const totalPercentage = purities.reduce((acc, p) => acc + p.percentage, 0);
    const avgPurity = purities.length > 0
      ? Number((totalPercentage / purities.length).toFixed(1))
      : 0;

    return res.json({
      success: true,
      stats: {
        totalPurities,
        uniqueStoneCount: uniqueStones.length,
        metalTypeCount,
        avgPurity
      }
    });

  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
