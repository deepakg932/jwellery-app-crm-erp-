
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









export const createJobCard = async (req, res) => {
  try {
    const payload = req.body;

    /* =========================
       1️⃣ PARSE ITEMS
    ========================= */
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

    /* =========================
       2️⃣ QUOTATION (OPTIONAL)
    ========================= */
    if (payload.quotation_id) {
      const quotation = await Quotation.findById(payload.quotation_id);
      if (!quotation) {
        return res.status(404).json({ message: "Quotation not found" });
      }
      quotation.status = "converted";
      await quotation.save();
    }

    /* =========================
       3️⃣ ITEMS + PRODUCT VALIDATION
    ========================= */
    const finalItems = [];

    for (const item of items) {
      let product = null;

      if (item.product_id) {
        product = await Product.findById(item.product_id);
      } else if (item.product_code) {
        product = await Product.findOne({ product_code: item.product_code });
      }

      // if (!product) {
      //   return res.status(400).json({
      //     success: false,
      //     message: `Invalid product: ${
      //       item.product_name || item.product_code || "Unknown"
      //     }`,
      //   });
      // }

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

    /* =========================
       4️⃣ CALCULATIONS
    ========================= */
    const totalAmount = round2(
      finalItems.reduce((sum, i) => sum + i.total_amount, 0)
    );

    const advanceAmount = round2(payload.advance_amount || 0);
    const balanceAmount = round2(
      Math.max(totalAmount - advanceAmount, 0)
    );

    /* =========================
       5️⃣ STAGE LOGIC (CREATE)
    ========================= */
    let stage = "not started";

    if (payload.status === "approved") {
      stage = "design stage pending";
    } else if (payload.status === "in_progress") {
      stage = "design in progress";
    } else if (payload.status === "completed") {
      stage = "design completed";
    }

    /* =========================
       6️⃣ IMAGES
    ========================= */
    const imagePaths =
      req.files?.map((f) => `/uploads/jobCards/${f.filename}`) || [];

    /* =========================
       7️⃣ CREATE JOB CARD
    ========================= */
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

      stage, // ✅ IMPORTANT

      total_amount: totalAmount,
      advance_amount: advanceAmount,
      balance_amount: balanceAmount,

      assigned_to: payload.assigned_to || null,
      images: imagePaths,
    });

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


// export const updateJobCard = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const payload = req.body;

//     /* =========================
//        0️⃣ CHECK JOB CARD
//     ========================= */
//     const existingJobCard = await JobCard.findById(id);
//     if (!existingJobCard) {
//       return res.status(404).json({
//         success: false,
//         message: "Job Card not found",
//       });
//     }

//     /* =========================
//        1️⃣ PARSE ITEMS (IMPORTANT)
//     ========================= */
//     const items = payload.items
//       ? typeof payload.items === "string"
//         ? JSON.parse(payload.items)
//         : payload.items
//       : null;

//     /* =========================
//        2️⃣ QUOTATION (OPTIONAL)
//     ========================= */
//     if (
//       payload.quotation_id &&
//       String(payload.quotation_id) !== String(existingJobCard.quotation_id)
//     ) {
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
//     let finalItems = existingJobCard.items;

//     if (items && Array.isArray(items)) {
//       finalItems = [];

//       for (const item of items) {
//         let product = null;

//         if (item.product_id) {
//           product = await Product.findById(item.product_id);
//         } else if (item.product_code) {
//           product = await Product.findOne({ product_code: item.product_code });
//         }

//         // ❌ product must exist
//         if (!product) {
//           return res.status(400).json({
//             success: false,
//             message: `Invalid product: ${
//               item.product_name || item.product_code || "Unknown"
//             }`,
//           });
//         }

//         const qty = Number(item.quantity) || 1;
//         const price = Number(item.unit_price) || 0;

//         finalItems.push({
//           product_id: product._id,
//           product_code: product.product_code,
//           product_name: product.product_name,
//           description: item.description || "",
//           quantity: qty,
//           unit_price: price,
//           total_amount: round2(qty * price),
//           notes: item.notes || "",
//         });
//       }
//     }

//     /* =========================
//        4️⃣ CALCULATIONS
//     ========================= */
//     const totalAmount = round2(
//       finalItems.reduce((sum, i) => sum + i.total_amount, 0)
//     );

//     const advanceAmount = round2(
//       payload.advance_amount ?? existingJobCard.advance_amount ?? 0
//     );

//     const balanceAmount = round2(
//       Math.max(totalAmount - advanceAmount, 0)
//     );

//     /* =========================
//        5️⃣ IMAGES (OPTIONAL UPDATE)
//     ========================= */
//     if (req.files?.length) {
//       existingJobCard.images = req.files.map(
//         (f) => `/uploads/jobCards/${f.filename}`
//       );
//     }

//     /* =========================
//        6️⃣ UPDATE FIELDS
//     ========================= */
//     existingJobCard.quotation_id =
//       payload.quotation_id ?? existingJobCard.quotation_id;

//     existingJobCard.quotation_number =
//       payload.quotation_number ?? existingJobCard.quotation_number;

//     existingJobCard.customer_id =
//       payload.customer_id ?? existingJobCard.customer_id;

//     existingJobCard.job_card_date =
//       payload.job_card_date ?? existingJobCard.job_card_date;

//     existingJobCard.expected_delivery_date =
//       payload.expected_delivery_date ??
//       existingJobCard.expected_delivery_date;

//     existingJobCard.delivery_date =
//       payload.delivery_date ?? existingJobCard.delivery_date;

//     existingJobCard.items = finalItems;

//     existingJobCard.note = payload.note ?? existingJobCard.note;
//     existingJobCard.instructions =
//       payload.instructions ?? existingJobCard.instructions;

//     existingJobCard.priority =
//       payload.priority ?? existingJobCard.priority;

//     existingJobCard.status = payload.status ?? existingJobCard.status;

//     existingJobCard.total_amount = totalAmount;
//     existingJobCard.advance_amount = advanceAmount;
//     existingJobCard.balance_amount = balanceAmount;

//     existingJobCard.assigned_to =
//       payload.assigned_to ?? existingJobCard.assigned_to;

//     await existingJobCard.save();

//     /* =========================
//        7️⃣ POPULATED RESPONSE
//     ========================= */
//     const populated = await JobCard.findById(existingJobCard._id)
//       .populate("assigned_to", "name employee_code mobile")
//       .populate(
//         "items.product_id",
//         "product_name product_code selling_price_with_gst"
//       );

//     return res.json({
//       success: true,
//       message: "Job Card updated successfully",
//       data: populated,
//     });
//   } catch (error) {
//     console.error("Update Job Card Error:", error);
//     return res.status(400).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };



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

  existingJobCard.stage = "design stage";
  // const firstStage = await DesignStage.findOne({ is_active: true })
  //   .sort({ order: 1 });

  // if (!firstStage) {
  //   return res.status(400).json({
  //     success: false,
  //     message: "No Design Stage configured"
  //   });
  // }

  const exists = await JobCardStage.findOne({
    job_card_id: existingJobCard._id,
    // stage_id: firstStage._id,
  });

  if (!exists) {
    await JobCardStage.create({
      job_card_id: existingJobCard._id,
      // stage_id: firstStage._id,
      // stage_name: firstStage.stage_name,
      department: "Design",
      status: "in_progress",
      start_date: new Date(),
      data: {},
    });
  }
}



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





export const getDesignStageJobs = async (req, res) => {
  try {
    const jobs = await JobCard.find({
      status: { $in: ["approved", "in_progress"] },
    })
      .populate("customer_id", "name mobile")
      .populate("assigned_to", "name employee_code")
      .sort({ createdAt: -1 });

    const result = await Promise.all(
      jobs.map(async (job) => {
        const designStage = await JobCardStage.findOne({
          job_card_id: job._id,
          status: "in_progress",
        }).populate("stage_id", "stage_name image order");

        return {
          ...job.toObject(),
          design_stage: designStage || null,
        };
      })
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
