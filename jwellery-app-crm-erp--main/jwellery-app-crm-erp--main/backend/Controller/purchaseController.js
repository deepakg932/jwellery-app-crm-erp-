// controllers/purchaseController.js
import PurchaseOrder from '../Models/models/PurchaseOrder.js';
import PurchaseInvoice from '../Models/models/PurchaseInvoice.js';

export const getPurchaseOrders = async (req, res) => {
  try {
    const orders = await PurchaseOrder.find()
      .populate('vendor_id', 'supplier_name company_name phone email address')
      .populate('branch', 'branch_name branch_code address city state')
      .populate('createdby', 'name email');
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createPurchaseOrder = async (req, res) => {
  try {
    const { vat, tax, subtotal, total, ...rest } = req.body;

    // Parse VAT: Remove % if present and convert to number
    let parsedVat = 0;
    if (vat) {
      const vatStr = vat.toString().trim();
      parsedVat = parseFloat(vatStr.replace('%', '')) || 0;
    }

    // Parse tax
    let parsedTax = 0;
    if (tax) {
      const taxStr = tax.toString().trim();
      parsedTax = parseFloat(taxStr.replace('%', '')) || 0;
    }

    // Parse subtotal and total
    const parsedSubtotal = parseFloat(subtotal) || 0;
    const parsedTotal = parseFloat(total) || 0;

    const order = await PurchaseOrder.create({
      ...rest,
      vat: parsedVat,
      tax: parsedTax,
      subtotal: parsedSubtotal,
      total: parsedTotal
    });

    res.status(201).json({ success: true, message: "Purchase Order created successfully", data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getPurchaseInvoices = async (req, res) => {
  try {
    const invoices = await PurchaseInvoice.find().populate('vendor_id');
    res.json({ success: true, data: invoices });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
