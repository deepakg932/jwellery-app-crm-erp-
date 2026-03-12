import DesignStage from "../Models/models/DesignStage.js";


export const createDesignStage = async (req, res) => {
  try {
    const { stage_name, description, order, is_active } = req.body;

    if (!stage_name || order === undefined) {
      return res.status(400).json({
        success: false,
        message: "Stage name and order are required",
      });
    }

    const image =
      req.file ? `/uploads/designStages/${req.file.filename}` : null;

      const count = await DesignStage.countDocuments();

    const stage = await DesignStage.create({
         stage_code: `STG${String(count + 1).padStart(3, "0")}`,
      stage_name,
      description,
      order,
      image,
      is_active: is_active ?? true,
    });

    return res.status(201).json({
      success: true,
      message: "Design stage created successfully",
      data: stage,
    });
  } catch (error) {
    console.error("Create Design Stage Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const getDesignStages = async (req, res) => {
  try {
    const stages = await DesignStage.find()
      .sort({ order: 1 });

    return res.json({
      success: true,
      count: stages.length,
      data: stages,
    });
  } catch (error) {
    console.error("Get Design Stages Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const updateDesignStage = async (req, res) => {
  try {
    const { id } = req.params;
    const { stage_name, description, order, is_active } = req.body;

    const stage = await DesignStage.findById(id);
    if (!stage) {
      return res.status(404).json({
        success: false,
        message: "Design stage not found",
      });
    }

    if (req.file) {
      stage.image = `/uploads/designStages/${req.file.filename}`;
    }

    stage.stage_name = stage_name ?? stage.stage_name;
    stage.description = description ?? stage.description;
    stage.order = order ?? stage.order;
    stage.is_active = is_active ?? stage.is_active;

    await stage.save();

    return res.json({
      success: true,
      message: "Design stage updated successfully",
      data: stage,
    });
  } catch (error) {
    console.error("Update Design Stage Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const deleteDesignStage = async (req, res) => {
  try {
    const { id } = req.params;

    const stage = await DesignStage.findById(id);
    if (!stage) {
      return res.status(404).json({
        success: false,
        message: "Design stage not found",
      });
    }

    await DesignStage.findByIdAndDelete(id);

    return res.json({
      success: true,
      message: "Design stage deleted successfully",
    });
  } catch (error) {
    console.error("Delete Design Stage Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
