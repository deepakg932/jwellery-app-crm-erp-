import stonePurityModel from "../Models/models/stonePurityModel.js";





export const createStonePurity = async (req, res) => {
  try {
    const { stone_purity,  stone_type, percentage } = req.body;
    console.log(req.body, "Purity Data");

    if (!stone_purity || !stone_type || !percentage) {
      return res.status(400).json({ success: false, message: "All fields are required"});
    }

   

    const purity = new stonePurityModel({
      stone_purity,
      // stone_name,`
      stone_type,
      percentage,
      
    });
console.log(purity, "New StonePurity");
    const saved = await purity.save();





    return res.json({success: true,purity: {  ...saved._doc}
    });

  } catch (err) {
    return res.status(500).json({success: false,error: err.message});
  }
};





export const getStonePurities= async (req, res) => {
  try {
    console.log("lklklklklklklklklklklk")
    const purities = await stonePurityModel.find().sort({ createdAt: -1 });
    console.log(purities, "Fetched Purities");



    const purityList = purities.map(p => ({
      ...p._doc,

    }));
    console.log(purityList, "Purity List");

    return res.json({success: true,purity: purityList});

  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};




export const getPurityById = async (req, res) => {
  try {
    const purity = await stonePurityModel.findById(req.params.id);
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
    const { stone_purity, stone_name, metal_type, percentage } = req.body;

    const baseUrl = `${req.protocol}://${req.headers.host}`;

    let purity = await stonePurityModel.findById(id);
    if (!purity) {
      return res.status(404).json({
        success: false,
        message: "Purity not found"
      });
    }

  
    if (stone_purity) purity.stone_purity = stone_purity;
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
    const purity = await stonePurityModel.findByIdAndDelete(req.params.id);
    if (!purity)
      return res.status(404).json({ success: false, message: "Purity not found" });

    return res.json({ success: true, message: "Purity deleted" ,purity});
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const MetalType = ['gold', 'silver', 'platinum'];


