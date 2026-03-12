
import JobCardStage from "../Models/models/JobCardStage.js";
import StageMaster from "../Models/models/StageMaster.js";

export const submitStage = async (req, res) => {
  try {
    const { jobCardId, stageCode } = req.params;
    const payload = req.body;

    const stage = await JobCardStage.findOne({
      job_card_id: jobCardId,
      stage_code: stageCode,
    });

    if (!stage) {
      return res.status(404).json({
        success: false,
        message: "Stage not found",
      });
    }

    // update current stage
    stage.assigned_to = payload.assigned_to || stage.assigned_to;
    stage.status = payload.status;
    stage.data = payload;
    stage.remarks = payload.remarks || "";

    if (payload.status === "completed") {
      stage.completed_at = new Date();
      stage.end_date = new Date();
    }

    await stage.save();

    /* ===============================
       AUTO CREATE NEXT STAGE
    =============================== */
    if (payload.status === "completed") {
      const master = await StageMaster.findOne({
        stage_code: stageCode,
        is_active: true,
      });

      if (master?.next_stage_code) {
        const nextMaster = await StageMaster.findOne({
          stage_code: master.next_stage_code,
        });

        const exists = await JobCardStage.findOne({
          job_card_id: jobCardId,
          stage_code: nextMaster.stage_code,
        });

        if (!exists) {
          await JobCardStage.create({
            job_card_id: jobCardId,
            stage_code: nextMaster.stage_code,
            stage_name: nextMaster.stage_name,
            department: nextMaster.department,
            status: "in_progress",
            start_date: new Date(),
          });
        }
      }
    }

    return res.json({
      success: true,
      message: "Stage updated successfully",
      data: stage,
    });
  } catch (error) {
    console.error("Submit Stage Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



export const getJobCardStages = async (req, res) => {
  try {
    const { jobCardId } = req.params;

    const stages = await JobCardStage.find({ job_card_id: jobCardId })
      .populate("assigned_to", "name employee_code")
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      data: stages,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
