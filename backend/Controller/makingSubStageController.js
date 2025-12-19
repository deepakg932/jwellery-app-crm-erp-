import MakingSubStage from "../Models/models/submakingstages.js";


export const createSubStage = async (req, res) => {
  try {
    const substage = await MakingSubStage.create(req.body);
    console.log("Created Sub Stage:", substage);
    return res.json({ success: true, message: "Sub stage created", data: substage });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const getSubStages = async (req, res) => {
  try {
    const data = await MakingSubStage.find()
      .populate({
        path: "stage_id",
        select: "stage_name _id"
      })
      .sort({ order_no: 1 });
console.log(data,"data")
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};





export const updateSubStage = async (req, res) => {
  try {
    const updated = await MakingSubStage.findByIdAndUpdate(
      req.params.id, req.body, { new: true }
    );
    console.log("Updated Sub Stage:", updated);

    return res.json({ success: true, message: "Sub stage updated", data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};


export const deleteSubStage = async (req, res) => {
  try {
    await MakingSubStage.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: "Sub stage deleted" });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

