import Stone from "../Models/models/Stone.js";


export const createStone = async (req, res) => {
  try {
    const { stone_purity, stone_type, stone_price, stone_name } = req.body;
    console.log(req.body,"req.body")

    if (!stone_purity || !stone_type || !stone_name || !stone_price) {
      return res.status(400).json({  success: false,  message: "All fields are required"});
    }

    const exists = await Stone.findOne({ stone_name });
    if (exists) {
      return res.status(400).json({ success: false, message: "Stone already exists"});
    }

    const baseUrl = `${req.protocol}://${req.headers.host}`;

    const stone = await Stone.create({
      stone_purity,
      stone_type,
      stone_price,
      stone_name,
      stone_image: req.file ? `/uploads/stone/${req.file.filename}` : null
    });

    const fullImageUrl = stone.stone_image ? `${baseUrl}${stone.stone_image}` : null;

    return res.status(200).json({success: true,message: "Stone created successfully",stone: { ...stone._doc, fullImageUrl }});

  } catch (err) {
    return res.status(500).json({success: false,error: err.message});
  }
};



export const getAllStoneTypes = async (req, res) => {
  try {
    const stones = await Stone.find().sort({ createdAt: -1 });
    console.log(stones,"stones")

    const baseUrl = `${req.protocol}://${req.headers.host}`;

    const finalData = stones.map(s => ({
      ...s._doc,
      fullImageUrl: s.stone_image ? `${baseUrl}${s.stone_image}` : null
    }));

    return res.status(200).json({
      success: true,
      stones: finalData
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
};



export const getStoneTypeById = async (req, res) => {
  try {
    const stone = await Stone.findById(req.params.id);
    console.log(stone,"stone")

    if (!stone) {
      return res.status(404).json({ success: false, message: "Stone not found" });
    }

    const baseUrl = `${req.protocol}://${req.headers.host}`;
    const fullImageUrl = stone.stone_image ? `${baseUrl}${stone.stone_image}` : null;

    return res.status(200).json({
      success: true,
      stone: { ...stone._doc, fullImageUrl }
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
};


export const updateStoneType = async (req, res) => {
  try {
    const stone = await Stone.findById(req.params.id);
    console.log(stone,'stone')

    if (!stone) {
      return res.status(404).json({ success: false, message: "Stone not found" });
    }

    const { stone_purity, stone_type, stone_price, stone_name } = req.body;
    const baseUrl = `${req.protocol}://${req.headers.host}`;

    if (stone_name) stone.stone_name = stone_name;
    if (stone_purity) stone.stone_purity = stone_purity;
    if (stone_type) stone.stone_type = stone_type;
    if (stone_price) stone.stone_price = stone_price;

    if (req.file) {
      stone.stone_image = `/uploads/stones/${req.file.filename}`;
    }

    const updatedStone = await stone.save();

    const fullImageUrl = updatedStone.stone_image
      ? `${baseUrl}${updatedStone.stone_image}`
      : null;

    return res.status(200).json({success: true, message: "Stone updated successfully", stone: { ...updatedStone._doc, fullImageUrl } });

  } catch (err) {
    return res.status(500).json({ success: false,error: err.message});
  }
};


export const deleteStoneType = async (req, res) => {
  try {
    const result = await Stone.findByIdAndDelete(req.params.id);
    console.log(result,'result')

    if (!result) {
      return res.status(404).json({success: false,message: "Stone not found"});
    }

    return res.status(200).json({success: true,message: "Stone deleted successfully"});

  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};



