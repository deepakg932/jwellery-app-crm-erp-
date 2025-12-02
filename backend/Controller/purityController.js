import Purity from '../Models/models/Purity.js';


export const createPurity = async (req, res) => {
  try {
    const purity = await Purity.create(req.body);
    console.log("Created Purity:", purity);
    return res.status(200).json({ success: true, purity });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};


export const getAllPurities = async (req, res) => {
  try {
    const purities = await Purity.find();
    console.log("Fetched Purities:", purities);
    return res.json({ success: true, purities });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
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
    const purity = await Purity.findByIdAndUpdate(req.params.id, req.body, { new: true });
    console.log("Updated Purity:", purity);
    if (!purity) 
      return res.status(404).json({ success: false, message: "Purity not found" });

    return res.json({ success: true, purity });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};


export const deletePurity = async (req, res) => {
  try {
    const purity = await Purity.findByIdAndDelete(req.params.id);
    console.log("Deleted Purity:", purity);
    if (!purity) 
      return res.status(404).json({ success: false, message: "Purity not found" });
    return res.json({ success: true, message: "Purity deleted" });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
