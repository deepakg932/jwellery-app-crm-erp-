import MakingStage from "../Models/models/MakingStage.js"

export const createStage = async (req, res) => {
  console.log("jjjj")
  try {
    const stage = await MakingStage.create(req.body);
    console.log("Created Stage:", stage);
    return res.json({ success: true, message: "Stage created", data: stage });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};


export const getStages = async (req, res) => {
  try {
    const stages = await MakingStage.find().sort({ order_no: 1 });
    console.log("Fetched Stages:", stages);
    return res.json({ success: true, data: stages });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};


export const getStageById = async (req, res) => {
  try {
    const stage = await MakingStage.findById(req.params.id);
    console.log("Fetched Stage by ID:", stage);
    return res.json({ success: true, data: stage });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};


export const updateStage = async (req, res) => {
  try {
     const {stage_name}= req.body;
    const stage = await MakingStage.findByIdAndUpdate(
      req.params.id, { stage_name }, { new: true }
    );
    console.log("Updated Stage:", stage);
    return res.json({ success: true, message: "Stage updated", data: stage });
  }
  catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
    

export const deleteStage = async (req, res) => {
  try {
    await MakingStage.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: "Stage deleted" });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
