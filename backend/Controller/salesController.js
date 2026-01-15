import Sale from "../Models/models/SalesOrder.js";
import Product from "../Models/models/ProductModel.js";
import {generateSaleReference} from "../helper/generateSaleReference.js";
import Invoice from "../Models/models/Invoice.js";
import { generateInvoiceNumber } from "../helper/generateInvoiceNumber.js";
import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";




export const createSale = async (req, res) => {
  try {
    const data = req.body;

    if (!data.customer_id || !data.branch_id || !data.items?.length) {
      return res.status(400).json({
        success: false,
        message: "Customer, Branch and items are required",
      });
    }

    // status mapping
    if (data.status) {
      data.sale_status = data.status;
      delete data.status;
    }

    // 🔥 AUTO SALE REFERENCE
    const reference_no = await generateSaleReference();

    // product validation
    for (const item of data.items) {
      const product = await Product.findById(item.product_id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      item.product_name = product.product_name;
      item.product_code = product.product_code;
    }

    // ✅ 1️⃣ CREATE SALE FIRST
    const sale = await Sale.create({
      ...data,
      reference_no,
      created_by: req.user?._id,
    });

    // ✅ 2️⃣ AUTO CREATE INVOICE IMMEDIATELY
    const invoice = await Invoice.create({
      invoice_number: await generateInvoiceNumber(),
      sale_id: sale._id,
      customer_id: sale.customer_id,
      branch_id: sale.branch_id,
      items: sale.items,
      subtotal: sale.subtotal,
      total_tax: sale.total_tax,
      discount: sale.discount,
      shipping_cost: sale.shipping_cost,
      total_amount: sale.total_amount,
      payment_status: sale.payment_status,
      created_by: req.user?._id,
    });

    return res.status(201).json({success: true,success: true,message: "Sale created successfully",data: {sale,invoice_number: invoice.invoice_number, invoice_id: invoice._id,
      },
    });

  } catch (error) {
    console.error("Create Sale Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const generateInvoicePDF = async (req, res) => {
  try {
    const { invoice_id } = req.params;

    const invoice = await Invoice.findById(invoice_id)
      .populate("sale_id")
      .populate("customer_id", "name mobile")
      .populate("branch_id", "branch_name branch_code");

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    // 📁 folder
    const dir = "uploads/invoices";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const fileName = `invoice-${invoice.invoice_number}.pdf`;
    const filePath = path.join(dir, fileName);

    const doc = new PDFDocument({ margin: 40 });
    doc.pipe(fs.createWriteStream(filePath));

    /* ================= HEADER ================= */
    doc.fontSize(18).text("INVOICE", { align: "center" });
    doc.moveDown();

    doc.fontSize(10);
    doc.text(`Invoice No: ${invoice.invoice_number}`);
    doc.text(`Reference No: ${invoice.sale_id.reference_no}`);
    doc.text(`Invoice Date: ${invoice.invoice_date.toDateString()}`);
    doc.text(`Status: ${invoice.payment_status}`);
    doc.moveDown();

    /* ================= CUSTOMER ================= */
    doc.fontSize(12).text("Customer Details", { underline: true });
    doc.fontSize(10);
    doc.text(`Name: ${invoice.customer_id.name}`);
    doc.text(`Mobile: ${invoice.customer_id.mobile}`);
    doc.moveDown();

    /* ================= BRANCH ================= */
    doc.fontSize(12).text("Branch Details", { underline: true });
    doc.fontSize(10);
    doc.text(`Branch: ${invoice.branch_id.branch_name}`);
    doc.text(`Code: ${invoice.branch_id.branch_code}`);
    doc.moveDown();

    /* ================= ITEMS TABLE ================= */
    doc.fontSize(12).text("Items", { underline: true });
    doc.moveDown(0.5);

    doc.fontSize(10);
    invoice.items.forEach((item, index) => {
      doc.text(
        `${index + 1}. ${item.product_name} | Qty: ${item.quantity} | Rate: ₹${item.price_before_tax} | GST: ₹${item.gst_amount} | Total: ₹${item.final_total}`
      );
    });

    doc.moveDown();

    /* ================= TOTALS ================= */
    doc.fontSize(12).text("Summary", { underline: true });
    doc.fontSize(10);
    doc.text(`Subtotal: ₹${invoice.subtotal}`);
    doc.text(`Tax: ₹${invoice.total_tax}`);
    doc.text(`Discount: ₹${invoice.discount}`);
    doc.text(`Shipping: ₹${invoice.shipping_cost}`);
    doc.moveDown(0.5);
    doc.fontSize(11).text(`Total Amount: ₹${invoice.total_amount}`, {
      bold: true,
    });

    doc.moveDown(2);
    doc.fontSize(9).text(
      "This is a system generated invoice. No signature required.",
      { align: "center" }
    );

    doc.end();

    // 💾 SAVE PDF URL
    invoice.pdf_url = `/uploads/invoices/${fileName}`;
    await invoice.save();

    return res.status(200).json({
      success: true,
      message: "Invoice PDF generated",
      pdf_url: invoice.pdf_url,
    });

  } catch (error) {
    console.error("Invoice PDF Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};









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




export const updateSale = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const sale = await Sale.findById(id);
    if (!sale) {
      return res.status(404).json({ success: false, message: "Sale not found" });
    }

    if (sale.sale_status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Cannot update cancelled sale",
      });
    }

    // frontend → backend mapping
    if (data.status) {
      data.sale_status = data.status;
      delete data.status;
    }

    const updatedSale = await Sale.findByIdAndUpdate(
      id,
      { ...data },
      { new: true }
    );

    // 🔥🔥 AUTO INVOICE CREATE (ONLY HERE)
    if (updatedSale.sale_status === "completed") {
      const invoiceExists = await Invoice.findOne({
        sale_id: updatedSale._id,
      });

      if (!invoiceExists) {
        await Invoice.create({
          invoice_number: await generateInvoiceNumber(),
          sale_id: updatedSale._id,
          customer_id: updatedSale.customer_id,
          branch_id: updatedSale.branch_id,
          items: updatedSale.items,
          subtotal: updatedSale.subtotal,
          total_tax: updatedSale.total_tax,
          discount: updatedSale.discount,
          shipping_cost: updatedSale.shipping_cost,
          total_amount: updatedSale.total_amount,
          payment_status: updatedSale.payment_status,
          created_by: req.user?._id,
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: "Sale updated successfully",
      data: updatedSale,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};




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
        "product_name product_code selling_price_with_gst selling_price_before_tax gst_rate"
      )
      .sort({ product_name: 1 })
      .limit(50);
      console.log("Found Products:", products);

    return res.status(200).json({ success: true, data: products});
  } catch (error) {
    console.error("Product List Error:", error);
    return res.status(500).json({success: false,message: error.message,});
  }
};





export const listSales = async (req, res) => {
  try {
    const sales = await Sale.find()
      .sort({ createdAt: -1 })
      .populate("customer_id", "name mobile")
      .populate("branch_id", "branch_name branch_code");

    const saleIds = sales.map(s => s._id);

    const invoices = await Invoice.find({
      sale_id: { $in: saleIds },
    });

    const invoiceMap = {};
    invoices.forEach(inv => {
      invoiceMap[inv.sale_id.toString()] = inv;
    });

    const formattedSales = sales.map(sale => {
      const total = Number(sale.total_amount || 0);
      const paid = Number(sale.paid_amount || 0);

      const invoice = invoiceMap[sale._id.toString()];

      return {
        ...sale.toObject(),
        current_paid: paid,
        balance_amount: total - paid,

        // 🔥 UI KE LIYE
        has_invoice: !!invoice,
        invoice_id: invoice?._id || null,
        invoice_number: invoice?.invoice_number || null,
      };
    });

    res.status(200).json({ success: true, data: formattedSales });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
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
      return res.status(404).json({success: false,message: "Sale not found"});
    }

    await Sale.findByIdAndDelete(id);

    return res.status(200).json({ success: true, message: "Sale deleted successfully",});
  } catch (error) {
    res.status(500).json({success: false,message: error.message,});
  }
};

export const updateSalePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      paid_amount,        // 👈 TOTAL PAID from frontend
      payment_date,
      payment_method,
      payment_notes,
    } = req.body;

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
        message: "Cannot update payment for cancelled sale",
      });
    }

    const totalAmount = Number(sale.total_amount || 0);
    const newTotalPaid = Number(paid_amount || 0);

    if (newTotalPaid < 0) {
      return res.status(400).json({
        success: false,
        message: "Paid amount cannot be negative",
      });
    }

    if (newTotalPaid > totalAmount) {
      return res.status(400).json({
        success: false,
        message: "Paid amount cannot exceed total amount",
      });
    }

    // 🔥 CALCULATIONS
    const balanceAmount = totalAmount - newTotalPaid;

    let finalPaymentStatus = "pending";
    if (newTotalPaid === 0) {
      finalPaymentStatus = "pending";
    } else if (balanceAmount > 0) {
      finalPaymentStatus = "partial";
    } else {
      finalPaymentStatus = "paid";
    }

    // ✅ SAVE EVERYTHING
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
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



