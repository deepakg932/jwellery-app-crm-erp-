import Sale from "../Models/models/SalesOrder.js";
import Product from "../Models/models/ProductModel.js";
import { generateSaleReference } from "../helper/generateSaleReference.js";
import Invoice from "../Models/models/Invoice.js";
import { generateInvoiceNumber } from "../helper/generateInvoiceNumber.js";
import fs from "fs";
import path from "path";

import Unit from "../Models/models/unitModel.js";



// export const deliverSale = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const sale = await Sale.findById(id);
//     if (!sale) {
//       return res.status(404).json({
//         success: false,
//         message: "Sale not found",
//       });
//     }

//     sale.items.forEach(item => {
//       item.delivered_quantity = item.quantity;
//       item.status = "delivered";
//     });

//     sale.delivery_status = "delivered";
//     sale.sale_status = "completed";

//     await sale.save();

//     return res.json({
//       success: true,
//       message: "Sale delivered successfully",
//       data: sale,
//     });
//   } catch (error) {
//     console.error("Deliver Sale Error:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

export const listProductsForSale = async (req, res) => {
  try {
    const { search = "" } = req.query;
    console.log("Product List Search Query:", search);

    const query = {
      status: "active",
      $or: [
        { product_name: { $regex: search, $options: "i" } },
        { product_code: { $regex: search, $options: "i" } },
      ],
    };

    const products = await Product.find(query)
      .select(
        "product_name product_code selling_price_with_gst selling_price_before_tax gst_rate",
      )
      .sort({ product_name: 1 })
      .limit(50);
    console.log("Found Products:", products);

    return res.status(200).json({ success: true, data: products });
  } catch (error) {
    console.error("Product List Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// export const listSales = async (req, res) => {
//   try {
//     const sales = await Sale.find()
//       .sort({ createdAt: -1 })
//       .populate("customer_id", "name mobile")
//       .populate("branch_id", "branch_name branch_code")
//             .populate("sold_by", "name employee_code");

//     const saleIds = sales.map(s => s._id);

//     const invoices = await Invoice.find({
//       sale_id: { $in: saleIds },
//     });

//     const invoiceMap = {};
//     invoices.forEach(inv => {
//       invoiceMap[inv.sale_id.toString()] = inv;
//     });

//     const formattedSales = sales.map(sale => {
//       const total = Number(sale.total_amount || 0);
//       const paid = Number(sale.paid_amount || 0);

//       const invoice = invoiceMap[sale._id.toString()];

//       return {
//         ...sale.toObject(),
//         current_paid: paid,
//         balance_amount: total - paid,

//         // 🔥 UI KE LIYE
//         has_invoice: !!invoice,
//         invoice_id: invoice?._id || null,
//         invoice_number: invoice?.invoice_number || null,
//       };
//     });

//     res.status(200).json({ success: true, data: formattedSales });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

export const listSales = async (req, res) => {
  try {
    const BASE_URL = process.env.APP_URL || "http://localhost:3000";

    const sales = await Sale.find()
      .sort({ createdAt: -1 })
      .populate("customer_id", "name mobile")
      .populate("branch_id", "branch_name branch_code")
      .populate("sold_by", "name employee_code");

    const saleIds = sales.map((s) => s._id);

    const invoices = await Invoice.find({
      sale_id: { $in: saleIds },
    });

    const invoiceMap = {};
    invoices.forEach((inv) => {
      invoiceMap[inv.sale_id.toString()] = inv;
    });

    const formattedSales = sales.map((sale) => {
      const saleObj = sale.toObject();

      const total = Number(saleObj.total_amount || 0);
      const paid = Number(saleObj.paid_amount || 0);

      const invoice = invoiceMap[saleObj._id.toString()];

      /* ================= IMAGE URL FIX ================= */
      if (saleObj.exchange_details?.image) {
        saleObj.exchange_details.fullImageUrl = `${BASE_URL}${saleObj.exchange_details.image}`;
      }

      return {
        ...saleObj,
        current_paid: paid,
        balance_amount: total - paid,

        // 🔥 UI helpers
        has_invoice: !!invoice,
        invoice_id: invoice?._id || null,
        invoice_number: invoice?.invoice_number || null,
      };
    });

    return res.status(200).json({
      success: true,
      data: formattedSales,
    });
  } catch (err) {
    console.error("List Sales Error:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const getSaleById = async (req, res) => {
  try {
    const { id } = req.params;

    const sale = await Sale.findById(id)
      .populate("customer_id", "name mobile")
      .populate("branch_id", "branch_name branch_code")
      .populate("items.product_id", "product_name product_code");

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: "Sale not found",
      });
    }

    res.status(200).json({
      success: true,
      data: sale,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteSale = async (req, res) => {
  try {
    const { id } = req.params;

    const sale = await Sale.findById(id);
    if (!sale) {
      return res
        .status(404)
        .json({ success: false, message: "Sale not found" });
    }

    await Sale.findByIdAndDelete(id);

    return res
      .status(200)
      .json({ success: true, message: "Sale deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSalePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { paid_amount, payment_date, payment_method, payment_notes } =
      req.body;

    const sale = await Sale.findById(id);
    if (!sale) {
      return res
        .status(404)
        .json({ success: false, message: "Sale not found" });
    }

    if (sale.sale_status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Cannot update payment for cancelled sale",
      });
    }

    const totalAmount = Number(sale.total_amount || 0);
    const newTotalPaid = Number(paid_amount || 0);

    if (newTotalPaid < 0) {
      return res
        .status(400)
        .json({ success: false, message: "Paid amount cannot be negative" });
    }

    if (newTotalPaid > totalAmount) {
      return res.status(400).json({
        success: false,
        message: "Paid amount cannot exceed total amount",
      });
    }

    const balanceAmount = totalAmount - newTotalPaid;

    let finalPaymentStatus = "pending";
    if (newTotalPaid === 0) {
      finalPaymentStatus = "pending";
    } else if (balanceAmount > 0) {
      finalPaymentStatus = "partial";
    } else {
      finalPaymentStatus = "paid";
    }

    sale.paid_amount = newTotalPaid;
    sale.balance_amount = balanceAmount;
    sale.payment_status = finalPaymentStatus;
    sale.payment_date = payment_date;
    sale.payment_method = payment_method;
    sale.payment_notes = payment_notes;

    await sale.save();

    return res.status(200).json({
      success: true,
      message: "Payment updated successfully",
      data: {
        sale_id: sale._id,
        total_amount: totalAmount,
        paid_amount: newTotalPaid,
        balance_amount: balanceAmount,
        payment_status: finalPaymentStatus,
      },
    });
  } catch (error) {
    console.error("Update Payment Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};


export const createSale = async (req, res) => {
  try {
    console.log("=== CREATE SALE REQUEST ===");
    console.log("Request body:", req.body);
    console.log("Request file:", req.file);
    console.log("Request headers:", req.headers["content-type"]);

    let data = { ...req.body };

    if (data.items && typeof data.items === "string") {
      try {
        data.items = JSON.parse(data.items);
        console.log("Parsed items from JSON string:", data.items);
      } catch (parseError) {
        console.error("Error parsing items JSON:", parseError);
        return res.status(400).json({
          success: false,
          message: "Invalid items format",
        });
      }
    }

    data.is_exchange =
      data.is_exchange === true ||
      data.is_exchange === "true" ||
      data.is_exchange === "1";

    console.log("is_exchange value:", data.is_exchange);
    console.log("is_exchange type:", typeof data.is_exchange);

    if (data.status) {
      data.sale_status = data.status;
      delete data.status;
    }

    const BASE_URL = process.env.APP_URL || "http://localhost:3000";
    const reference_no = await generateSaleReference();

    let subtotal = 0;
    let totalTax = 0;

    if (!data.items || !Array.isArray(data.items)) {
      return res.status(400).json({
        success: false,
        message: "Items must be an array",
      });
    }

    console.log("Validating items:", data.items);

    for (const item of data.items) {
      console.log("Processing item:", item);

      if (!item.product_id) {
        return res.status(400).json({
          success: false,
          message: "Product ID is required for all items",
        });
      }

      const product = await Product.findById(item.product_id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found with ID: ${item.product_id}`,
        });
      }

      item.product_name = product.product_name;
      item.product_code = product.product_code;

      const quantity = Number(item.quantity) || 1;
      const finalTotal = Number(item.final_total) || 0;
      const gstAmount = Number(item.gst_amount) || 0;

      subtotal += finalTotal;
      totalTax += gstAmount * quantity;

      console.log(
        `Item ${item.product_code}: qty=${quantity}, finalTotal=${finalTotal}, gst=${gstAmount}`,
      );
    }

    const toNumber = (val) => {
      if (val === undefined || val === null || val === "") return 0;
      const num = Number(val);
      return Number.isFinite(num) ? num : 0;
    };

    /* ================= EXCHANGE ================= */
    let exchangeDetails = null;
    let exchangeAmount = 0;

    console.log("Checking exchange data:", {
      is_exchange: data.is_exchange,
      exchange_item_name: data.exchange_item_name,
      exchange_item_weight: data.exchange_item_weight,
      exchange_item_actual_rate: data.exchange_item_actual_rate,
      exchange_amount: data.exchange_amount,
      hasFile: !!req.file,
    });

    if (data.is_exchange === true) {
      // const unitId = data.exchange_unit_id;
      // console.log(unitId, "unitId");
      let unitDoc = null;

      if (data.exchange_item_unit) {
        unitDoc = await Unit.findById(data.exchange_item_unit);

        if (!unitDoc) {
          return res.status(400).json({
            success: false,
            message: "Invalid exchange unit",
          });
        }
      }

      const itemName = data.exchange_item_name?.trim();

      // const rawUnit = data.exchange_item_unit?.toLowerCase() || 'g';
    
      const rawWeight = toNumber(data.exchange_item_weight);
      const rawRate = toNumber(data.exchange_item_actual_rate);

      // console.log("Exchange item details:", {
      //   itemName,
      //   rawUnit,
      //   rawWeight,
      //   rawRate,
      //   exchangeAmount: data.exchange_amount,
      // });

      if (!itemName || rawWeight <= 0 || rawRate <= 0) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid exchange item data. Please provide item name, weight, and actual rate.",
        });
      }

      let weightInGram = rawWeight;
        if (unitDoc?.unit_code === "kg") {
    weightInGram = rawWeight * 1000;
  }
      // if (rawUnit === "kg") {
      //   weightInGram = rawWeight * 1000;
      // }

      const calculatedValue = weightInGram * rawRate;
      exchangeAmount = toNumber(data.exchange_amount) || calculatedValue;

        console.log("Exchange item details:", {
    itemName,
    rawWeight,
    rawRate,
    unit: unitDoc?.unit_code,
    weightInGram,
    calculatedValue,
  });
      let imagePath = null;
      if (req.file) {
        console.log("Processing uploaded file:", {
          filename: req.file.filename,
          originalname: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype,
          path: req.file.path,
        });

        // Ensure uploads directory exists
        const uploadDir = "uploads/exchange";
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Generate unique filename
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(req.file.originalname);
        const filename = `exchange-${uniqueSuffix}${ext}`;
        const filepath = path.join(uploadDir, filename);

        // Move file to permanent location
        fs.renameSync(req.file.path, filepath);

        imagePath = `/uploads/exchange/${filename}`;
        console.log("Saved image at:", imagePath);
      }

      exchangeDetails = {
        item_name: itemName,
        weight: rawWeight,
        // unit: rawUnit,
        // 🔥 IMPORTANT
        // 🔥 unit info (NO populate needed later)
    unit_id: unitDoc?._id || null,
    unit_name: unitDoc?.unit_name || unitDoc?.name,
    unit_code: unitDoc?.unit_code || unitDoc?.code,
        weight_in_gram: weightInGram,
        actual_rate: rawRate,
        calculated_value: calculatedValue,
        image: imagePath,
      };

      console.log("Exchange details saved:", exchangeDetails);
    }

    /* ================= TOTAL CALCULATION ================= */
    const shippingCost = toNumber(data.shipping_cost);
    const discount = toNumber(data.discount);

    console.log("Cost calculations:", {
      subtotal,
      shippingCost,
      discount,
      exchangeAmount,
    });

    let totalAmount = subtotal + shippingCost - discount - exchangeAmount;

    if (!Number.isFinite(totalAmount) || totalAmount < 0) {
      totalAmount = 0;
    }

    console.log("Final total amount:", totalAmount);

    /* ================= SAVE SALE ================= */
    const saleData = {
      reference_no,
      customer_id: data.customer_id,
      branch_id: data.branch_id,
      sale_date: data.sale_date,
      sold_by: data.sold_by,

      items: data.items,

      is_exchange: data.is_exchange,
      exchange_amount: exchangeAmount,
      exchange_note: data.exchange_note || "",
      exchange_details: exchangeDetails,

      shipping_cost: shippingCost,
      discount,
      subtotal,
      total_tax: totalTax,
      total_amount: Math.round(totalAmount * 100) / 100, // Keep 2 decimal places

      payment_status: data.payment_status || "pending",
      sale_status: data.sale_status || "draft",

      created_by: req.user?._id || null,
    };

    console.log("Creating sale with data:", saleData);

    const sale = await Sale.create(saleData);

    const invoice = await Invoice.create({
      invoice_number: await generateInvoiceNumber(),
      sale_id: sale._id,
      customer_id: sale.customer_id,
      branch_id: sale.branch_id,
      sold_by: sale.sold_by,
      is_exchange: sale.is_exchange,
      exchange_note: sale.exchange_note,
      exchange_details: sale.is_exchange ? sale.exchange_details : null,
      items: sale.items,
      subtotal: sale.subtotal,
      total_tax: sale.total_tax,
      discount: sale.discount,
      shipping_cost: sale.shipping_cost,
      total_amount: sale.total_amount,
      payment_status: sale.payment_status,
      created_by: req.user?._id,
    });

    /* ================= RESPONSE IMAGE URL ================= */
    const saleObj = sale.toObject();

    if (saleObj.exchange_details?.image) {
      saleObj.exchange_details.fullImageUrl = `${BASE_URL}${saleObj.exchange_details.image}`;
      console.log(
        "Generated full image URL:",
        saleObj.exchange_details.fullImageUrl,
      );
    }

    console.log("Sale created successfully", {
      sale_id: saleObj._id,
      invoice_number: invoice.invoice_number,
      invoice_id: invoice._id,
    });

    // return res.status(201).json({
    //   success: true,
    //   message: "Sale created successfully",
    //   data: saleObj,
    // });

    return res.status(201).json({
      success: true,
      message: "Sale created successfully",
      data: {
        ...saleObj,

        // 🔥 IMPORTANT FOR FRONTEND
        invoice_id: invoice._id,
        invoice_number: invoice.invoice_number,
        has_invoice: true,

        // payment helpers (future safe)
        current_paid: saleObj.paid_amount || 0,
        balance_amount: saleObj.total_amount - (saleObj.paid_amount || 0),
      },
    });
  } catch (error) {
    console.error("Create Sale Error:", error);
    console.error("Error stack:", error.stack);

    // Handle specific errors
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: Object.values(error.errors).map((err) => err.message),
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Duplicate entry found",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

export const updateSale = async (req, res) => {
  try {
    const { id } = req.params;
    let data = { ...req.body };

    const BASE_URL = process.env.APP_URL || "http://localhost:3000";

    const sale = await Sale.findById(id);
    if (!sale) {
      return res.status(404).json({
        success: false,
        message: "Sale not found",
      });
    }

    if (sale.sale_status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Cannot update cancelled sale",
      });
    }


    if (data.items && typeof data.items === "string") {
      try {
        data.items = JSON.parse(data.items);
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: "Invalid items JSON format",
        });
      }
    }

    if (data.items && !Array.isArray(data.items)) {
      return res.status(400).json({
        success: false,
        message: "Items must be an array",
      });
    }


    if (data.status) {
      data.sale_status = data.status;
      delete data.status;
    }


    data.is_exchange =
      data.is_exchange === true ||
      data.is_exchange === "true" ||
      data.is_exchange === "1";

    const toNumber = (val) => {
      const num = Number(val);
      return Number.isFinite(num) ? num : 0;
    };

 
    let exchangeDetails = sale.exchange_details || null;
    let exchangeAmount = sale.exchange_amount || 0;

    if (data.is_exchange === true) {

      let unitDoc = null;

      if (data.exchange_item_unit) {
    unitDoc = await Unit.findById(data.exchange_item_unit);

    if (!unitDoc) {
      return res.status(400).json({
        success: false,
        message: "Invalid exchange unit",
      });
    }
  }
      const itemName =
        data.exchange_item_name?.trim() || exchangeDetails?.item_name;

      // const rawUnit =
      //   data.exchange_item_unit?.toLowerCase() || exchangeDetails?.unit || "g";

      const rawWeight = toNumber(
        data.exchange_item_weight ?? exchangeDetails?.weight,
      );

      const rawRate = toNumber(
        data.exchange_item_actual_rate ?? exchangeDetails?.actual_rate,
      );

      if (!itemName || rawWeight <= 0 || rawRate <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid exchange item data",
        });
      }

      let weightInGram = rawWeight;


       if (unitDoc?.unit_code === "kg") {
    weightInGram = rawWeight * 1000;
  }
      // if (rawUnit === "kg") weightInGram = rawWeight * 1000;

      const calculatedValue = weightInGram * rawRate;
      exchangeAmount = toNumber(data.exchange_amount) || calculatedValue;


      let imagePath = exchangeDetails?.image || null;

      if (req.file) {
        if (imagePath) {
          const oldPath = path.join(process.cwd(), imagePath);
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }

        const uploadDir = "uploads/exchange";
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        const ext = path.extname(req.file.originalname);
        const filename = `exchange-${Date.now()}${ext}`;
        fs.renameSync(req.file.path, path.join(uploadDir, filename));

        imagePath = `/uploads/exchange/${filename}`;
      }

      exchangeDetails = {
        item_name: itemName,
        weight: rawWeight,

          // 🔥 UNIT INFO (NO POPULATE NEEDED)
    unit_id: unitDoc?._id || exchangeDetails?.unit_id || null,
    unit_name:
      unitDoc?.unit_name ||
      unitDoc?.name ||
      exchangeDetails?.unit_name,

    unit_code:
      unitDoc?.unit_code ||
      unitDoc?.code ||
      exchangeDetails?.unit_code,
        // unit: rawUnit,
        weight_in_gram: weightInGram,
        actual_rate: rawRate,
        calculated_value: calculatedValue,
        image: imagePath,
      };
    } else {
      exchangeDetails = null;
      exchangeAmount = 0;
    }

    const subtotal = toNumber(data.subtotal ?? sale.subtotal);
    const shippingCost = toNumber(data.shipping_cost ?? sale.shipping_cost);
    const discount = toNumber(data.discount ?? sale.discount);

    let totalAmount = subtotal + shippingCost - discount - exchangeAmount;

    if (!Number.isFinite(totalAmount) || totalAmount < 0) {
      totalAmount = 0;
    }

    const newPaid = Number(data.paid_amount ?? sale.paid_amount ?? 0);
    delete data.paid_amount;

    const updatedSale = await Sale.findByIdAndUpdate(
      id,
      {
        ...data,
        paid_amount: newPaid, 
        exchange_amount: exchangeAmount,
        exchange_details: exchangeDetails,
        total_amount: Math.round(totalAmount * 100) / 100,
      },
      { new: true },
    );


    const saleObj = updatedSale.toObject();

    const total = Number(saleObj.total_amount || 0);
    const paid = Number(saleObj.paid_amount || 0);

    // const balance = total - paid;
    // saleObj.current_paid = paid;
    // saleObj.balance_amount = total - paid;

    if (saleObj.exchange_details?.image) {
      saleObj.exchange_details.fullImageUrl = `${BASE_URL}${saleObj.exchange_details.image}`;
    }

    return res.status(200).json({
      success: true,
      message: "Sale updated successfully",
      data: saleObj,
    });
  } catch (err) {
    console.error("Update Sale Error:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
