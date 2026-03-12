import costmaster from "../models/costmasterModel.js";
import CostName from "../models/CostName.js";

export const createCostMaster = async (req, res) => {
  try {
    const cost = await CostName.create(req.body);
    console.log("Created Cost Master:", cost);
    return res.json({
      success: true,
      message: "Cost Master created",
      data: cost,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const updateCostMaster = async (req, res) => {
  try {
    const updated = await CostName.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    console.log("Updated Cost Master:", updated);

    return res.json({
      success: true,
      message: "Cost Master updated",
      data: updated,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const deleteCostMaster = async (req, res) => {
  try {
    await CostName.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: "Cost Master deleted" });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const createCostType = async (req, res) => {
  try {
    const { cost_type, cost_name_id, sub_stage_id } = req.body;

    if (!cost_type) {
      return res
        .status(400)
        .json({ success: false, message: "cost_type required" });
    }

    // const exists = await costmaster.findOne({ cost_type });
    // if (exists) {
    //   return res.json({ success: false, message: "Cost Type already exists" });
    // }

    const exists = await costmaster.findOne({
      cost_type,
      cost_name_id,
      sub_stage_id,
    });
    

    const newType = await costmaster.create({
      cost_type,
      cost_name_id,
      sub_stage_id,
    });

  

    const populated = await costmaster
      .findById(newType._id)
      .populate("cost_name_id")
      .populate("sub_stage_id", "sub_stage_id");

    return res.json({
      success: true,
      message: "Cost Type created",
      data: populated,
      
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const getCostTypes = async (req, res) => {
  try {
    const list = await costmaster
      .find()
     
      .populate("cost_name_id", "cost_name")
 
      .sort({ createdAt: -1 });
    console.log(list, "list");
    return res.json({ success: true, data: list });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const getCostNames = async (req, res) => {
  try {
    const names = await CostName.find().sort({ createdAt: -1 });
    return res.json({ success: true, data: names });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const getCostMasters = async (req, res) => {
  try {
    const costs = await CostName.find()
      .populate({
        path: "sub_stage_id",
        select: "sub_stage_name stage_id",
      })
      .populate({
        path: "sub_stage_id.stage_id",
        select: "stage_name",
      })
      .sort({ createdAt: -1 });

    return res.json({ success: true, data: costs });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const updateCostType = async (req, res) => {
  try {
    const { cost_type, cost_name_id, sub_stage_name } = req.body;
    const updated = await costmaster.findByIdAndUpdate(
      req.params.id,
      { cost_type, cost_name_id, sub_stage_name },
      { new: true },
    );
    console.log("Updated Cost Type:", updated);
    return res.json({
      success: true,
      message: "Cost Type updated",
      data: updated,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const deleteCostType = async (req, res) => {
  try {
    await costmaster.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: "Cost Type deleted" });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
