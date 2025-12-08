import Hallmark from "../models/Hallmark.js";
import { MetalType } from "../models/_shared.js"


export const getPurityPercentages = async (req, res) => {
  try {
    const purities = await Purity.find().select("percentage purity_name");

    const percentages = purities.map((p) => ({
      purity_name: p.purity_name,
      percentage: p.percentage,
      purity_id: p._id
    }));

    return res.json({ success: true, percentages });

  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};



export const getHallmarkDashboardStats = async (req, res) => {
  try {
    // Total hallmarks
    const totalHallmarks = await Hallmark.countDocuments();

    // Active hallmarks (if status exists)
    let activeHallmarks = totalHallmarks; // default
    if ("status" in Hallmark.schema.paths) {
      activeHallmarks = await Hallmark.countDocuments({ status: true });
    }

    // Unique metals
    const uniqueMetalsArr = await Hallmark.distinct("metal_type");
    const uniqueMetals = uniqueMetalsArr.length;

    // Average purity
    const hallmarks = await Hallmark.find().select("percentage");
    const totalPercentage = hallmarks.reduce((acc, h) => acc + h.percentage, 0);
    const avgPurity =
      hallmarks.length > 0
        ? Number((totalPercentage / hallmarks.length).toFixed(1))
        : 0;

    return res.json({
      success: true,
      stats: {
        totalHallmarks,
        activeHallmarks,
        uniqueMetals,
        avgPurity
      }
    });

  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};



export const updateHallmark = async (req, res) => {
  try {
    const { name, purity_id, mark_id, percentage, metal_type, description } = req.body;

    let hallmark = await Hallmark.findById(req.params.id);
    if (!hallmark) {
      return res.status(404).json({ success: false, message: "Hallmark not found" });
    }

    // Required Fields Validation
    if (!name || !purity_id || !mark_id || !percentage || !metal_type) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be filled",
      });
    }

    // Update fields one-by-one
    hallmark.name = name;
    hallmark.purity_id = purity_id;
    hallmark.mark_id = mark_id;
    hallmark.percentage = percentage;
    hallmark.metal_type = metal_type;
    hallmark.description = description || "";

    const updated = await hallmark.save();

    return res.json({
      success: true,
      message: "Hallmark updated successfully",
      hallmark: updated
    });

  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};


export const deleteHallmark = async (req, res) => {
  try {
    const hallmark = await Hallmark.findByIdAndDelete(req.params.id);

    if (!hallmark)
      return res.status(404).json({ success: false, message: "Hallmark not found" });

    return res.json({ success: true, message: "Hallmark deleted" });

  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};


export const getHallmarkById = async (req, res) => {
  try {
    const hallmark = await Hallmark.findById(req.params.id)
      .populate("purity_id")
      .populate("mark_id");

    if (!hallmark)
      return res.status(404).json({ success: false, message: "Hallmark not found" });

    return res.json({ success: true, hallmark });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};


export const getAllHallmarks = async (req, res) => {
  try {
    const data = await Hallmark.find()
      .populate("purity_id")
      .populate("mark_id");

    return res.json({ success: true, hallmarks: data });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};




export const createHallmark = async (req, res) => {
  try {
    const { name, purity_id, mark_id, percentage, metal_type, description } = req.body;

    if (!name || !purity_id || !mark_id || !percentage || !metal_type) {
      return res.status(400).json({ success: false, message: "All required fields must be filled" });
    }

    const hallmark = await Hallmark.create({
      name,
      purity_id,
      mark_id,
      percentage,
      metal_type,
      description: description || ""
    });

    return res.status(200).json({ success: true, hallmark });

  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

