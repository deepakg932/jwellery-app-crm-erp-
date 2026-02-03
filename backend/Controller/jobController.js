
import JobCard from "../Models/models/JobCard.js";
import Employee from "../Models/models/EmployeeModel.js";
import Quotation from "../Models/models/QuatationModel.js";
// import StageMaster from "../Models/models/StageMaster.js"
import JobCardStage from "../Models/models/JobCardStage.js"
import Product from "../Models/models/ProductModel.js";
import { generateProductCode } from "../helper/generateProductCode.js";
import { round2 } from "../helper/round2.js";
import DesignStage from "../Models/models/DesignStage.js";






const generateJobCardNo = async () => {
  const count = await JobCard.countDocuments();
  return `JC-${String(count + 1).padStart(5, "0")}`;
};

// export const createJobCard = async (req, res) => {
//   try {
//     const payload = req.body;


//     const items =
//       typeof payload.items === "string"
//         ? JSON.parse(payload.items)
//         : payload.items;

//     if (!Array.isArray(items) || items.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Items are required",
//       });
//     }

//     if (payload.quotation_id) {
//       const quotation = await Quotation.findById(payload.quotation_id);
//       if (!quotation) {
//         return res.status(404).json({ message: "Quotation not found" });
//       }
//       quotation.status = "converted";
//       await quotation.save();
//     }

   
//     const finalItems = [];

//     for (const item of items) {
//       let product = null;

//       if (item.product_id) {
//         product = await Product.findById(item.product_id);
//       } else if (item.product_code) {
//         product = await Product.findOne({ product_code: item.product_code });
//       }

 
//       if (!product) {
//         return res.status(400).json({
//           success: false,
//           message: `Invalid product: ${item.product_name || item.product_code || "Unknown"}`,
//         });
//       }

//       const qty = Number(item.quantity) || 1;
//       const price = Number(item.unit_price) || 0;

//       finalItems.push({
//         product_id: product._id,
//         product_code: product.product_code,
//         product_name: product.product_name,
//         description: item.description || "",
//         quantity: qty,
//         unit_price: price,
//         total_amount: qty * price,
//         notes: item.notes || "",
//       });
//     }

  
//     const totalAmount = round2(
//       finalItems.reduce((sum, i) => sum + i.total_amount, 0)
//     );

//     const advanceAmount = round2(payload.advance_amount || 0);
//     const balanceAmount = round2(
//       Math.max(totalAmount - advanceAmount, 0)
//     );


//     const imagePaths =
//       req.files?.map((f) => `/uploads/jobCards/${f.filename}`) || [];


//     const jobCard = await JobCard.create({
//       job_card_no: await generateJobCardNo(),
//       quotation_id: payload.quotation_id || null,
//       quotation_number: payload.quotation_number || null,
//       customer_id: payload.customer_id || null,
//       job_card_date: payload.job_card_date,
//       expected_delivery_date: payload.expected_delivery_date,
//       delivery_date: payload.delivery_date || null,
//       items: finalItems,
//       note: payload.note || "",
//       instructions: payload.instructions || "",
//       priority: payload.priority || "medium",
//       status: payload.status || "pending",
//       total_amount: totalAmount,
//       advance_amount: advanceAmount,
//       balance_amount: balanceAmount,
//       assigned_to: payload.assigned_to || null,
//       images: imagePaths,
//     });




// //     const firstStage = await StageMaster.findOne({
// //   stage_code: "STG001",
// //   is_active: true,
// // });

// // await JobCardStage.create({
// //   job_card_id: jobCard._id,
// //   stage_code: firstStage.stage_code,
// //   stage_name: firstStage.stage_name,
// //   department: firstStage.department,
// //   status: "in_progress",
// //   start_date: new Date(),
// // });



//     const populated = await JobCard.findById(jobCard._id)
//       .populate("assigned_to", "name employee_code mobile")
//       .populate(
//         "items.product_id",
//         "product_name product_code selling_price_with_gst"
//       );

//     return res.status(201).json({
//       success: true,
//       message: "Job Card created successfully",
//       data: populated,
//     });
//   } catch (error) {
//     console.error("Create Job Card Error:", error);
//     return res.status(400).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };









// export const createJobCard = async (req, res) => {
//   try {
//     const payload = req.body;

//     /* =========================
//        1️⃣ PARSE ITEMS
//     ========================= */
//     const items =
//       typeof payload.items === "string"
//         ? JSON.parse(payload.items)
//         : payload.items;

//     if (!Array.isArray(items) || items.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Items are required",
//       });
//     }

//     /* =========================
//        2️⃣ QUOTATION (OPTIONAL)
//     ========================= */
//     if (payload.quotation_id) {
//       const quotation = await Quotation.findById(payload.quotation_id);
//       if (!quotation) {
//         return res.status(404).json({ message: "Quotation not found" });
//       }
//       quotation.status = "converted";
//       await quotation.save();
//     }

//     /* =========================
//        3️⃣ ITEMS + PRODUCT VALIDATION
//     ========================= */
//     const finalItems = [];

//     for (const item of items) {
//       let product = null;

//       if (item.product_id) {
//         product = await Product.findById(item.product_id);
//       } else if (item.product_code) {
//         product = await Product.findOne({ product_code: item.product_code });
//       }

//       // if (!product) {
//       //   return res.status(400).json({
//       //     success: false,
//       //     message: `Invalid product: ${
//       //       item.product_name || item.product_code || "Unknown"
//       //     }`,
//       //   });
//       // }

//       const qty = Number(item.quantity) || 1;
//       const price = Number(item.unit_price) || 0;

//       finalItems.push({
//         product_id: product._id,
//         product_code: product.product_code,
//         product_name: product.product_name,
//         description: item.description || "",
//         quantity: qty,
//         unit_price: price,
//         total_amount: qty * price,
//         notes: item.notes || "",
//       });
//     }

//     /* =========================
//        4️⃣ CALCULATIONS
//     ========================= */
//     const totalAmount = round2(
//       finalItems.reduce((sum, i) => sum + i.total_amount, 0)
//     );

//     const advanceAmount = round2(payload.advance_amount || 0);
//     const balanceAmount = round2(
//       Math.max(totalAmount - advanceAmount, 0)
//     );

//     /* =========================
//        5️⃣ STAGE LOGIC (CREATE)
//     ========================= */
//     let stage = "not started";

//     if (payload.status === "approved") {
//       stage = "design stage pending";
//     } else if (payload.status === "in_progress") {
//       stage = "design in progress";
//     } else if (payload.status === "completed") {
//       stage = "design completed";
//     }

//     /* =========================
//        6️⃣ IMAGES
//     ========================= */
//     const imagePaths =
//       req.files?.map((f) => `/uploads/jobCards/${f.filename}`) || [];

//     /* =========================
//        7️⃣ CREATE JOB CARD
//     ========================= */
//     const jobCard = await JobCard.create({
//       job_card_no: await generateJobCardNo(),
//       quotation_id: payload.quotation_id || null,
//       quotation_number: payload.quotation_number || null,
//       customer_id: payload.customer_id || null,

//       job_card_date: payload.job_card_date,
//       expected_delivery_date: payload.expected_delivery_date,
//       delivery_date: payload.delivery_date || null,

//       items: finalItems,
//       note: payload.note || "",
//       instructions: payload.instructions || "",

//       priority: payload.priority || "medium",
//       status: payload.status || "pending",

//       stage, // ✅ IMPORTANT

//       total_amount: totalAmount,
//       advance_amount: advanceAmount,
//       balance_amount: balanceAmount,

//       assigned_to: payload.assigned_to || null,
//       images: imagePaths,
//     });

//     const populated = await JobCard.findById(jobCard._id)
//       .populate("assigned_to", "name employee_code mobile")
//       .populate("items.product_id", "product_name product_code");

//     return res.status(201).json({
//       success: true,
//       message: "Job Card created successfully",
//       data: populated,
//     });
//   } catch (error) {
//     console.error("Create Job Card Error:", error);
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };



export const getJobCards = async (req, res) => {
  try {
    const jobCards = await JobCard.find()
      .populate("customer_id")
      // .populate("branch_id")
      .populate("assigned_to")
      .populate("items.product_id")
      .populate("images")
      .sort({ createdAt: -1 });

   return res.json({success: true,data: jobCards,});
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};




export const assignKarigar = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { karigarId } = req.body;

    const karigar = await Employee.findById(karigarId);
    if (!karigar) {
      return res.status(404).json({ message: "Karigar not found" });
    }

    const job = await JobCard.findByIdAndUpdate(
      jobId,
      {
        assignedKarigar: karigarId,
        status: "in_progress",
      },
      { new: true }
    ).populate("assigned_to", "name mobile employee_code");

    res.json(job);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};




export const deleteJobCard = async (req, res) => {
  try {
    const { id } = req.params;

    const jobCard = await JobCard.findById(id);
    if (!jobCard) {
      return res.status(404).json({
        success: false,
        message: "Job Card not found",
      });
    }

    await JobCard.findByIdAndDelete(id);

    return res.json({
      success: true,
      message: "Job Card deleted successfully",
    });
  } catch (error) {
    console.error("Delete Job Card Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};




export const updateJobCard = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body;

    const existingJobCard = await JobCard.findById(id);
    if (!existingJobCard) {
      return res.status(404).json({
        success: false,
        message: "Job Card not found",
      });
    }

    const items = payload.items
      ? typeof payload.items === "string"
        ? JSON.parse(payload.items)
        : payload.items
      : null;

  
    let finalItems = existingJobCard.items;

    if (items && Array.isArray(items)) {
      finalItems = [];

      for (const item of items) {
        let product = null;

        if (item.product_id) {
          product = await Product.findById(item.product_id);
        } else if (item.product_code) {
          product = await Product.findOne({ product_code: item.product_code });
        }

        if (!product) {
          return res.status(400).json({
            success: false,
            message: `Invalid product: ${
              item.product_name || item.product_code || "Unknown"
            }`,
          });
        }

        const qty = Number(item.quantity) || 1;
        const price = Number(item.unit_price) || 0;

        finalItems.push({
          product_id: product._id,
          product_code: product.product_code,
          product_name: product.product_name,
          description: item.description || "",
          quantity: qty,
          unit_price: price,
          total_amount: round2(qty * price),
          notes: item.notes || "",
        });
      }
    }

    
    const totalAmount = round2(
      finalItems.reduce((sum, i) => sum + i.total_amount, 0)
    );

    const advanceAmount = round2(
      payload.advance_amount ?? existingJobCard.advance_amount ?? 0
    );

    const balanceAmount = round2(
      Math.max(totalAmount - advanceAmount, 0)
    );



if (payload.status === "approved") {
  existingJobCard.status = "in_progress"; // 🔥 IMPORTANT
  existingJobCard.stage = "design";

  const exists = await JobCardStage.findOne({
    job_card_id: existingJobCard._id,
     status: "in_progress",
    
    
  });

  if (!exists) {
    await JobCardStage.create({
      job_card_id: existingJobCard._id,
       department: "Design",
      // department: existingJobCard?.department,
       assigned_to: existingJobCard.assigned_to,
      status: "in_progress",
      start_date: new Date(),
      data: {},
    });
  }
}





 
// if (payload.status === "approved") {

//   existingJobCard.stage = "design stage";
//   // const firstStage = await DesignStage.findOne({ is_active: true })
//   //   .sort({ order: 1 });

//   // if (!firstStage) {
//   //   return res.status(400).json({
//   //     success: false,
//   //     message: "No Design Stage configured"
//   //   });
//   // }

//   const exists = await JobCardStage.findOne({
//     job_card_id: existingJobCard._id,
//     // stage_id: firstStage._id,
//   });

//   if (!exists) {
//     await JobCardStage.create({
//       job_card_id: existingJobCard._id,
//       // stage_id: firstStage._id,
//       // stage_name: firstStage.stage_name,
//       department: "Design",
//       status: "in_progress",
//       start_date: new Date(),
//       data: {},
//     });
//   }
// }



    existingJobCard.status =
      payload.status ?? existingJobCard.status;

    existingJobCard.items = finalItems;
    existingJobCard.note = payload.note ?? existingJobCard.note;
    existingJobCard.instructions =
      payload.instructions ?? existingJobCard.instructions;
    existingJobCard.priority =
      payload.priority ?? existingJobCard.priority;

    existingJobCard.total_amount = totalAmount;
    existingJobCard.advance_amount = advanceAmount;
    existingJobCard.balance_amount = balanceAmount;

    if (req.files?.length) {
      existingJobCard.images = req.files.map(
        (f) => `/uploads/jobCards/${f.filename}`
      );
    }

    await existingJobCard.save();

    const populated = await JobCard.findById(existingJobCard._id)
      .populate("assigned_to", "name employee_code mobile")
      .populate("items.product_id", "product_name product_code");

    return res.json({
      success: true,
      message: "Job Card updated successfully",
      data: populated,
    });
  } catch (error) {
    console.error("Update Job Card Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};





export const createJobCard = async (req, res) => {
  try {
    const payload = req.body;

   
    const items =
      typeof payload.items === "string"
        ? JSON.parse(payload.items)
        : payload.items;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Items are required",
      });
    }

    
    if (payload.quotation_id) {
      const quotation = await Quotation.findById(payload.quotation_id);
      if (!quotation) {
        return res.status(404).json({ message: "Quotation not found" });
      }
      quotation.status = "converted";
      await quotation.save();
    }

    const finalItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product_id);

      if (!product) {
        return res.status(400).json({
          success: false,
          message: "Invalid product",
        });
      }

      const qty = Number(item.quantity) || 1;
      const price = Number(item.unit_price) || 0;

      finalItems.push({
        product_id: product._id,
        product_code: product.product_code,
        product_name: product.product_name,
        description: item.description || "",
        quantity: qty,
        unit_price: price,
        total_amount: qty * price,
        notes: item.notes || "",
      });
    }

  
    const totalAmount = round2(
      finalItems.reduce((sum, i) => sum + i.total_amount, 0)
    );

    const advanceAmount = round2(payload.advance_amount || 0);
    const balanceAmount = round2(
      Math.max(totalAmount - advanceAmount, 0)
    );

    
    const imagePaths =
      req.files?.map((f) => `/uploads/jobCards/${f.filename}`) || [];

    let stage = "not started";

    if (payload.status === "approved") {
      stage = "design stage";
    }

    const jobCard = await JobCard.create({
      job_card_no: await generateJobCardNo(),
      quotation_id: payload.quotation_id || null,
      quotation_number: payload.quotation_number || null,
      customer_id: payload.customer_id || null,

      job_card_date: payload.job_card_date,
      expected_delivery_date: payload.expected_delivery_date,
      delivery_date: payload.delivery_date || null,

      items: finalItems,
      note: payload.note || "",
      instructions: payload.instructions || "",

      priority: payload.priority || "medium",
      status: payload.status || "pending",
      stage,

      total_amount: totalAmount,
      advance_amount: advanceAmount,
      balance_amount: balanceAmount,

      assigned_to: payload.assigned_to || null,
      images: imagePaths,
    });

   
    if (payload.status === "approved") {
      await JobCardStage.create({
        job_card_id: jobCard._id,
       department: "Design",
        status: "in_progress",
        start_date: new Date(),
        assigned_to: payload.assigned_to || null,
        data: {},
      });
       jobCard.stage = "design";
  jobCard.status = "in_progress";
  await jobCard.save();
    }

    const populated = await JobCard.findById(jobCard._id)
      .populate("assigned_to", "name employee_code mobile")
      .populate("items.product_id", "product_name product_code");

    return res.status(201).json({
      success: true,
      message: "Job Card created successfully",
      data: populated,
    });
  } catch (error) {
    console.error("Create Job Card Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};







export const getDesignStageJobs = async (req, res) => {
  try {
    const data = await JobCard.aggregate([
      {
        $match: {},
      },

      {
        $lookup: {
          from: "jobcardstages",
          let: { jobCardId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$job_card_id", "$$jobCardId"] },
                    { $eq: ["$department", "Design"] },
                  ],
                },
              },
            },
            {
              $lookup: {
                from: "employees",
                localField: "assigned_to",
                foreignField: "_id",
                as: "assigned_to",
              },
            },
            {
              $unwind: {
                path: "$assigned_to",
                preserveNullAndEmptyArrays: true,
              },
            },
          ],
          as: "design_stage",
        },
      },

      {
        $unwind: "$design_stage",
      },

      /* 🔥 CLEAN RESPONSE (ONLY REQUIRED FIELDS) */
      {
        $project: {
          _id: 1,
          job_card_no: 1,
          stage: 1,
          status: 1,

          design_stage: {
            _id: "$design_stage._id",
            department: "$design_stage.department",
            status: "$design_stage.status",
            remarks: "$design_stage.remarks",
            start_date: "$design_stage.start_date",
            end_date: "$design_stage.end_date",
            completed_at: "$design_stage.completed_at",

            assigned_to: {
              _id: "$design_stage.assigned_to._id",
              name: "$design_stage.assigned_to.name",
              mobile: "$design_stage.assigned_to.mobile",
              email: "$design_stage.assigned_to.email",
            },

            /* TIME */
            estimated_hours: "$design_stage.data.estimated_hours",
            actual_hours: "$design_stage.data.actual_hours",
            preparation_time: "$design_stage.data.preparation_time",
            processing_time: "$design_stage.data.processing_time",
            finishing_time: "$design_stage.data.finishing_time",
            inspection_time: "$design_stage.data.inspection_time",
            packaging_time: "$design_stage.data.packaging_time",
            total_time_spent: "$design_stage.data.total_time_spent",

            /* COST */
            material_cost: "$design_stage.data.material_cost",
            labor_cost: "$design_stage.data.labor_cost",
            tooling_cost: "$design_stage.data.tooling_cost",
            machine_cost: "$design_stage.data.machine_cost",
            other_costs: "$design_stage.data.other_costs",
            total_cost: "$design_stage.data.total_cost",
            markup_percentage: "$design_stage.data.markup_percentage",
            final_price: "$design_stage.data.final_price",
            cost_currency: "$design_stage.data.cost_currency",
            cost_status: "$design_stage.data.cost_status",

            /* DESIGN */
            design_notes: "$design_stage.data.design_notes",
            design_specifications: "$design_stage.data.design_specifications",

            /* FILES */
            files: { $ifNull: ["$design_stage.data.files", []] },

            createdAt: "$design_stage.createdAt",
            updatedAt: "$design_stage.updatedAt",
          },
        },
      },

      {
        $sort: { "design_stage.updatedAt": -1 },
      },
    ]);

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("getDesignStageJobs error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};





export const getCadStageJobs = async (req, res) => {
  try {
    const data = await JobCard.aggregate([
      /* 🔥 ONLY FILTER BY STATUS (NOT STAGE) */
      {
        $match: {
          status: { $in: ["approved", "in_progress"] },
        },
      },

      /* CAD STAGE LOOKUP */
      {
        $lookup: {
          from: "jobcardstages",
          let: { jobCardId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$job_card_id", "$$jobCardId"] },
                    { $eq: ["$department", "CAD"] }, // 🔥 MAIN FILTER
                  ],
                },
              },
            },
            {
              $lookup: {
                from: "employees",
                localField: "assigned_to",
                foreignField: "_id",
                as: "assigned_to",
              },
            },
            {
              $unwind: {
                path: "$assigned_to",
                preserveNullAndEmptyArrays: true,
              },
            },
          ],
          as: "cad_stage",
        },
      },

      /* CAD STAGE MUST EXIST */
      { $unwind: "$cad_stage" },

      /* JOBCARD ASSIGNED TO */
      {
        $lookup: {
          from: "employees",
          localField: "assigned_to",
          foreignField: "_id",
          as: "job_assigned_to",
        },
      },
      {
        $unwind: {
          path: "$job_assigned_to",
          preserveNullAndEmptyArrays: true,
        },
      },

      /* FINAL RESPONSE */
      {
        $project: {
          job_card_id: "$_id",
          job_card_no: 1,
          job_card_date: 1,
          expected_delivery_date: 1,
          delivery_date: 1,
          priority: 1,
          images: 1,
          stage: 1,              // 🔥 CURRENT STAGE (casting / assembly)
          status: 1,
          createdAt: 1,

          assigned_to: {
            _id: "$job_assigned_to._id",
            name: "$job_assigned_to.name",
            mobile: "$job_assigned_to.mobile",
            email: "$job_assigned_to.email",
          },

          cad_stage_id: "$cad_stage._id",

          cad_stage: {
            _id: "$cad_stage._id",
            department: "$cad_stage.department",
            status: "$cad_stage.status",
            start_date: "$cad_stage.start_date",
            end_date: "$cad_stage.end_date",
            completed_at: "$cad_stage.completed_at",
            remarks: "$cad_stage.remarks",

            assigned_to: {
              _id: "$cad_stage.assigned_to._id",
              name: "$cad_stage.assigned_to.name",
              mobile: "$cad_stage.assigned_to.mobile",
              email: "$cad_stage.assigned_to.email",
            },

            data: "$cad_stage.data",
          },
        },
      },

      { $sort: { createdAt: -1 } },
    ]);

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("getCadStageJobs error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};




export const getCastingStageJobs = async (req, res) => {
  try {
    const data = await JobCardStage.aggregate([
      /* 1️⃣ ONLY CASTING STAGES */
      {
        $match: {
          department: "CASTING",
        },
      },

      /* 2️⃣ JOBCARD */
      {
        $lookup: {
          from: "jobcards",
          localField: "job_card_id",
          foreignField: "_id",
          as: "job_card",
        },
      },
      { $unwind: "$job_card" },

      /* 3️⃣ ASSIGNED TO */
      {
        $lookup: {
          from: "employees",
          localField: "assigned_to",
          foreignField: "_id",
          as: "casting_assigned_to",
        },
      },
      {
        $unwind: {
          path: "$casting_assigned_to",
          preserveNullAndEmptyArrays: true,
        },
      },

      /* 4️⃣ FINAL RESPONSE */
      {
        $project: {
          _id: 1,

          job_card: {
            _id: "$job_card._id",
            job_card_no: "$job_card.job_card_no",
            stage: "$job_card.stage",
            status: "$job_card.status",
            priority: "$job_card.priority",
            images: "$job_card.images",
          },

          casting_stage_id: "$_id",

          casting_stage: {
            status: "$status",
            start_date: "$start_date",
            end_date: "$end_date",
            completed_at: "$completed_at",
            remarks: "$remarks",

            // 🔥 DATA OBJECT
            data: "$data",

            // 🔥 FILES DIRECT (THIS WAS MISSING)
            files: { $ifNull: ["$data.files", []] },

            assigned_to: {
              _id: "$casting_assigned_to._id",
              name: "$casting_assigned_to.name",
              mobile: "$casting_assigned_to.mobile",
            },
          },
        },
      },

      { $sort: { createdAt: -1 } },
    ]);

    return res.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error("getCastingStageJobs error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



export const getFilingStageJobs = async (req, res) => {
  try {
    const data = await JobCardStage.aggregate([
      { $match: { department: "FILING" } },

      {
        $lookup: {
          from: "jobcards",
          localField: "job_card_id",
          foreignField: "_id",
          as: "job_card",
        },
      },
      { $unwind: "$job_card" },

      {
        $lookup: {
          from: "employees",
          localField: "assigned_to",
          foreignField: "_id",
          as: "assigned_employee",
        },
      },
      {
        $unwind: {
          path: "$assigned_employee",
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $project: {
          filing_stage_id: "$_id",

          job_card: {
            _id: "$job_card._id",
            job_card_no: "$job_card.job_card_no",
            stage: "$job_card.stage",
            status: "$job_card.status",
            priority: "$job_card.priority",
          },

          filing_stage: {
            status: "$status",
            start_date: "$start_date",
            end_date: "$end_date",
            completed_at: "$completed_at",
            remarks: "$remarks",

            // 🔥 SINGLE SOURCE OF TRUTH
            data: "$data",

            assigned_to: {
              _id: "$assigned_employee._id",
              name: "$assigned_employee.name",
              mobile: "$assigned_employee.mobile",
            },
          },

          createdAt: 1,
        },
      },

      { $sort: { createdAt: -1 } },
    ]);

    return res.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error("getFilingStageJobs error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};




export const getStoneSettingStageJobs = async (req, res) => {
  try {
    const data = await JobCardStage.aggregate([
      /* 1️⃣ ONLY STONE SETTING */
      {
        $match: {
          department: "SETTING",
        },
      },

      /* 2️⃣ JOBCARD */
      {
        $lookup: {
          from: "jobcards",
          localField: "job_card_id",
          foreignField: "_id",
          as: "job_card",
        },
      },
      {
        $unwind: {
          path: "$job_card",
          preserveNullAndEmptyArrays: false,
        },
      },

      /* 3️⃣ ASSIGNED KARIGAR (STONE SETTER) */
      {
        $lookup: {
          from: "employees",
          localField: "assigned_to",
          foreignField: "_id",
          as: "assigned_employee",
        },
      },
      {
        $unwind: {
          path: "$assigned_employee",
          preserveNullAndEmptyArrays: true,
        },
      },

      /* 4️⃣ FINAL RESPONSE */
      {
        $project: {
          stone_stage_id: "$_id",

          job_card: {
            _id: "$job_card._id",
            job_card_no: "$job_card.job_card_no",
            stage: "$job_card.stage",
            status: "$job_card.status",
            priority: "$job_card.priority",
            images: "$job_card.images",
          },

          stone_setting_stage: {
            status: "$status",
            start_date: "$start_date",
            end_date: "$end_date",
            completed_at: "$completed_at",
            remarks: "$remarks",

            // 🔥 SINGLE SOURCE OF TRUTH
            data: "$data",

            assigned_to: {
              _id: "$assigned_employee._id",
              name: "$assigned_employee.name",
              mobile: "$assigned_employee.mobile",
              email: "$assigned_employee.email",
            },
          },

          createdAt: 1,
        },
      },

      { $sort: { createdAt: -1 } },
    ]);

    return res.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error("getStoneSettingStageJobs error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



export const getPolishingStageJobs = async (req, res) => {
  try {
    const data = await JobCardStage.aggregate([
      /* 1️⃣ ONLY POLISHING */
      { $match: { department: "POLISHING" } },

      /* 2️⃣ JOBCARD */
      {
        $lookup: {
          from: "jobcards",
          localField: "job_card_id",
          foreignField: "_id",
          as: "job_card",
        },
      },
      { $unwind: "$job_card" },

      /* 3️⃣ ASSIGNED POLISHER */
      {
        $lookup: {
          from: "employees",
          localField: "assigned_to",
          foreignField: "_id",
          as: "assigned_employee",
        },
      },
      {
        $unwind: {
          path: "$assigned_employee",
          preserveNullAndEmptyArrays: true,
        },
      },

      /* 4️⃣ FINAL RESPONSE */
      {
        $project: {
          polishing_stage_id: "$_id",

          job_card: {
            _id: "$job_card._id",
            job_card_no: "$job_card.job_card_no",
            stage: "$job_card.stage",
            status: "$job_card.status",
            priority: "$job_card.priority",
            images: "$job_card.images",
          },

          polishing_stage: {
            status: "$status",
            start_date: "$start_date",
            end_date: "$end_date",
            completed_at: "$completed_at",
            remarks: "$remarks",

            // 🔥 SINGLE SOURCE
            data: "$data",

            assigned_to: {
              _id: "$assigned_employee._id",
              name: "$assigned_employee.name",
              mobile: "$assigned_employee.mobile",
              email: "$assigned_employee.email",
            },
          },

          createdAt: 1,
        },
      },

      { $sort: { createdAt: -1 } },
    ]);

    return res.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error("getPolishingStageJobs error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const getPlatingStageJobs = async (req, res) => {
  try {
    const data = await JobCardStage.aggregate([
      /* 1️⃣ ONLY PLATING STAGE */
      {
        $match: {
          department: "PLATING",
        },
      },

      /* 2️⃣ JOBCARD JOIN */
      {
        $lookup: {
          from: "jobcards",
          localField: "job_card_id",
          foreignField: "_id",
          as: "job_card",
        },
      },
      {
        $unwind: {
          path: "$job_card",
          preserveNullAndEmptyArrays: false,
        },
      },

      /* 3️⃣ ASSIGNED EMPLOYEE (PLATING KARIGAR) */
      {
        $lookup: {
          from: "employees",
          localField: "assigned_to",
          foreignField: "_id",
          as: "assigned_employee",
        },
      },
      {
        $unwind: {
          path: "$assigned_employee",
          preserveNullAndEmptyArrays: true,
        },
      },

      /* 4️⃣ FINAL RESPONSE SHAPE */
      {
        $project: {
          plating_stage_id: "$_id",

          job_card: {
            _id: "$job_card._id",
            job_card_no: "$job_card.job_card_no",
            stage: "$job_card.stage",
            status: "$job_card.status",
            priority: "$job_card.priority",
            images: "$job_card.images",
          },

          plating_stage: {
            status: "$status",
            start_date: "$start_date",
            end_date: "$end_date",
            completed_at: "$completed_at",
            remarks: "$remarks",

            // 🔥 SINGLE SOURCE OF TRUTH
            data: "$data",

            assigned_to: {
              _id: "$assigned_employee._id",
              name: "$assigned_employee.name",
              mobile: "$assigned_employee.mobile",
              email: "$assigned_employee.email",
            },
          },

          createdAt: 1,
        },
      },

      /* 5️⃣ LATEST FIRST */
      {
        $sort: { createdAt: -1 },
      },
    ]);

    return res.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error("getPlatingStageJobs error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getQualityStageJobs = async (req, res) => {
  try {
    const data = await JobCardStage.aggregate([
      /* 1️⃣ ONLY QUALITY CHECK STAGE */
      {
        $match: {
          department: "QUALITY_CHECK",
        },
      },

      /* 2️⃣ JOBCARD JOIN */
      {
        $lookup: {
          from: "jobcards",
          localField: "job_card_id",
          foreignField: "_id",
          as: "job_card",
        },
      },
      {
        $unwind: {
          path: "$job_card",
          preserveNullAndEmptyArrays: false,
        },
      },

      /* 3️⃣ ASSIGNED QC PERSON */
      {
        $lookup: {
          from: "employees",
          localField: "assigned_to",
          foreignField: "_id",
          as: "assigned_employee",
        },
      },
      {
        $unwind: {
          path: "$assigned_employee",
          preserveNullAndEmptyArrays: true,
        },
      },

      /* 4️⃣ FINAL RESPONSE */
      {
        $project: {
          quality_stage_id: "$_id",

          job_card: {
            _id: "$job_card._id",
            job_card_no: "$job_card.job_card_no",
            stage: "$job_card.stage",
            status: "$job_card.status",
            priority: "$job_card.priority",
            images: "$job_card.images",
          },

          quality_stage: {
            status: "$status",
            start_date: "$start_date",
            end_date: "$end_date",
            completed_at: "$completed_at",
            remarks: "$remarks",

            // 🔥 SINGLE SOURCE OF TRUTH
            data: "$data",

            assigned_to: {
              _id: "$assigned_employee._id",
              name: "$assigned_employee.name",
              mobile: "$assigned_employee.mobile",
              email: "$assigned_employee.email",
            },
          },

          createdAt: 1,
        },
      },

      /* 5️⃣ SORT LATEST FIRST */
      {
        $sort: { createdAt: -1 },
      },
    ]);

    return res.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error("getQualityStageJobs error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const getPackagesStageJobs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      search,
    } = req.query;

    const skip = (page - 1) * limit;

    /* ================= STAGE FILTER ================= */
    const stageFilter = {
      department: "PACKAGING",
    };

    if (status) {
      stageFilter.status = status;
    }

    /* ================= FETCH STAGES ================= */
    let stages = await JobCardStage.find(stageFilter)
      .populate({
        path: "job_card_id",
        select: "job_card_no client_name product_name status createdAt",
      })
      .populate({
        path: "assigned_to",
        select: "name employee_code department",
      })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    /* ================= SEARCH ================= */
    if (search) {
      const keyword = search.toLowerCase();
      stages = stages.filter((s) =>
        s.job_card_id?.job_card_no?.toLowerCase().includes(keyword) ||
        s.job_card_id?.client_name?.toLowerCase().includes(keyword) ||
        s.job_card_id?.product_name?.toLowerCase().includes(keyword)
      );
    }

    /* ================= FORMAT ================= */
    const formatted = stages.map((stage) => ({
      _id: stage._id,
      job_card_id: stage.job_card_id?._id,
      job_card_no: stage.job_card_id?.job_card_no,
      client_name: stage.job_card_id?.client_name,
      product_name: stage.job_card_id?.product_name,

      department: stage.department,
      status: stage.status,
      assigned_to: stage.assigned_to,

      start_date: stage.start_date,
      end_date: stage.end_date,
      completed_at: stage.completed_at,

      /* 🔥 PACKAGING DATA */
      data: stage.data || {},

      /* 🔥 FILES */
      files: stage.data?.files || [],

      createdAt: stage.createdAt,
      updatedAt: stage.updatedAt,
    }));

    /* ================= COUNT ================= */
    const total = await JobCardStage.countDocuments(stageFilter);

    res.json({
      success: true,
      message: "Packaging stage jobs fetched successfully",
      total,
      page: Number(page),
      limit: Number(limit),
      data: formatted,
    });
  } catch (error) {
    console.error("getPackagesStageJobs error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};









