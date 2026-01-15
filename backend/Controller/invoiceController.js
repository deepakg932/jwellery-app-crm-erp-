// controllers/invoiceController.js
import Invoice from "../Models/models/Invoice.js"
import Sale from  "../Models/models/SalesOrder.js"
// import { generateInvoiceNumber } from "../helper/generateInvoiceNumber.js";

export const generateInvoiceFromSale = async (req, res) => {
  try {
    const { sale_id } = req.params;

    const sale = await Sale.findById(sale_id)
      .populate("customer_id")
      .populate("branch_id");

    if (!sale) {
      return res.status(404).json({ success: false, message: "Sale not found" });
    }

    if (sale.sale_status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "Invoice can be generated only for completed sales",
      });
    }

    const invoiceNumber = await generateInvoiceNumber();

    const invoice = await Invoice.create({
      invoice_number: invoiceNumber,
      sale_id: sale._id,
      customer_id: sale.customer_id._id,
      branch_id: sale.branch_id._id,
      items: sale.items,
      subtotal: sale.subtotal,
      total_tax: sale.total_tax,
      discount: sale.discount,
      shipping_cost: sale.shipping_cost,
      total_amount: sale.total_amount,
      created_by: req.user?._id,
    });

    return res.status(201).json({
      success: true,
      message: "Invoice generated successfully",
      data: invoice,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate("sale_id", "so_number total_amount")
      .populate("customer_id", "name mobile")
      .populate("generated_by", "username email");
    return res.status(200).json({
      success: true,
      message: "Invoices fetched successfully",
      data: invoices
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};