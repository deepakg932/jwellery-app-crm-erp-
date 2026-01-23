
import JobCardStage from "../Models/models/JobCardStage.js";
import DesignStage from "../Models/models/DesignStage.js";

export const getJobStages = async (req, res) => {
  try {
    const { jobId } = req.params;

    const stages = await JobCardStage.find({ job_card_id: jobId })
      .populate("stage_id", "stage_name image order")
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      data: stages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};




export const completeStage = async (req, res) => {
  try {
    const { jobId, stageId } = req.params;
    const { remarks, images } = req.body;

    // current stage
    const current = await JobCardStage.findOne({
      job_card_id: jobId,
      stage_id: stageId,
      status: "in_progress",
    });

    if (!current) {
      return res.status(404).json({
        success: false,
        message: "Active stage not found",
      });
    }

    // complete current
    current.status = "completed";
    current.remarks = remarks || "";
    current.end_date = new Date();
    if (images) current.images = images;

    await current.save();

    // 🔹 find next stage
    const currentStage = await DesignStage.findById(stageId);

    const nextStage = await DesignStage.findOne({
      order: { $gt: currentStage.order },
      is_active: true,
    }).sort({ order: 1 });

    if (nextStage) {
      await JobCardStage.create({
        job_card_id: jobId,
        stage_id: nextStage._id,
        stage_name: nextStage.stage_name,
        status: "in_progress",
        start_date: new Date(),
      });
    }

    res.json({
      success: true,
      message: "Stage completed successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};







export const updateJobStage = async (req, res) => {
  try {
    const { stageId } = req.params;

    if (!stageId) {
      return res.status(400).json({ success: false, message: "stageId required" });
    }

    const stage = await JobCardStage.findById(stageId);
    // if (!stage) {
    //   return res.status(404).json({
    //     success: false,
    //     message: "JobCardStage not found (invalid stageId)",
    //   });
    // }

    const payload = req.body;

    /* ================= BASIC ================= */
    stage.assigned_to = payload.assigned_to ?? stage.assigned_to;
    stage.status = payload.status ?? stage.status;
    stage.start_date = payload.start_date ?? stage.start_date;
    stage.end_date = payload.end_date ?? stage.end_date;
    stage.remarks = payload.remarks ?? stage.remarks;

    /* ================= FILES ================= */
    let existingFiles = [];

    if (payload.design_files) {
      if (typeof payload.design_files === "string") {
        try {
          existingFiles = JSON.parse(payload.design_files);
        } catch {
          existingFiles = [];
        }
      } else if (Array.isArray(payload.design_files)) {
        existingFiles = payload.design_files;
      }
    }

    const uploadedFiles =
      req.files?.map((file) => ({
        name: file.originalname,
        size: file.size,
        type: file.mimetype,
        url: `${req.protocol}://${req.get("host")}/uploads/jobStages/${file.filename}`,
        uploaded_at: new Date(),
      })) || [];

    /* ================= DATA ================= */
    stage.data = {
      ...(stage.data || {}),
      estimated_hours: payload.estimated_hours,
      actual_hours: payload.actual_hours,
      design_notes: payload.design_notes,
      design_specifications: payload.design_specifications,
      auto_start_next:
        payload.auto_start_next === "true" ||
        payload.auto_start_next === true,
      next_stage: payload.next_stage,
      design_files: [...existingFiles, ...uploadedFiles],
    };

    /* ================= COMPLETE ================= */
    if (payload.status === "completed") {
      stage.completed_at = new Date();
      stage.end_date = new Date();
    }

    await stage.save();
    

    const populatedStage = await JobCardStage.findById(stage._id)
      .populate("assigned_to", "name employee_code mobile")
      .populate("job_card_id", "job_card_no status stage");

    return res.json({
      success: true,
      message: "Stage updated successfully",
      data: populatedStage,
    });
  } catch (error) {
    console.error("Update Job Stage Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};


