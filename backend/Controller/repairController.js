
import Repair from "../Models/models/Repair.js";
import Customer from "../Models/models/Customer.js";
import Sale from "../Models/models/SalesOrder.js";
import Employee from "../Models/models/EmployeeModel.js";
import Product from "../Models/models/ProductModel.js"
import { generateRepairNumber } from "../helper/generateRepairNumber.js";
import { generateInvoiceNumber } from "../helper/generateInvoiceNumber.js";
import Invoice from "../Models/models/Invoice.js";
import path from "path";
import fs from 'fs'


// export const createRepair = async (req, res) => {
//   try {
//     const {
//       customer_id,
//       sale_item_id,
//       product_id,
//       product_name,
//       product_module,
//       problem_description,
//       repair_charge,
//       paid_amount = 0,
//       receiving_date,
//       delivery_date,
//       employee_id,
//       status = "pending",
//       account = "cash",
//       note,
//     } = req.body;

//     const customer = await Customer.findById(customer_id);
//     if (!customer) {
//       return res.status(404).json({success: false, message: "Customer not found", });
//     }

  
//     if (product_id) {
//       const product = await Product.findById(product_id);
//       if (!product) {
//         return res.status(404).json({success: false,message: "Product not found"});
//       }
//     }

//     const due_amount =
//       Number(repair_charge) - Number(paid_amount);

//     if (due_amount < 0) {
//       return res.status(400).json({ success: false, message: "Paid amount cannot exceed repair charge",});
//     }

//     const payment_status =
//       paid_amount === 0
//         ? "unpaid"
//         : due_amount > 0
//         ? "partial"
//         : "paid";

 
//     const repair = await Repair.create({
//       repair_number: await generateRepairNumber(),
//       customer_id,
//       sale_item_id: sale_item_id || null,
//       product_id: product_id || null,
//       product_name,
//       product_module,
//       problem_description,
//       repair_charge,
//       paid_amount,
//       due_amount,
//       payment_status,
//       receiving_date,
//       delivery_date,
//       employee_id,
//       status,
//       account,
//       note,
//       created_by: req.user?._id,
//     });

 
//     const invoice = await Invoice.create({
//       invoice_number: await generateInvoiceNumber(),
//       repair_id: repair._id,
//       customer_id,
//       items: [
//         {
//           name: product_name || "Repair Service",
//           quantity: 1,
//           price: repair_charge,
//           total: repair_charge,
//         },
//       ],
//       subtotal: repair_charge,
//       total_amount: repair_charge,
//       paid_amount,
//       balance_amount: due_amount,
//       payment_status,
//       created_by: req.user?._id,
//     });


//     const populatedRepair = await Repair.findById(repair._id)
//       .populate("customer_id", "name mobile")
//       .populate("product_id", "product_name product_code")
//       .populate("employee_id", "name");

//     return res.status(201).json({ success: true, message: "Repair & Invoice created successfully", data: {   ...populatedRepair.toObject(),


//         has_invoice: true,
//         invoice_id: invoice._id,
//         invoice_number: invoice.invoice_number,
//       },
//     });

//   } catch (error) {
//     console.error("Create Repair Error:", error);
//     return res.status(500).json({success: false,message: error.message,});
//   }
// };


export const listRepairs = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", status } = req.query;

    const filter = {};

    if (status) filter.status = status;

    if (search) {
      filter.$or = [
        { repair_number: { $regex: search, $options: "i" } },
        { product_name: { $regex: search, $options: "i" } },
      ];
    }

    const repairs = await Repair.find(filter)
      .populate("customer_id", "name mobile")
      .populate("employee_id", "name")
      .populate({
        path: "invoice",
        select: "invoice_number payment_status total_amount",
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Repair.countDocuments(filter);

    return res.status(200).json({
      success: true,
      data: repairs,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        total_pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return res.status(500).json({success: false,message: error.message,});
  }
};






// export const updateRepair = async (req, res) => {
//   try {
//     const { id } = req.params;
//     console.log("Update Repair ID:", id)

//     const {
//       product_name,
//       product_module,
//       problem_description,
//       repair_charge,
//       paid_amount,
//       customer_id,
//       receiving_date,
//       delivery_date,
//       employee_id,
//       status,
//       account,
//       note,
//     } = req.body;
//     console.log("Update Repair Request Body:", req.body)

//     const repair = await Repair.findById(id);
//     console.log("Found repair:", repair)
//     if (!repair) {
//       return res.status(404).json({ success: false, message: "Repair not found", });
//     }

  
//     if (customer_id) {
//       const customer = await Customer.findById(customer_id);
//       if (!customer) {
//         return res.status(404).json({success: false,message: "Customer not found" });
//       }
//     }

//     if (employee_id) {
//       const employee = await Employee.findById(employee_id);
//       if (!employee) {
//         return res.status(404).json({success: false,message: "Employee not found", });
//       }
//     }

 
//     const finalRepairCharge =
//       repair_charge !== undefined ? Number(repair_charge) : repair.repair_charge;
//       console.log(finalRepairCharge,"okk")

//     const finalPaidAmount =
//       paid_amount !== undefined ? Number(paid_amount) : repair.paid_amount;
//       console.log(finalPaidAmount,"ppp")

//     if (finalPaidAmount > finalRepairCharge) {
//       return res.status(400).json({ success: false, message: "Paid amount cannot exceed repair charge" });
//     }

//     const dueAmount = finalRepairCharge - finalPaidAmount;

//     repair.product_name = product_name ?? repair.product_name;
//     repair.product_module = product_module ?? repair.product_module;
//     repair.problem_description =
//       problem_description ?? repair.problem_description;

//     repair.repair_charge = finalRepairCharge;
//     repair.paid_amount = finalPaidAmount;
//     repair.due_amount = dueAmount;

//     repair.customer_id = customer_id ?? repair.customer_id;
//     repair.receiving_date = receiving_date ?? repair.receiving_date;
//     repair.delivery_date = delivery_date ?? repair.delivery_date;
//     repair.employee_id = employee_id ?? repair.employee_id;
//     repair.status = status ?? repair.status;
//     repair.account = account ?? repair.account;
//     repair.note = note ?? repair.note;

//  const savedd =   await repair.save();
// console.log(savedd,"savedd")
//     const populatedRepair = await Repair.findById(repair._id)
//       .populate("customer_id", "name mobile")
//       .populate("employee_id", "name designation");

//     return res.status(200).json({success: true,message: "Repair updated successfully",data: populatedRepair,});
//   } catch (error) {
//     console.error("Update Repair Error:", error);
//     return res.status(500).json({success: false,message: error.message });
//   }
// };

export const deleteRepair = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Deleting repair with ID:", id);

    const repair = await Repair.findById(id);
    console.log("Found repair:", repair);
    if (!repair) {
      return res.status(404).json({ success: false, message: "Repair not found" });
    }

  let a7 = await Repair.findByIdAndDelete(id);
  console.log("Deleted repair:", a7)

    return res.status(200).json({ success: true, message: "Repair deleted successfully" });
  }

catch (error) {
    console.error("Delete Repair Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};




export const createRepair = async (req, res) => {
  try {
    const {
      customer_id,
      sale_item_id,
      product_id,
      product_name,
      product_module,
      problem_description,
      repair_charge,
      paid_amount = 0,
      receiving_date,
      delivery_date,
      employee_id,
      status = "pending",
      account = "cash",
      note,
    } = req.body;

    const customer = await Customer.findById(customer_id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    if (product_id) {
      const product = await Product.findById(product_id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }
    }

    const charge = Number(repair_charge);
    const paid = Number(paid_amount);

    const due_amount = charge - paid;
    if (due_amount < 0) {
      return res.status(400).json({
        success: false,
        message: "Paid amount cannot exceed repair charge",
      });
    }

    const payment_status =
      paid === 0 ? "unpaid" : due_amount > 0 ? "partial" : "paid";

    // 🔥 IMAGE URLS
    let imageUrls = [];
    if (req.files?.length) {
      imageUrls = req.files.map(
        (file) =>
          `${process.env.APP_URL}/uploads/repairs/${file.filename}`
      );
    }

    const repair = await Repair.create({
      repair_number: await generateRepairNumber(),
      customer_id,
      sale_item_id: sale_item_id || null,
      product_id: product_id || null,
      product_name,
      product_module,
      problem_description,

      repair_images: imageUrls, // 🔥 save images

      repair_charge: charge,
      paid_amount: paid,
      due_amount,
      payment_status,
      receiving_date,
      delivery_date,
      employee_id,
      status,
      account,
      note,
      created_by: req.user?._id,
    });

    const invoice = await Invoice.create({
      invoice_number: await generateInvoiceNumber(),
      repair_id: repair._id,
      customer_id,
      items: [
        {
          name: product_name || "Repair Service",
          quantity: 1,
          price: charge,
          total: charge,
        },
      ],
      subtotal: charge,
      total_amount: charge,
      paid_amount: paid,
      balance_amount: due_amount,
      payment_status,
      created_by: req.user?._id,
    });

    const populatedRepair = await Repair.findById(repair._id)
      .populate("customer_id", "name mobile")
      .populate("product_id", "product_name product_code")
      .populate("employee_id", "name");

    return res.status(201).json({
      success: true,
      message: "Repair & Invoice created successfully",
      data: {
        ...populatedRepair.toObject(),
        has_invoice: true,
        invoice_id: invoice._id,
        invoice_number: invoice.invoice_number,
      },
    });
  } catch (error) {
    console.error("Create Repair Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



export const updateRepair = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      product_name,
      product_module,
      problem_description,
      repair_charge,
      paid_amount,
      customer_id,
      receiving_date,
      delivery_date,
      employee_id,
      status,
      account,
      note,
      remove_images = [],
    } = req.body;

    const repair = await Repair.findById(id);
    if (!repair) {
      return res.status(404).json({ success: false, message: "Repair not found" });
    }

    /* ================= AMOUNT ================= */
    const finalRepairCharge =
      repair_charge !== undefined ? Number(repair_charge) : repair.repair_charge;

    const finalPaidAmount =
      paid_amount !== undefined ? Number(paid_amount) : repair.paid_amount;

    if (finalPaidAmount > finalRepairCharge) {
      return res.status(400).json({
        success: false,
        message: "Paid amount cannot exceed repair charge",
      });
    }

    const dueAmount = finalRepairCharge - finalPaidAmount;
    const payment_status =
      finalPaidAmount === 0 ? "unpaid" : dueAmount > 0 ? "partial" : "paid";

    /* ================= IMAGE FIX ================= */
    let images = [];

    const removeList = Array.isArray(remove_images)
      ? remove_images
      : remove_images
      ? [remove_images]
      : [];

    // 🔥 CASE 1: NEW IMAGE UPLOADED → OLD DELETE ALL
    if (req.files?.length) {
      // delete all old images from disk
      repair.repair_images?.forEach((img) => {
        const filePath = img.replace(process.env.APP_URL, "");
        const fullPath = path.join(process.cwd(), filePath);
        if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
      });

      images = req.files.map(
        (file) => `${process.env.APP_URL}/uploads/repairs/${file.filename}`
      );
    }

    // 🔥 CASE 2: NO NEW IMAGE, BUT REMOVE SELECTED
    else {
      images = [...(repair.repair_images || [])];

      removeList.forEach((imgUrl) => {
        const filePath = imgUrl.replace(process.env.APP_URL, "");
        const fullPath = path.join(process.cwd(), filePath);
        if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
      });

      images = images.filter((img) => !removeList.includes(img));
    }

    /* ================= UPDATE FIELDS ================= */
    repair.product_name = product_name ?? repair.product_name;
    repair.product_module = product_module ?? repair.product_module;
    repair.problem_description =
      problem_description ?? repair.problem_description;

    repair.repair_charge = finalRepairCharge;
    repair.paid_amount = finalPaidAmount;
    repair.due_amount = dueAmount;
    repair.payment_status = payment_status;

    repair.customer_id = customer_id ?? repair.customer_id;
    repair.receiving_date = receiving_date ?? repair.receiving_date;
    repair.delivery_date = delivery_date ?? repair.delivery_date;
    repair.employee_id = employee_id ?? repair.employee_id;
    repair.status = status ?? repair.status;
    repair.account = account ?? repair.account;
    repair.note = note ?? repair.note;

    repair.repair_images = images;

    await repair.save();

    const populatedRepair = await Repair.findById(repair._id)
      .populate("customer_id", "name mobile")
      .populate("employee_id", "name designation");

    return res.status(200).json({
      success: true,
      message: "Repair updated successfully",
      data: populatedRepair,
    });
  } catch (error) {
    console.error("Update Repair Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

