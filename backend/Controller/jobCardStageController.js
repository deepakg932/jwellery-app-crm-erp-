import JobCardStage from "../models/JobCardStage.js";
// import DesignStage from "../Models/models/DesignStage.js";
import JobCard from "../models/JobCard.js";

import { generateInvoiceNumber } from "../helper/generateInvoiceNumber.js";
import deductFromStockIn from "../helper/deductFromPurchaseOrder.js";
// import PriceMaking from "../Models/models/PricemakingModel.js";

// export const updateFilingStage = async (req, res) => {
//   try {
//     const { stageId } = req.params;
//     const payload = req.body;

//     const stage = await JobCardStage.findById(stageId);
//     if (!stage || stage.department !== "FILING") {
//       return res.status(404).json({
//         success: false,
//         message: "Filing stage not found",
//       });
//     }

//     if (payload.assigned_to !== undefined)
//       stage.assigned_to = payload.assigned_to;

//     if (payload.status !== undefined) stage.status = payload.status;

//     if (payload.start_date) stage.start_date = new Date(payload.start_date);

//     if (payload.end_date) stage.end_date = new Date(payload.end_date);

//     if (payload.remarks !== undefined) stage.remarks = payload.remarks;

//     if (payload.filing_tools_used !== undefined) {
//       stage.data.filing_tools_used = payload.filing_tools_used;
//     }

//     if (payload.status === "completed") {
//       stage.completed_at = new Date();
//     }

//     const BASE_URL = `${req.protocol}://${req.get("host")}`;
//     const incomingFiles = Array.isArray(req.files) ? req.files : [];

//     const uploadedFiles = incomingFiles.map((file) => ({
//       name: file.originalname,
//       size: file.size,
//       type: file.mimetype,
//       url: `${BASE_URL}/uploads/jobFiling/${file.filename}`,
//       category: payload.file_category || "output",
//       version: payload.file_version || "1.0",
//       revision: Number(payload.file_revisions || 0),
//       uploaded_at: new Date(),
//     }));

//     const {
//       assigned_to,
//       status,
//       start_date,
//       end_date,
//       remarks,
//       stage: nextStage,
//       files,
//       ...dataPayload
//     } = payload;

//     stage.data = {
//       ...(stage.data || {}),
//       ...dataPayload,
//     };

//     if (uploadedFiles.length) {
//       stage.data.files = [...(stage.data.files || []), ...uploadedFiles];
//     }

//     stage.markModified("data");
//     await stage.save({ validateBeforeSave: false });

//     if (nextStage) {
//       const nextDept = nextStage.toUpperCase();

//       await JobCard.findByIdAndUpdate(stage.job_card_id, {
//         stage: nextStage,
//         current_department: nextDept,
//         status: "in_progress",
//       });

//       const exists = await JobCardStage.findOne({
//         job_card_id: stage.job_card_id,
//         department: nextDept,
//       });

//       if (!exists) {
//         await JobCardStage.create({
//           job_card_id: stage.job_card_id,
//           department: nextDept,
//           status: "pending",
//           assigned_to: null,
//           data: {},
//         });
//       }
//     }

//     const obj = stage.toObject();
//     const dataOnly = obj.data;
//     delete obj.data;

//     return res.json({
//       success: true,
//       message: "Filing stage updated successfully",
//       data: {
//         ...obj,
//         ...dataOnly,
//         files: dataOnly?.files || [],
//       },
//     });
//   } catch (error) {
//     console.error("updateFilingStage error:", error);
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

export const updatePolishingStage = async (req, res) => {
  try {
    const { stageId } = req.params;
    console.log(stageId, "stageId");
    const payload = req.body;
    console.log(payload, "pauload");

    const stage = await JobCardStage.findById(stageId);
    console.log(stage, "stage  ");
    if (!stage) {
      return res
        .status(404)
        .json({ success: false, message: "Stage not found" });
    }

    if (payload.assigned_to !== undefined)
      stage.assigned_to = payload.assigned_to;

    if (payload.status !== undefined) stage.status = payload.status;

    if (payload.start_date) stage.start_date = new Date(payload.start_date);

    if (payload.end_date) stage.end_date = new Date(payload.end_date);

    if (payload.remarks !== undefined) stage.remarks = payload.remarks;

    if (payload.status === "completed") {
      stage.completed_at = new Date();
    }

    const BASE_URL = `${req.protocol}://${req.get("host")}`;
    const incomingFiles = Array.isArray(req.files) ? req.files : [];

    const uploadedFiles = incomingFiles.map((file) => ({
      name: file.originalname,
      size: file.size,
      type: file.mimetype,
      url: `${BASE_URL}/uploads/jobPolishing/${file.filename}`,
      category: payload.file_category || "output",
      version: payload.file_version || "1.0",
      revision: Number(payload.file_revisions || 0),
      uploaded_at: new Date(),
    }));

    const {
      assigned_to,
      status,
      start_date,
      end_date,
      remarks,
      stage: nextStage,
      next_stage,
      files,
      ...dataFields
    } = payload;

    delete dataFields.labour_cost;

    stage.data = {
      ...(stage.data || {}),
      ...dataFields,
    };

    if (uploadedFiles.length) {
      stage.data.files = [...(stage.data.files || []), ...uploadedFiles];
    }

    if (payload.labour_cost !== undefined) {
      stage.data.labour_cost = Number(payload.labour_cost);
    }

    // //labour
    // const polishingTime = Number(stage.data?.polishing_time || 0);
    // console.log(polishingTime, "polishingTimne");

    //   const polishingTime = Number(payload.polishing_time || 0);

    // // if (polishingTime > 0) {
    // const rate = await PriceMaking.findOne({
    //   making_stage_id: { $regex: "^polishing$", $options: "i" },
    //   is_active: true,
    // });

    //   const rateAmount = Number(rate?.cost_amount || 0);

    // stage.data.labour_cost =
    //   polishingTime > 0 && rateAmount > 0
    //     ? Number((polishingTime * rateAmount).toFixed(2))
    //     : 0;

    //        console.log("Polishing Time:", polishingTime);
    // console.log("Rate:", rate);
    // console.log("Final Labour:", stage.data.labour_cost);
    stage.markModified("data");
    await stage.save({ validateBeforeSave: false });

    const goToStage = nextStage || next_stage;

    if (goToStage && goToStage !== "none") {
      const nextDept = goToStage.toUpperCase();

      await JobCard.findByIdAndUpdate(stage.job_card_id, {
        stage: goToStage,
        current_department: nextDept,
        status: "in_progress",
      });

      const exists = await JobCardStage.findOne({
        job_card_id: stage.job_card_id,
        department: nextDept,
      });

      if (!exists) {
        await JobCardStage.create({
          job_card_id: stage.job_card_id,
          department: nextDept,
          status: "pending",
          assigned_to: null,
          start_date: null,
          end_date: null,
          data: {},
        });
      }
    }

    const obj = stage.toObject();

    return res.json({
      success: true,
      message: "Polishing stage updated successfully",
      data: {
        stage: {
          _id: obj._id,
          job_card_id: obj.job_card_id,
          department: obj.department,
          assigned_to: obj.assigned_to,
          status: obj.status,
          start_date: obj.start_date,
          end_date: obj.end_date,
          completed_at: obj.completed_at,
          remarks: obj.remarks,
          createdAt: obj.createdAt,
          updatedAt: obj.updatedAt,
        },
        data: obj.data || {},
        files: obj.data?.files || [],
      },
    });
  } catch (error) {
    console.error("updatePolishingStage error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updatePlatingStage = async (req, res) => {
  try {
    const { stageId } = req.params;
    const payload = req.body;

    const stage = await JobCardStage.findById(stageId);
    if (!stage || stage.department !== "PLATING") {
      return res.status(404).json({
        success: false,
        message: "Plating stage not found",
      });
    }

    if (payload.assigned_to !== undefined)
      stage.assigned_to = payload.assigned_to;

    if (payload.status !== undefined) stage.status = payload.status;

    if (payload.start_date) stage.start_date = new Date(payload.start_date);

    if (payload.end_date) stage.end_date = new Date(payload.end_date);

    if (payload.remarks !== undefined) stage.remarks = payload.remarks;

    if (payload.status === "completed") {
      stage.completed_at = new Date();
    }

    const BASE_URL = `${req.protocol}://${req.get("host")}`;
    const incomingFiles = Array.isArray(req.files) ? req.files : [];

    const uploadedFiles = incomingFiles.map((file) => ({
      name: file.originalname,
      size: file.size,
      type: file.mimetype,
      url: `${BASE_URL}/uploads/jobPlating/${file.filename}`,
      category: payload.file_category || "output",
      version: payload.file_version || "1.0",
      revision: Number(payload.file_revisions || 0),
      uploaded_at: new Date(),
    }));

    const {
      assigned_to,
      status,
      start_date,
      end_date,
      remarks,
      stage: nextStage,
      next_stage,
      // files,
      files: payloadFiles, // 🔥 rename
      ...dataFields
    } = payload;

    stage.data = stage.data || {};

    // 🔥 NEVER overwrite files from payload
    delete dataFields.files;

    // Merge remaining fields
    Object.assign(stage.data, dataFields);

    // Ensure files array
    if (!Array.isArray(stage.data.files)) {
      stage.data.files = [];
    }

    // Push only uploaded files
    if (uploadedFiles.length > 0) {
      stage.data.files = [...stage.data.files, ...uploadedFiles];
    }

    // stage.data = stage.data || {};
    // Object.assign(stage.data, dataFields);

    // if (!Array.isArray(stage.data.files)) {
    //   stage.data.files = [];
    // }

    // if (uploadedFiles.length) {
    //   stage.data.files.push(...uploadedFiles);
    // }

    stage.markModified("data");
    await stage.save({ validateBeforeSave: false });

    const goToStage = nextStage || next_stage;

    if (goToStage && goToStage !== "none") {
      const nextDept = goToStage.toUpperCase();

      await JobCard.findByIdAndUpdate(stage.job_card_id, {
        stage: goToStage,
        current_department: nextDept,
        status: "in_progress",
      });

      const exists = await JobCardStage.findOne({
        job_card_id: stage.job_card_id,
        department: nextDept,
      });

      if (!exists) {
        await JobCardStage.create({
          job_card_id: stage.job_card_id,
          department: nextDept,
          status: "pending",
          assigned_to: null,
          data: {},
        });
      }
    }

    return res.json({
      success: true,
      message: "Plating stage updated successfully",
      data: {
        stage,
        files: stage.data.files || [],
      },
    });
  } catch (error) {
    console.error("updatePlatingStage error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateQualityCheckStage = async (req, res) => {
  try {
    const { stageId } = req.params;
    const payload = req.body;

    const stage = await JobCardStage.findById(stageId);
    if (!stage) {
      return res.status(404).json({ message: "Stage not found" });
    }

    if (payload.assigned_to !== undefined)
      stage.assigned_to = payload.assigned_to;

    if (payload.status !== undefined) stage.status = payload.status;

    if (payload.start_date) stage.start_date = new Date(payload.start_date);

    if (payload.end_date) stage.end_date = new Date(payload.end_date);

    if (payload.status === "completed") {
      stage.completed_at = new Date();
    }

    const cleanPayload = { ...payload };

    delete cleanPayload.files;
    delete cleanPayload.next_stage;
    delete cleanPayload.stage;

    // if (typeof cleanPayload.check_points === "string") {
    //   try {
    //     cleanPayload.check_points = JSON.parse(cleanPayload.check_points);
    //   } catch {
    //     cleanPayload.check_points = [];
    //   }
    // }

    const parseArrayField = (field) => {
      if (!field) return [];

      if (Array.isArray(field)) return field;

      if (typeof field === "string") {
        try {
          const parsed = JSON.parse(field);
          return Array.isArray(parsed) ? parsed : [parsed];
        } catch {
          return field.split(",").map((item) => item.trim());
        }
      }

      return [];
    };

    // if (typeof cleanPayload.measuring_tools_used === "string") {
    //   try {
    //     cleanPayload.measuring_tools_used = JSON.parse(
    //       cleanPayload.measuring_tools_used,
    //     );
    //   } catch {
    //     cleanPayload.measuring_tools_used = [];
    //   }
    // }

    cleanPayload.check_points = parseArrayField(payload.check_points);
    cleanPayload.measuring_tools_used = parseArrayField(
      payload.measuring_tools_used,
    );

    if (payload.remarks !== undefined) {
      stage.remarks = payload.remarks;
      delete cleanPayload.remarks;
    }

    stage.data = {
      ...(stage.data || {}),
      ...cleanPayload,
    };

    if (req.files && req.files.length > 0) {
      const BASE_URL = `${req.protocol}://${req.get("host")}`;

      const uploadedFiles = req.files.map((file) => ({
        name: file.originalname,
        size: file.size,
        type: file.mimetype,
        url: `${BASE_URL}/uploads/jobQuality/${file.filename}`,
        category: "inspection",
        version: payload.file_version || "1.0",
        revision: Number(payload.file_revisions || 0),
        uploaded_at: new Date(),
      }));

      stage.data.files = [...(stage.data.files || []), ...uploadedFiles];
    }

    stage.markModified("data");
    await stage.save({ validateBeforeSave: false });

    const nextStage = payload.next_stage || payload.stage;

    if (nextStage) {
      const nextDept = nextStage.toUpperCase();

      await JobCard.findByIdAndUpdate(stage.job_card_id, {
        stage: nextStage,
        current_department: nextDept,
        status: "in_progress",
      });

      const exists = await JobCardStage.findOne({
        job_card_id: stage.job_card_id,
        department: nextDept,
      });

      if (!exists) {
        await JobCardStage.create({
          job_card_id: stage.job_card_id,
          department: nextDept,
          status: "pending",
          assigned_to: null,
          start_date: null,
          end_date: null,
          data: {},
        });
      }
    }

    return res.json({
      success: true,
      message: "Quality Check Stage updated successfully",
      data: stage,
      files: stage.data?.files || [],
    });
  } catch (error) {
    console.error("updateQualityCheckStage error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateStoneSettingStage = async (req, res) => {
  try {
    const { stageId } = req.params;
    const payload = req.body;

    const stage = await JobCardStage.findById(stageId);
    if (!stage) {
      return res.status(404).json({
        success: false,
        message: "Stage not found",
      });
    }

    const prevStatus = stage.status;

    /* ================= BASIC FIELDS ================= */
    if (payload.assigned_to !== undefined)
      stage.assigned_to = payload.assigned_to;

    if (payload.status !== undefined) stage.status = payload.status;

    if (payload.start_date) stage.start_date = new Date(payload.start_date);

    if (payload.end_date) stage.end_date = new Date(payload.end_date);

    if (payload.remarks !== undefined) stage.remarks = payload.remarks;

    if (payload.status === "completed" && prevStatus !== "completed") {
      stage.completed_at = new Date();
    }

    /* ================= FILE UPLOAD ================= */
    const BASE_URL = `${req.protocol}://${req.get("host")}`;
    const incomingFiles = Array.isArray(req.files) ? req.files : [];

    const uploadedFiles = incomingFiles.map((file) => ({
      name: file.originalname,
      size: file.size,
      type: file.mimetype,
      url: `${BASE_URL}/uploads/jobSetting/${file.filename}`,
      category: payload.file_category || "output",
      version: payload.file_version || "1.0",
      revision: Number(payload.file_revisions || 0),
      uploaded_at: new Date(),
    }));

    /* ================= DATA PAYLOAD ================= */
    const {
      assigned_to,
      status,
      start_date,
      end_date,
      remarks,
      stage: nextStage,
      next_stage,
      files,
      source_files,
      output_files,
      ...dataFields
    } = payload;

    stage.data = {
      ...(stage.data || {}),
      ...dataFields,
    };

    if (uploadedFiles.length) {
      stage.data.files = [...(stage.data.files || []), ...uploadedFiles];
    }

    /* ================= STOCK DEDUCTION ================= */
    if (payload.stone_id) {
      await deductFromStockIn({
        inventory_item_id: payload.stone_id,
        used_qty: Number(payload.stone_quantity || 0),
        wastage_qty: Number(payload.stone_breakage || 0),
        wastage_weight: 0,
      });
    }

    stage.markModified("data");
    await stage.save({ validateBeforeSave: false });

    /* ================= NEXT STAGE MOVE ================= */
    const goToStage = nextStage || next_stage;

    if (goToStage) {
      const nextDept = goToStage.toUpperCase();

      await JobCard.findByIdAndUpdate(stage.job_card_id, {
        stage: goToStage,
        current_department: nextDept,
        status: "in_progress",
      });

      const exists = await JobCardStage.findOne({
        job_card_id: stage.job_card_id,
        department: nextDept,
      });

      if (!exists) {
        await JobCardStage.create({
          job_card_id: stage.job_card_id,
          department: nextDept,
          status: "pending",
          assigned_to: null,
          data: { files: [] },
        });
      }
    }

    /* ================= POPULATE RESPONSE ================= */
    const populatedStage = await JobCardStage.findById(stage._id)
      .populate("assigned_to", "name mobile")
      .populate("job_card_id", "job_card_no stage status")
      .populate("data.stone_id", "item_name item_code category") // 🔥 STONE NAME
      .lean();

    return res.json({
      success: true,
      message: "Stone setting stage updated successfully",
      data: populatedStage,
    });
  } catch (error) {
    console.error("updateStoneSettingStage error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updatePackagingStage = async (req, res) => {
  try {
    const { stageId } = req.params;
    const payload = req.body || {};

    const stage = await JobCardStage.findById(stageId);
    if (!stage || stage.department !== "PACKAGING") {
      return res.status(404).json({
        success: false,
        message: "Packaging stage not found",
      });
    }

    if (payload.assigned_to !== undefined)
      stage.assigned_to = payload.assigned_to;

    if (payload.status !== undefined) stage.status = payload.status;

    if (payload.start_date) stage.start_date = new Date(payload.start_date);

    if (payload.end_date) stage.end_date = new Date(payload.end_date);

    if (payload.remarks !== undefined) stage.remarks = payload.remarks;

    if (payload.status === "completed") stage.completed_at = new Date();

    const cleanPayload = { ...payload };
    delete cleanPayload.files;
    delete cleanPayload.source_files;
    delete cleanPayload.output_files;

    const nextStage = cleanPayload.stage || cleanPayload.next_stage || null;

    delete cleanPayload.stage;
    delete cleanPayload.next_stage;

    stage.data = {
      ...(stage.data || {}),
      ...cleanPayload,
    };

    if (payload.materials_used !== undefined) {
      stage.data.materials_used = payload.materials_used;
    }

    if (!stage.data.invoice_number) {
      stage.data.invoice_number = await generateInvoiceNumber();
    }

    if (req.files && req.files.length > 0) {
      const BASE_URL = `${req.protocol}://${req.get("host")}`;

      const uploadedFiles = req.files.map((file) => ({
        name: file.originalname,
        size: file.size,
        type: file.mimetype,
        url: `${BASE_URL}/uploads/jobPackaging/${file.filename}`,
        category: payload.file_category || "output",
        version: payload.file_version || "1.0",
        revision: Number(payload.file_revisions || 0),
        uploaded_at: new Date(),
      }));

      stage.data.files = [...(stage.data.files || []), ...uploadedFiles];
    }

    stage.markModified("data");
    await stage.save({ validateBeforeSave: false });

    if (nextStage) {
      const nextDept = nextStage.toUpperCase();

      await JobCard.findByIdAndUpdate(stage.job_card_id, {
        stage: nextStage,
        current_department: nextDept,
        status: "in_progress",
      });

      const exists = await JobCardStage.findOne({
        job_card_id: stage.job_card_id,
        department: nextDept,
      });

      if (!exists) {
        await JobCardStage.create({
          job_card_id: stage.job_card_id,
          department: nextDept,
          status: "pending",
          assigned_to: null,
          data: {},
        });
      }
    }

    const populated = await JobCardStage.findById(stage._id)
      .populate("assigned_to", "name mobile email")
      .populate("job_card_id", "job_card_no stage status")
      .lean();

    return res.json({
      success: true,
      message: "Packaging stage updated successfully",
      data: populated,
      invoice_number: populated?.data?.invoice_number || null,
      files: populated?.data?.files || [],
    });
  } catch (error) {
    console.error("updatePackagingStage error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



import mongoose from "mongoose";


export const updatedesignStage = async (req, res) => {
  try {
    const { stageId } = req.params;
    const payload = req.body;

    const stage = await JobCardStage.findById(stageId);
    if (!stage) {
      return res.status(404).json({
        success: false,
        message: "Stage not found",
      });
    }

    const prevStatus = stage.status;

    /* ================= ROOT FIELDS ================= */
    if (payload.assigned_to !== undefined)
      stage.assigned_to = payload.assigned_to;

    if (payload.remarks !== undefined) stage.remarks = payload.remarks;

    if (payload.start_date) stage.start_date = new Date(payload.start_date);

    // if (payload.labor_cost !== undefined) {
    //   stage.data.labor_cost = Number(payload.labor_cost);
    // }

    // if (payload.labour_cost !== undefined) {
    //   stage.data.labor_cost = Number(payload.labour_cost);
    // }

    if (payload.labor_cost !== undefined)
      stage.data.labor_cost = Number(payload.labor_cost);
    if (payload.end_date) stage.end_date = new Date(payload.end_date);

    if (payload.selected_labor_costs !== undefined)
      stage.data.selected_labor_costs = payload.selected_labor_costs;

    if (payload.labor_cost_breakdown !== undefined)
      stage.data.labor_cost_breakdown = payload.labor_cost_breakdown;

    let incomingStatus = null;
    if (payload.status) {
      incomingStatus = payload.status.toLowerCase();
      stage.status = incomingStatus;
    }

    /* ================= FILE UPLOADS ================= */
    const uploadedFiles =
      req.files?.map((file) => ({
        name: file.originalname,
        size: file.size,
        type: file.mimetype,
        url: `${req.protocol}://${req.get("host")}/uploads/jobStages/${file.filename}`,
        category: "output",
        version: payload.file_version || "1.0",
        revision: payload.file_revisions || 0,
        uploaded_at: new Date(),
      })) || [];

    /* ================= DATA MAPPING (FORM BASED) ================= */
    stage.data = stage.data || {};

    const dataFields = [
      // time
      "estimated_hours",
      "actual_hours",
      "preparation_time",
      "processing_time",
      "finishing_time",
      "inspection_time",
      "packaging_time",
      "total_time_spent",
      "time_breakdown",

      // cost (labor_cost REMOVED)
      "material_cost",
      "other_costs",
      "total_cost",
      "markup_percentage",
      "final_price",
      "cost_currency",
      "cost_status",

      // design
      "design_notes",
      "design_specifications",
      "stage_type",

      // files
      "file_version",
      "file_revisions",
      "file_status",
      "backup_location",

      // labor
      "selected_labor_costs",
      "labor_cost_breakdown",
    ];
    console.log(dataFields, "dataFields");
    // 🔥 multipart/form-data FIX
    const safeParse = (value) => {
      if (typeof value === "string") {
        try {
          return JSON.parse(value);
        } catch (e) {
          return value;
        }
      }
      return value;
    };

    dataFields.forEach((key) => {
      if (payload[key] !== undefined) {
        stage.data[key] = safeParse(payload[key]);
      }
    });

    // merge files
    stage.data.files = [...(stage.data.files || []), ...uploadedFiles];

    stage.markModified("data");

    /* ================= NEXT STAGE AUTO FLOW ================= */
    if (incomingStatus === "approved" && prevStatus !== "approved") {
      stage.completed_at = new Date();

      const flow = {
        DESIGN: "CAD",
        CAD: "CASTING",
        CASTING: "FILING",
        FILING: "POLISHING",
        POLISHING: "QUALITY",
        QUALITY: "PACKAGING",
      };

      const nextDepartment = flow[stage.department.toUpperCase()];

      if (nextDepartment) {
        await JobCard.findByIdAndUpdate(stage.job_card_id, {
          stage: nextDepartment.toLowerCase(),
          current_department: nextDepartment,
          status: "in_progress",
        });

        const exists = await JobCardStage.findOne({
          job_card_id: stage.job_card_id,
          department: nextDepartment,
        });

        if (!exists) {
          await JobCardStage.create({
            job_card_id: stage.job_card_id,
            department: nextDepartment,
            status: "pending",
            start_date: new Date(),
            data: { files: [] },
          });
        }
      }
    }

    await stage.save({ validateBeforeSave: false });

    /* ================= CLEAN RESPONSE (FRONTEND FRIENDLY) ================= */
    return res.json({
      success: true,
      message: "Design stage updated successfully",
      data: {
        _id: stage._id,
        job_card_id: stage.job_card_id,
        department: stage.department,
        status: stage.status,
        assigned_to: stage.assigned_to,
        remarks: stage.remarks,

        start_date: stage.start_date,
        end_date: stage.end_date,
        labor_cost_breakdown: stage.data.labor_cost_breakdown || [],
        completed_at: stage.completed_at,
        ...stage.data, // 🔥 FORM KE SAARE FIELDS
        createdAt: stage.createdAt,
        updatedAt: stage.updatedAt,
      },
    });
  } catch (error) {
    console.error("updatedesignStage error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};




export const updateCadStage = async (req, res) => {
  try {
    const { stageId } = req.params;
    const payload = req.body;

    const stage = await JobCardStage.findById(stageId);

    if (!stage || stage.department !== "CAD") {
      return res.status(404).json({
        success: false,
        message: "CAD stage not found",
      });
    }

    /* ================= SAFE PARSER ================= */
    const safeParse = (val) => {
      if (typeof val === "string") {
        try {
          return JSON.parse(val);
        } catch {
          return val;
        }
      }
      return val;
    };

    /* ================= STATUS TRACK ================= */
    const prevStatus = stage.status;
    let incomingStatus = payload.status
      ? payload.status.toLowerCase()
      : stage.status;

    /* ================= ROOT ================= */
    if (payload.assigned_to !== undefined)
      stage.assigned_to = payload.assigned_to;

    if (payload.status !== undefined)
      stage.status = incomingStatus;

    if (payload.start_date)
      stage.start_date = new Date(payload.start_date);

    if (payload.end_date)
      stage.end_date = new Date(payload.end_date);

    if (payload.remarks !== undefined)
      stage.remarks = payload.remarks;

    stage.data = stage.data || {};

    /* ================= GENERIC FIELD SAVE ================= */

    const numberFields = [
      "estimated_hours",
      "actual_hours",
      "design_time",
      "modeling_time",
      "rendering_time",
      "revision_time",
      "review_time",
      "total_time_spent",
      "material_cost",
      "labor_cost",
      "software_cost",
      "machine_cost",
      "other_costs",
      "total_cost",
      "markup_percentage",
      "final_price",
      "file_revisions",
    ];

    const stringFields = [
      "time_breakdown",
      "cad_software",
      "complexity_level",
      "design_notes",
      "design_specifications",
      "stage",
      "file_version",
      "file_status",
      "backup_location",
      "cost_currency",
      "cost_status",
      "labor_cost_breakdown"
    ];

    numberFields.forEach((key) => {
      if (payload[key] !== undefined) {
        stage.data[key] = Number(payload[key]);
      }
    });

    stringFields.forEach((key) => {
      if (payload[key] !== undefined) {
        stage.data[key] = payload[key];
      }
    });

    /* ================= LABOR ================= */

    if (payload.selected_labor_costs !== undefined) {
      const parsed = safeParse(payload.selected_labor_costs);

      stage.data.selected_labor_costs = Array.isArray(parsed)
        ? parsed.map((id) => new mongoose.Types.ObjectId(id))
        : [];
    }

    if (payload.labor_cost_breakdown !== undefined) {
      const parsed = safeParse(payload.labor_cost_breakdown);

      stage.data.labor_cost_breakdown = Array.isArray(parsed)
        ? parsed.map((item) => ({
            id: new mongoose.Types.ObjectId(item.id || item._id),
            name: item.name || "",
            type: item.type || "",
            cost_amount: Number(item.cost_amount) || 0,
            unit: item.unit || "",
            total_cost: String(item.total_cost || item.cost_amount || "0"),
            stage: item.stage || "",
            sub_stage: item.sub_stage || "",
          }))
        : [];
    }

    

    /* ================= FILE UPLOAD ================= */

    const uploadedFiles =
      req.files?.map((file) => ({
        name: file.originalname,
        size: file.size,
        type: file.mimetype,
        url: `${req.protocol}://${req.get("host")}/uploads/jobStages/${file.filename}`,
        category: "output",
        version: payload.file_version || "1.0",
        revision: payload.file_revisions || 0,
        uploaded_at: new Date(),
      })) || [];

    if (uploadedFiles.length > 0) {
      stage.data.files = [...(stage.data.files || []), ...uploadedFiles];
    }

    /* ================= COMPLETE ================= */
    if (["approved", "completed"].includes(incomingStatus)) {
      stage.completed_at = new Date();
    }

    /* ================= 🔥 NEXT STAGE FLOW ================= */
    // if (incomingStatus === "approved") {
    if (
  ["approved", "completed"].includes(incomingStatus) &&
  prevStatus !== incomingStatus
) {

  const flow = {
    DESIGN: "CAD",
    CAD: "CASTING",
    CASTING: "FILING",
    FILING: "POLISHING",
    POLISHING: "QUALITY",
    QUALITY: "PACKAGING",
  };

  const nextDepartment = flow[stage.department?.toUpperCase()];

  if (nextDepartment) {
    // update jobcard
    await JobCard.findByIdAndUpdate(stage.job_card_id, {
      stage: nextDepartment.toLowerCase(),
      current_department: nextDepartment,
      status: "in_progress",
    });

    // check existing stage
    const exists = await JobCardStage.findOne({
      job_card_id: stage.job_card_id,
      department: nextDepartment,
    });

    // 🔥 create only if not exists
    if (!exists) {
      await JobCardStage.create({
        job_card_id: stage.job_card_id,
        department: nextDepartment,
        status: "pending",
        start_date: new Date(),
        data: { files: [] },
      });
    }
  }
}


    stage.markModified("data");
    await stage.save({ validateBeforeSave: false });

    /* ================= RESPONSE ================= */

    return res.json({
      success: true,
      message: "CAD stage updated successfully",
      data: {
        _id: stage._id,
        job_card_id: stage.job_card_id,
        department: stage.department,
        status: stage.status,
        assigned_to: stage.assigned_to,
        remarks: stage.remarks,
        start_date: stage.start_date,
        end_date: stage.end_date,
        completed_at: stage.completed_at,

        ...stage.data,

        files: stage.data.files || [],
        selected_labor_costs: stage.data.selected_labor_costs || [],
        labor_cost_breakdown: stage.data.labor_cost_breakdown || [],

        createdAt: stage.createdAt,
        updatedAt: stage.updatedAt,
      },
    });
  } catch (error) {
    console.error("updateCadStage error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



export const updateCastingStage = async (req, res) => {
  try {
    const { stageId } = req.params;
    const payload = req.body;

    const stage = await JobCardStage.findById(stageId);

    if (!stage || stage.department !== "CASTING") {
      return res.status(404).json({
        success: false,
        message: "Casting stage not found",
      });
    }

    /* ================= HELPERS ================= */

    // const safeParse = (val) => {
    //   if (typeof val === "string") {
    //     try {
    //       return JSON.parse(val);
    //     } catch {
    //       return val;
    //     }
    //   }
    //   return val;
    // };


     const safeParse = (val) => {
      if (typeof val === "string") {
        try {
          return JSON.parse(val);
        } catch {
          return val;
        }
      }
      return val;
    };

    const toObjectId = (val) => {
      if (!val) return null;

      if (typeof val === "object" && val._id)
        return new mongoose.Types.ObjectId(val._id);

      if (typeof val === "string" && mongoose.Types.ObjectId.isValid(val))
        return new mongoose.Types.ObjectId(val);

      return null;
    };

    /* ================= STATUS TRACK ================= */

    const prevStatus = stage.status;
    let incomingStatus = payload.status
      ? payload.status.toLowerCase()
      : stage.status;

    /* ================= ROOT ================= */

    stage.assigned_to = payload.assigned_to ?? stage.assigned_to;
    stage.status = incomingStatus ?? stage.status;

    if (payload.start_date)
      stage.start_date = new Date(payload.start_date);

    if (payload.end_date)
      stage.end_date = new Date(payload.end_date);

    stage.remarks = payload.remarks ?? stage.remarks;

    stage.data = stage.data || {};

    /* ================= GENERIC AUTO FIELD MAP ================= */

    const numberFields = [
      "labour_hours",
      "actual_hours",
      "material_issued_qty",
      "material_used_qty",
      "material_returned_qty",
      "material_wastage_qty",
      "tree_size",
      "burnout_time",
      "casting_temperature",
      "pressure_applied",
      "vacuum_level",
      "material_cost",
      "labour_cost",
      "equipment_cost",
      "consumables_cost",
      "gas_cost",
      "other_costs",
      "total_cost",
      "markup_percentage",
      "final_price",
      "preparation_time",
      "mold_making_time",
      "burnout_time_track",
      "casting_time",
      "finishing_time",
      "quality_check_time",
      "total_time_spent",
      "file_revisions",
    ];

    const stringFields = [
      "material_type",
      "material_item_code",
      "purity",
      "material_unit",
      "material_wastage_type",
      "casting_method",
      "mold_type",
      "surface_quality",
      "dimensional_accuracy",
      "porosity_level",
      "defects",
      "rework_reason",
      "time_breakdown",
      "file_version",
      "file_status",
      "backup_location",
      "cost_currency",
      "cost_status",
      "stage",
     
    ];

    numberFields.forEach((k) => {
      if (payload[k] !== undefined)
        stage.data[k] = Number(payload[k]);
    });

    stringFields.forEach((k) => {
      if (payload[k] !== undefined)
        stage.data[k] = payload[k];
    });

    if (payload.rework_required !== undefined) {
      stage.data.rework_required =
        payload.rework_required === true ||
        payload.rework_required === "true";
    }

    /* ================= OBJECT ID FIELDS ================= */

    if (payload.material_id)
      stage.data.material_id = toObjectId(payload.material_id);

    if (payload.material_unit_id)
      stage.data.material_unit_id = toObjectId(payload.material_unit_id);

    /* ================= LABOR FIX ================= */

    if (payload.selected_labor_costs !== undefined) {
      const parsed = safeParse(payload.selected_labor_costs);

      stage.data.selected_labor_costs = Array.isArray(parsed)
        ? parsed.map((id) => toObjectId(id)).filter(Boolean)
        : [];
    }

    if (payload.labor_cost_breakdown !== undefined) {
      const parsed = safeParse(payload.labor_cost_breakdown);

      stage.data.labor_cost_breakdown = Array.isArray(parsed)
        ? parsed
            .map((item) => {
              const objId = toObjectId(item.id || item._id);
              if (!objId) return null;

              return {
                id: objId,
                name: item.name || "",
                type: item.type || "",
                cost_amount: Number(item.cost_amount) || 0,
                unit: item.unit || "",
                total_cost: String(item.total_cost || item.cost_amount || "0"),
                stage: item.stage || "",
                sub_stage: item.sub_stage || "",
              };
            })
            .filter(Boolean)
        : [];
    }

    /* ================= FILES ================= */

    const BASE_URL = `${req.protocol}://${req.get("host")}`;

    const uploadedFiles =
      req.files?.map((file) => ({
        name: file.originalname,
        size: file.size,
        type: file.mimetype,
        url: `${BASE_URL}/uploads/jobCasting/${file.filename}`,
        category: payload.file_category || "output",
        version: payload.file_version || "1.0",
        revision: Number(payload.file_revisions || 0),
        uploaded_at: new Date(),
      })) || [];

    stage.data.files = [...(stage.data.files || []), ...uploadedFiles];

    /* ================= COMPLETE ================= */

    if (["approved", "completed"].includes(incomingStatus)) {
      stage.completed_at = new Date();
    }

    /* ================= 🔥 NEXT STAGE FLOW ================= */

    if (
      ["approved", "completed"].includes(incomingStatus) &&
      prevStatus !== incomingStatus
    ) {
      const flow = {
        DESIGN: "CAD",
        CAD: "CASTING",
        CASTING: "FILING",
        FILING: "POLISHING",
        POLISHING: "QUALITY",
        QUALITY: "PACKAGING",
      };

      const nextDepartment = flow[stage.department.toUpperCase()];

      if (nextDepartment) {
        await JobCard.findByIdAndUpdate(stage.job_card_id, {
          stage: nextDepartment.toLowerCase(),
          current_department: nextDepartment,
          status: "in_progress",
        });

        const exists = await JobCardStage.findOne({
          job_card_id: stage.job_card_id,
          department: nextDepartment,
        });

        if (!exists) {
          await JobCardStage.create({
            job_card_id: stage.job_card_id,
            department: nextDepartment,
            status: "pending",
            start_date: new Date(),
            data: { files: [] },
          });
        }
      }
    }

    stage.markModified("data");
    await stage.save({ validateBeforeSave: false });

    /* ================= RESPONSE ================= */

    const populated = await JobCardStage.findById(stage._id)
      .populate("assigned_to", "name mobile email")
      .populate("job_card_id", "job_card_no stage status")
      .populate("data.selected_labor_costs", "name cost_amount")
      .lean();

    return res.json({
      success: true,
      message: "Casting stage updated successfully",
      data: populated,
      files: populated?.data?.files || [],
    });
  } catch (error) {
    console.error("updateCastingStage error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};






export const updateFilingStage = async (req, res) => {
  try {
    const { stageId } = req.params;
    const payload = req.body;

    const stage = await JobCardStage.findById(stageId);

    if (!stage || stage.department !== "FILING") {
      return res.status(404).json({
        success: false,
        message: "Filing stage not found",
      });
    }

    /* ================= HELPERS ================= */

    const safeParse = (val) => {
      if (typeof val === "string") {
        try {
          return JSON.parse(val);
        } catch {
          return val;
        }
      }
      return val;
    };

    const toObjectId = (val) => {
      if (!val) return null;

      if (typeof val === "object" && val._id)
        return new mongoose.Types.ObjectId(val._id);

      if (typeof val === "string" && mongoose.Types.ObjectId.isValid(val))
        return new mongoose.Types.ObjectId(val);

      return null;
    };

    /* ================= STATUS ================= */

    const prevStatus = stage.status;
    const incomingStatus = payload.status
      ? payload.status.toLowerCase()
      : stage.status;

    /* ================= ROOT ================= */

    stage.assigned_to = payload.assigned_to ?? stage.assigned_to;
    stage.status = incomingStatus ?? stage.status;

    if (payload.start_date)
      stage.start_date = new Date(payload.start_date);

    if (payload.end_date)
      stage.end_date = new Date(payload.end_date);

    stage.remarks = payload.remarks ?? stage.remarks;

    stage.data = stage.data || {};

    /* ================= NUMBER FIELDS ================= */

    const numberFields = [
      "labour_hours",
      "actual_hours",
      "preparation_time",
      "rough_filing_time",
      "fine_filing_time",
      "polishing_time",
      "quality_check_time",
      "total_time_spent",
      "material_cost",
      "labour_cost",
      "equipment_cost",
      "consumables_cost",
      "other_costs",
      "total_cost",
      "markup_percentage",
      "final_price",
      "file_revisions",
    ];

    numberFields.forEach((k) => {
      if (payload[k] !== undefined) {
        stage.data[k] = Number(payload[k]);
      }
    });

    /* ================= STRING FIELDS ================= */

    const stringFields = [
      "filing_type",
      "filing_tools_used",
      "surface_finish",
      "roughness_level",
      "tolerance_level",
      "defects_removed",
      "rework_reason",
      "time_breakdown",
      "file_version",
      "file_status",
      "backup_location",
      "cost_currency",
      "cost_status",
      "stage",
    ];

    stringFields.forEach((k) => {
      if (payload[k] !== undefined) {
        stage.data[k] = payload[k];
      }
    });

    if (payload.rework_required !== undefined) {
      stage.data.rework_required =
        payload.rework_required === true ||
        payload.rework_required === "true";
    }

    /* ================= LABOR ================= */

    if (payload.selected_labor_costs !== undefined) {
      const parsed = safeParse(payload.selected_labor_costs);

      stage.data.selected_labor_costs = Array.isArray(parsed)
        ? parsed.map((id) => toObjectId(id)).filter(Boolean)
        : [];
    }

    if (payload.labor_cost_breakdown !== undefined) {
      const parsed = safeParse(payload.labor_cost_breakdown);

      stage.data.labor_cost_breakdown = Array.isArray(parsed)
        ? parsed.map((item) => ({
            id: toObjectId(item.id || item._id),
            name: item.name || "",
            type: item.type || "",
            cost_amount: Number(item.cost_amount) || 0,
            unit: item.unit || "",
            total_cost: String(item.total_cost || item.cost_amount || "0"),
            stage: item.stage || "",
            sub_stage: item.sub_stage || "",
          }))
        : [];
    }

    /* ================= FILE UPLOAD ================= */

    const BASE_URL = `${req.protocol}://${req.get("host")}`;

    const uploadedFiles =
      req.files?.map((file) => ({
        name: file.originalname,
        size: file.size,
        type: file.mimetype,
        url: `${BASE_URL}/uploads/jobFiling/${file.filename}`,
        category: payload.file_category || "output",
        version: payload.file_version || "1.0",
        revision: Number(payload.file_revisions || 0),
        uploaded_at: new Date(),
      })) || [];

    stage.data.files = [...(stage.data.files || []), ...uploadedFiles];

    /* ================= COMPLETE ================= */

    if (["approved", "completed"].includes(incomingStatus)) {
      stage.completed_at = new Date();
    }

    /* ================= NEXT STAGE FLOW ================= */

    if (
      ["approved", "completed"].includes(incomingStatus)){
    
  
      const flow = {
        DESIGN: "CAD",
        CAD: "CASTING",
        CASTING: "FILING",
        FILING: "SETTING",   // 🔥 FIXED
        SETTING: "POLISHING", // 🔥 FIXED
        POLISHING: "PLATING",
        PLATING: "QUALITY",
        QUALITY: "PACKAGING",
      };

      const nextDepartment = flow[stage.department.toUpperCase()];

      if (nextDepartment) {
        await JobCard.findByIdAndUpdate(stage.job_card_id, {
          stage: nextDepartment.toLowerCase(),
          current_department: nextDepartment,
          status: "in_progress",
        });

        const exists = await JobCardStage.findOne({
          job_card_id: stage.job_card_id,
          department: nextDepartment,
        });

        if (!exists) {
          await JobCardStage.create({
            job_card_id: stage.job_card_id,
            department: nextDepartment,
            status: "pending",
            start_date: new Date(),
            data: { files: [] },
          });
        }else{
           console.log("⚠️ next stage already exists");
        }
      }
    }

    stage.markModified("data");
    await stage.save({ validateBeforeSave: false });

    /* ================= RESPONSE ================= */

    const populated = await JobCardStage.findById(stage._id)
      .populate("assigned_to", "name mobile email")
      .populate("job_card_id", "job_card_no stage status")
      .populate("data.selected_labor_costs", "name cost_amount")
      .lean();

    return res.json({
      success: true,
      message: "Filing stage updated successfully",
      data: populated,
      files: populated?.data?.files || [],
    });

  } catch (error) {
    console.error("updateFilingStage error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

