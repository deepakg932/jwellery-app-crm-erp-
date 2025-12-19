import Wastage from "../Models/models/wastageModel.js";

export const createWastage = async (req, res) => {
  try {
    const { wastage_type } = req.body;
    const existingWastage = await Wastage.findOne({ wastage_type, status: "active" });
    console.log(existingWastage,"existingWastage");
    if (existingWastage) {
      return res.status(400).json({success: false,message: "Wastage type already exists"});
    }
    const wastage = await Wastage.create({wastage_type});
    console.log(wastage,"newWastage");
    return res.status(201).json({success: true,message: "Wastage created successfully",data: wastage});
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getWastages = async (req, res) => {
  try {
    const wastages = await Wastage.find({ status: "active" }).sort({ wastage_type: 1 });
    console.log(wastages,"allWastages");
    return res.json({ success: true, data: wastages });
  }
    catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateWastage = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id,"wastageId");
    const { wastage_type } = req.body;
    console.log(wastage_type,"wastageType");
    const wastage = await Wastage.findById(id);
    console.log(wastage,"wastageToUpdate");
    if (!wastage) {
      return res.status(404).json({ success: false, message: "Wastage not found" });
    }
    wastage.wastage_type = wastage_type;
    await wastage.save();
    return res.json({success: true,message: "Wastage updated successfully",data: wastage});
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteWastage = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id,"wastageIdToDelete");
    const wastage = await Wastage.findById(id);
    if (!wastage) {
      return res.status(404).json({ success: false, message: "Wastage not found"});
    }
    const a = await Wastage.findByIdAndDelete(id);
    console.log(a,"deletedWastage");

    return res.json({success: true,message: "Wastage deleted successfully"});
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};