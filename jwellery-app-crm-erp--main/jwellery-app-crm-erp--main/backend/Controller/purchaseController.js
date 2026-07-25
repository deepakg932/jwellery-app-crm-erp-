import PurchaseOrder from '../Models/models/PurchaseOrder.js';
import PurchaseInvoice from '../Models/models/PurchaseInvoice.js';

const parsePercent = (val) => {
  if (val === undefined || val === null || val === '') return 0;
  if (typeof val === 'number') return val;
  return parseFloat(String(val).replace('%', '').trim()) || 0;
};

export const getPurchaseOrders = async (req, res) => {
  try {
    const orders = await PurchaseOrder.find()
      .populate('vendor_id supplier_id', 'supplier_name company_name name phone email address')
      .populate('branch branch_id', 'branch_name branch_code address city state')
      .populate('created_by createdby', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getPurchaseOrderById = async (req, res) => {
  try {
    const order = await PurchaseOrder.findById(req.params.id)
      .populate('vendor_id supplier_id')
      .populate('branch branch_id')
      .populate('created_by createdby', 'name email');
    if (!order) return res.status(404).json({ success: false, message: 'Purchase order not found' });
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createPurchaseOrder = async (req, res) => {
  try {
    const data = { ...req.body };

    data.vat = parsePercent(data.vat);
    data.tax = parsePercent(data.tax);
    data.subtotal = parseFloat(data.subtotal) || 0;
    data.total = parseFloat(data.total) || 0;
    data.total_amount = parseFloat(data.total_amount) || 0;
    data.grand_total = parseFloat(data.grand_total) || 0;
    data.discount = parseFloat(data.discount) || 0;
    data.shipping_cost = parseFloat(data.shipping_cost) || 0;
    data.paid_amount = parseFloat(data.paid_amount) || 0;
    data.balance_amount = parseFloat(data.balance_amount) || 0;
    data.exchange_rate = parseFloat(data.exchange_rate) || 1;

    if (!data.order_date) data.order_date = new Date();
    if (!data.status) data.status = 'draft';
    if (!data.payment_status) data.payment_status = 'pending';

    if (!data.vendor_id && data.supplier_id) data.vendor_id = data.supplier_id;
    if (!data.supplier_id && data.vendor_id) data.supplier_id = data.vendor_id;
    if (!data.branch && data.branch_id) data.branch = data.branch_id;
    if (!data.branch_id && data.branch) data.branch_id = data.branch;
    if (!data.createdby && data.created_by) data.createdby = data.created_by;

    const order = await PurchaseOrder.create(data);
    res.status(201).json({ success: true, message: 'Purchase Order created successfully', data: order });
  } catch (err) {
    console.error('createPurchaseOrder error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updatePurchaseOrder = async (req, res) => {
  try {
    const data = { ...req.body };

    if (data.vat !== undefined) data.vat = parsePercent(data.vat);
    if (data.tax !== undefined) data.tax = parsePercent(data.tax);
    if (data.subtotal !== undefined) data.subtotal = parseFloat(data.subtotal) || 0;
    if (data.total !== undefined) data.total = parseFloat(data.total) || 0;
    if (data.total_amount !== undefined) data.total_amount = parseFloat(data.total_amount) || 0;
    if (data.grand_total !== undefined) data.grand_total = parseFloat(data.grand_total) || 0;
    if (data.discount !== undefined) data.discount = parseFloat(data.discount) || 0;
    if (data.shipping_cost !== undefined) data.shipping_cost = parseFloat(data.shipping_cost) || 0;
    if (data.paid_amount !== undefined) data.paid_amount = parseFloat(data.paid_amount) || 0;
    if (data.balance_amount !== undefined) data.balance_amount = parseFloat(data.balance_amount) || 0;

    if (data.vendor_id && !data.supplier_id) data.supplier_id = data.vendor_id;
    if (data.supplier_id && !data.vendor_id) data.vendor_id = data.supplier_id;

    const order = await PurchaseOrder.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    if (!order) return res.status(404).json({ success: false, message: 'Purchase order not found' });
    res.json({ success: true, message: 'Purchase Order updated successfully', data: order });
  } catch (err) {
    console.error('updatePurchaseOrder error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deletePurchaseOrder = async (req, res) => {
  try {
    const order = await PurchaseOrder.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Purchase order not found' });
    res.json({ success: true, message: 'Purchase Order deleted successfully' });
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
