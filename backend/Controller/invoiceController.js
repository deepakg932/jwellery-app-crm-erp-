// controllers/invoiceController.js
import Invoice from "../models/Invoice.js";
import Sale from "../models/SalesOrder.js";

export const generateInvoice = async (req, res) => {
  try {
    const { sale_id } = req.body;

    const sale = await Sale.findById(sale_id)
      .populate("items.item_id");

    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    // prevent duplicate invoice
    const already = await Invoice.findOne({ sale_id });
    if (already) {
      return res.status(400).json({ message: "Invoice already generated" });
    }

    const invoice = await Invoice.create({
      sale_id: sale._id,
      customer_id: sale.customer_id,
      items: sale.items,
      subtotal: sale.total_amount,
      tax_amount: sale.items.reduce((a, i) => a + (i.tax || 0), 0),
      grand_total: sale.total_amount,
      payment_status: sale.payment_status,
      generated_by: req.user?._id
    });

    return res.status(201).json({
      success: true,
      message: "Invoice generated successfully",
      data: invoice
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
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