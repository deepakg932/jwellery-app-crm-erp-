
import JobCardStage from "../Models/models/JobCardStage.js";
import DesignStage from "../Models/models/DesignStage.js";
import JobCard from "../Models/models/JobCard.js";

import { generateInvoiceNumber } from "../helper/generateInvoiceNumber.js";
import deductFromStockIn from "../helper/deductFromPurchaseOrder.js"




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

   
    stage.assigned_to = payload.assigned_to ?? stage.assigned_to;
    stage.status = payload.status ?? stage.status;
    stage.start_date = payload.start_date
      ? new Date(payload.start_date)
      : stage.start_date;
    stage.end_date = payload.end_date
      ? new Date(payload.end_date)
      : stage.end_date;
    stage.remarks = payload.remarks ?? stage.remarks;

  
    stage.data = {
      ...(stage.data || {}),
      ...payload,
    };
    stage.markModified("data");

    if (payload.stage) {
      const nextStage = payload.stage.toLowerCase(); 

      await JobCard.findByIdAndUpdate(stage.job_card_id, {
        stage: nextStage,
        current_department: nextStage.toUpperCase(),
        status: "in_progress",
      });

      
      const existingNextStage = await JobCardStage.findOne({
        job_card_id: stage.job_card_id,
        department: nextStage.toUpperCase(), 
      });

      if (!existingNextStage) {
        await JobCardStage.create({
          job_card_id: stage.job_card_id,
          department: nextStage.toUpperCase(),
          status: "pending",
          assigned_to: null,
          data: {},
        });
      }
    }

    if (
      payload.status === "completed" ||
      payload.status === "finalized"
    ) {
      stage.completed_at = new Date();
    }

    await stage.save({ validateBeforeSave: false });

    const populated = await JobCardStage.findById(stage._id)
      .populate("assigned_to", "name mobile email")
      .populate("job_card_id", "job_card_no stage status")
      .lean();

    return res.json({
      success: true,
      message: "CAD stage updated successfully",
      data: populated,
    });
  } catch (error) {
    console.error("updateCadStage error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



export const updatedesignStage = async (req, res) => {
  try {
    const { stageId } = req.params;
    console.log(stageId,"stageId")
    const payload = req.body;
    console.log(payload,"payload")

    const stage = await JobCardStage.findById(stageId);
    console.log(stage,"stage")
    if (!stage || stage.department !== "Design") {
      return res.status(404).json({success: false,message: "Design stage not found",});
    }



    console.log("REQ FILES =>", req.files);
    const prevStatus = stage.status;


    if (payload.assigned_to !== undefined)
      stage.assigned_to = payload.assigned_to;

    if (payload.status !== undefined)
      stage.status = payload.status;

    if (payload.remarks !== undefined)
      stage.remarks = payload.remarks;

    if (payload.start_date)
      stage.start_date = new Date(payload.start_date);

    if (payload.end_date)
      stage.end_date = new Date(payload.end_date);


    let existingFiles = [];
    if (payload.existing_files) {
      try {
        const parsed =
          typeof payload.existing_files === "string"
            ? JSON.parse(payload.existing_files)
            : payload.existing_files;

        if (Array.isArray(parsed)) existingFiles = parsed;
      } catch {
        existingFiles = [];
      }
    }

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
        // category: payload.file_category || "output",
        // version: payload.file_version || "1.0",
        // revision: payload.file_revisions || 0,
        // uploaded_at: new Date(),
      })) || [];

    const oldFiles = Array.isArray(stage.data?.files)
      ? stage.data.files
      : [];


    stage.data = {
      ...(stage.data || {}),
      ...(payload.data || payload),
      files: [...oldFiles, ...existingFiles, ...uploadedFiles],
    };

    stage.markModified("data");

  
    if (
      payload.status === "approved" &&
      prevStatus !== "approved"
    ) {
      stage.completed_at = new Date();


      const existingCadStage = await JobCardStage.findOne({
        job_card_id: stage.job_card_id,
        department: "CAD",
      });

      if (!existingCadStage) {
        await JobCardStage.create({
          job_card_id: stage.job_card_id,
          department: "CAD",
          status: "pending",
          assigned_to: null,
          data: {},
        });
      }

    
      await JobCard.findByIdAndUpdate(stage.job_card_id, {
        stage: "cad",
        current_department: "CAD",
        status: "in_progress",
      });
    }

    await stage.save({ validateBeforeSave: false });

    const populatedStage = await JobCardStage.findById(stage._id)
      .populate("assigned_to", "name mobile email")
      .populate("job_card_id", "job_card_no stage status")
      .lean();

    return res.json({
      success: true,
      message: "Design stage updated successfully",
      data: populatedStage,
    });
  } catch (error) {
    console.error("updatedesignStage error:", error);
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

  
    if (payload.assigned_to !== undefined)
      stage.assigned_to = payload.assigned_to;

    if (payload.status !== undefined)
      stage.status = payload.status;

    if (payload.start_date)
      stage.start_date = new Date(payload.start_date);

    if (payload.end_date)
      stage.end_date = new Date(payload.end_date);

    if (payload.remarks !== undefined)
      stage.remarks = payload.remarks;

    if (payload.status === "completed") {
      stage.completed_at = new Date();
    }

    const BASE_URL = `${req.protocol}://${req.get("host")}`;
    const incomingFiles = Array.isArray(req.files) ? req.files : [];

    const uploadedFiles = incomingFiles.map((file) => ({
      name: file.originalname,
      size: file.size,
      type: file.mimetype,
      url: `${BASE_URL}/uploads/jobFiling/${file.filename}`,
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
      files,
      ...dataPayload
    } = payload;

    stage.data = {
      ...(stage.data || {}),
      ...dataPayload,
    };

    if (uploadedFiles.length) {
      stage.data.files = [
        ...(stage.data.files || []),
        ...uploadedFiles,
      ];
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

  
    const obj = stage.toObject();
    const dataOnly = obj.data;
    delete obj.data;

    return res.json({
      success: true,
      message: "Filing stage updated successfully",
      data: {
        ...obj,
        ...dataOnly,
        files: dataOnly?.files || [],
      },
    });
  } catch (error) {
    console.error("updateFilingStage error:", error);
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
    // if (!stage || stage.department !== "SETTING") {
    //   return res.status(404).json({
    //     success: false,
    //     message: "Stone setting stage not found",
    //   });
    // }

    if (payload.assigned_to !== undefined)
      stage.assigned_to = payload.assigned_to;

    if (payload.status !== undefined)
      stage.status = payload.status;

    if (payload.start_date)
      stage.start_date = new Date(payload.start_date);

    if (payload.end_date)
      stage.end_date = new Date(payload.end_date);

    if (payload.remarks !== undefined)
      stage.remarks = payload.remarks;

    if (payload.status === "completed") {
      stage.completed_at = new Date();
    }

  
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
      stage.data.files = [
        ...(stage.data.files || []),
        ...uploadedFiles,
      ];
    }


    // await deductFromPurchaseOrder({
    //   inventory_item_id: payload.stone_id,
    //   used_qty: payload.stone_quantity || 0,
    //   used_weight: payload.stone_carat || 0,
    // });





     await deductFromPurchaseOrder({
      inventory_item_id: payload.stone_id,
      used_qty: Number(payload.stone_quantity || 0),
      wastage_qty: Number(payload.stone_breakage || 0),
      wastage_weight: 0,
      // used_qty: payload.stone_quantity || 0,
      // used_weight: payload.stone_carat || 0,
    });

    stage.markModified("data");
    await stage.save({ validateBeforeSave: false });


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
          data: {},
        });
      }
    }


    const obj = stage.toObject();

    return res.json({
      success: true,
      message: "Stone setting stage updated successfully",
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
    console.error("updateStoneSettingStage error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// export const updateCastingStage = async (req, res) => {
//   try {
//     const { stageId } = req.params;
//     const payload = req.body;

//     const stage = await JobCardStage.findById(stageId);
//     if (!stage || stage.department !== "CASTING") {
//       return res.status(404).json({
//         success: false,
//         message: "Casting stage not found",
//       });
//     }

//     stage.assigned_to = payload.assigned_to ?? stage.assigned_to;
//     stage.status = payload.status ?? stage.status;
//     stage.start_date = payload.start_date
//       ? new Date(payload.start_date)
//       : stage.start_date;
//     stage.end_date = payload.end_date
//       ? new Date(payload.end_date)
//       : stage.end_date;
//     stage.remarks = payload.remarks ?? stage.remarks;

//     if (payload.status === "completed") {
//       stage.completed_at = new Date();
//     }

    
//     const BASE_URL = `${req.protocol}://${req.get("host")}`;
//     const incomingFiles = Array.isArray(req.files) ? req.files : [];

//     const uploadedFiles = incomingFiles.map((file) => ({
//       name: file.originalname,
//       size: file.size,
//       type: file.mimetype,
//       url: `${BASE_URL}/uploads/jobCasting/${file.filename}`,
//       category: payload.file_category || "output",
//       version: payload.file_version || "1.0",
//       revision: Number(payload.file_revisions || 0),
//       uploaded_at: new Date(),
//     }));

//     const oldFiles = Array.isArray(stage.data?.files)
//       ? stage.data.files
//       : [];

//     stage.data = {
//       ...(stage.data || {}),
//       ...payload,



//       files:
//         uploadedFiles.length > 0
//           ? [...oldFiles, ...uploadedFiles]
//           : oldFiles,
//     };

//     //  await deductFromPurchaseOrder({
//     //   inventory_item_id: payload.material_id,
//     //   used_qty: payload.material_used_qty || 0,
//     //   used_weight: payload.material_used_weight || 0,
//     // });


// // await deductFromStockIn({
// //   inventory_item_id: payload.material_id,
// //   used_qty: payload.material_used_qty || 0,
// //   used_weight: payload.material_used_weight || 0,
// //   wastage_qty: payload.material_wastage_qty || 0,
// //   wastage_weight: payload.material_wastage_weight || 0,
// // });




//     stage.markModified("data");
//     await stage.save({ validateBeforeSave: false });

    
//     if (payload.stage) {
//       const nextDept = payload.stage.toUpperCase(); 

   
//       await JobCard.findByIdAndUpdate(stage.job_card_id, {
//         stage: payload.stage.toLowerCase(), 
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
//           start_date: null,
//           end_date: null,
//           data: {},
//         });
//       }
//     }

//     const populated = await JobCardStage.findById(stage._id)
//       .populate("assigned_to", "name mobile email")
//       .populate("job_card_id", "job_card_no stage status")
//       .lean();

//     return res.json({
//       success: true,
//       message: "Casting stage updated successfully",
//       data: populated,
//       files: populated?.data?.files || [],
//     });
//   } catch (error) {
//     console.error("updateCastingStage error:", error);
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

export const updatePolishingStage = async (req, res) => {
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

    if (payload.assigned_to !== undefined)
      stage.assigned_to = payload.assigned_to;

    if (payload.status !== undefined)
      stage.status = payload.status;

    if (payload.start_date)
      stage.start_date = new Date(payload.start_date);

    if (payload.end_date)
      stage.end_date = new Date(payload.end_date);

    if (payload.remarks !== undefined)
      stage.remarks = payload.remarks;

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

    stage.data = {
      ...(stage.data || {}),
      ...dataFields,
    };

    if (uploadedFiles.length) {
      stage.data.files = [
        ...(stage.data.files || []),
        ...uploadedFiles,
      ];
    }

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

    if (payload.status !== undefined)
      stage.status = payload.status;

    if (payload.start_date)
      stage.start_date = new Date(payload.start_date);

    if (payload.end_date)
      stage.end_date = new Date(payload.end_date);

    if (payload.remarks !== undefined)
      stage.remarks = payload.remarks;

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
      files,
      ...dataFields
    } = payload;

    stage.data = stage.data || {};
    Object.assign(stage.data, dataFields);

   
    if (!Array.isArray(stage.data.files)) {
      stage.data.files = [];
    }

    if (uploadedFiles.length) {
      stage.data.files.push(...uploadedFiles);
    }

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

    if (payload.status !== undefined)
      stage.status = payload.status;

    if (payload.start_date)
      stage.start_date = new Date(payload.start_date);

    if (payload.end_date)
      stage.end_date = new Date(payload.end_date);

    if (payload.status === "completed") {
      stage.completed_at = new Date();
    }

    const cleanPayload = { ...payload };
    delete cleanPayload.files;      
    delete cleanPayload.next_stage;  
    delete cleanPayload.stage;       

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

      stage.data.files = [
        ...(stage.data.files || []),
        ...uploadedFiles,
      ];
    }

    stage.markModified("data");
    await stage.save({ validateBeforeSave: false });

    const nextStage =
      payload.next_stage || payload.stage; 

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
 return   res.status(500).json({
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

    if (payload.status !== undefined)
      stage.status = payload.status;

    if (payload.start_date)
      stage.start_date = new Date(payload.start_date);

    if (payload.end_date)
      stage.end_date = new Date(payload.end_date);

    if (payload.remarks !== undefined)
      stage.remarks = payload.remarks;

    if (payload.status === "completed")
      stage.completed_at = new Date();


    const cleanPayload = { ...payload };
    delete cleanPayload.files;
    delete cleanPayload.source_files;
    delete cleanPayload.output_files;

    const nextStage =
      cleanPayload.stage || cleanPayload.next_stage || null;

    delete cleanPayload.stage;
    delete cleanPayload.next_stage;


    stage.data = {
      ...(stage.data || {}),
      ...cleanPayload,
    };

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

      stage.data.files = [
        ...(stage.data.files || []),
        ...uploadedFiles,
      ];
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

export const updateCastingStage = async (req, res) => {
  try {
    const { stageId } = req.params;
    const payload = req.body;

    console.log("REQ BODY", req.body);

    const stage = await JobCardStage.findById(stageId);
    if (!stage || stage.department !== "CASTING") {
      return res.status(404).json({
        success: false,
        message: "Casting stage not found",
      });
    }

    stage.assigned_to = payload.assigned_to ?? stage.assigned_to;
    stage.status = payload.status ?? stage.status;
    stage.start_date = payload.start_date
      ? new Date(payload.start_date)
      : stage.start_date;
    stage.end_date = payload.end_date
      ? new Date(payload.end_date)
      : stage.end_date;
    stage.remarks = payload.remarks ?? stage.remarks;

    if (payload.status === "completed") {
      stage.completed_at = new Date();
    }

    
    const BASE_URL = `${req.protocol}://${req.get("host")}`;
    const incomingFiles = Array.isArray(req.files) ? req.files : [];

    const uploadedFiles = incomingFiles.map((file) => ({
      name: file.originalname,
      size: file.size,
      type: file.mimetype,
      url: `${BASE_URL}/uploads/jobCasting/${file.filename}`,
      category: payload.file_category || "output",
      version: payload.file_version || "1.0",
      revision: Number(payload.file_revisions || 0),
      uploaded_at: new Date(),
    }));

    const oldFiles = Array.isArray(stage.data?.files)
      ? stage.data.files
      : [];

    stage.data = {
      ...(stage.data || {}),
      ...payload,



      files:
        uploadedFiles.length > 0
          ? [...oldFiles, ...uploadedFiles]
          : oldFiles,
    };

    //  await deductFromPurchaseOrder({
    //   inventory_item_id: payload.material_id,
    //   used_qty: payload.material_used_qty || 0,
    //   used_weight: payload.material_used_weight || 0,
    // });


// await deductFromStockIn({
//   inventory_item_id: payload.material_id,
//   used_qty: payload.material_used_qty || 0,
//   used_weight: payload.material_used_weight || 0,
//   wastage_qty: payload.material_wastage_qty || 0,
//   wastage_weight: payload.material_wastage_weight || 0,

// });

await deductFromStockIn({
  inventory_item_id: payload.material_id,
   used_qty: 0,
  wastage_qty: 0,


  // used_weight: Number(payload.usedWeight || 0),
  used_weight: Number(payload.material_used_qty || 0),  

  wastage_weight: Number(payload.material_wastage_qty || 0),


  // wastage_qty: payload.isWeightBased ? 0 : Number(payload.material_wastage_qty || 0),

  // wastage_weight: payload.isWeightBased
  //   ? Number(payload.material_wastage_weight || 0)
  //   : 0,
});






    stage.markModified("data");
    await stage.save({ validateBeforeSave: false });

    
    if (payload.stage) {
      const nextDept = payload.stage.toUpperCase(); 

   
      await JobCard.findByIdAndUpdate(stage.job_card_id, {
        stage: payload.stage.toLowerCase(), 
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

    const populated = await JobCardStage.findById(stage._id)
      .populate("assigned_to", "name mobile email")
      .populate("job_card_id", "job_card_no stage status")
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


