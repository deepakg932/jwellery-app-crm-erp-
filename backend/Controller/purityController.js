import Purity from "../Models/models/Purity";


// export const createPurity = async (req, res) => {
//   try {
//     const purity = await Purity.create(req.body);
//     console.log("Created Purity:", purity);
//     return res.status(200).json({ success: true, purity });
//   } catch (err) {
//     return res.status(500).json({ success: false, error: err.message });
//   }
// };



export const createPurity = async (req, res) => {
  try {
    const { purity_name, stone_name, metal_type, percentage } = req.body;

    if (!purity_name || !stone_name || !metal_type || !percentage) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const purity = new Purity({
      purity_name,
      stone_name,
      metal_type,
      percentage,
      image: req.file ? "/uploads/purity/" + req.file.filename : null,
    });

    const saved = await purity.save();

    return res.json({ success: true, purity: saved });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// export const getAllPurities = async (req, res) => {
//   try {
//     const purities = await Purity.find();
//     console.log("Fetched Purities:", purities);
//     return res.json({ success: true, purities });
//   } catch (err) {
//     return res.status(500).json({ success: false, error: err.message });
//   }
// };



export const getAllPurities = async (req, res) => {
  try {
    const purities = await Purity.find().sort({ createdAt: -1 });
    return res.json({ success: true, purities });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};


// export const getPurityById = async (req, res) => {
//   try {
//     const purity = await Purity.findById(req.params.id);
//     console.log("Fetched Purity by ID:", purity);
//     if (!purity) 
//       return res.status(404).json({ success: false, message: "Purity not found" });

//     return res.json({ success: true, purity });
//   } catch (err) {
//     return res.status(500).json({ success: false, error: err.message });
//   }
// };

export const getPurityById = async (req, res) => {
  try {
    const purity = await Purity.findById(req.params.id);
    if (!purity)
      return res.status(404).json({ success: false, message: "Purity not found" });

    return res.json({ success: true, purity });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};



// export const updatePurity = async (req, res) => {
//   try {
//     const purity = await Purity.findByIdAndUpdate(req.params.id, req.body, { new: true });
//     console.log("Updated Purity:", purity);
//     if (!purity) 
//       return res.status(404).json({ success: false, message: "Purity not found" });

//     return res.json({ success: true, purity });
//   } catch (err) {
//     return res.status(500).json({ success: false, error: err.message });
//   }
// };


export const updatePurity = async (req, res) => {
  try {
    const { purity_name, stone_name, metal_type, percentage } = req.body;

    let purity = await Purity.findById(req.params.id);
    if (!purity)
      return res.status(404).json({ success: false, message: "Purity not found" });

    if (purity_name) purity.purity_name = purity_name;
    if (stone_name) purity.stone_name = stone_name;
    if (metal_type) purity.metal_type = metal_type;
    if (percentage) purity.percentage = percentage;

    if (req.file) {
      purity.image = "/uploads/purity/" + req.file.filename;
    }

    const updated = await purity.save();

    return res.json({ success: true, purity: updated });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};



export const deletePurity = async (req, res) => {
  try {
    const purity = await Purity.findByIdAndDelete(req.params.id);
    if (!purity)
      return res.status(404).json({ success: false, message: "Purity not found" });

    return res.json({ success: true, message: "Purity deleted" });
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
