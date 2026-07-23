// controllers/purchaseController.js
import PurchaseOrder from '../models/PurchaseOrder.js';
import PurchaseInvoice from '../models/PurchaseInvoice.js';

export const getPurchaseOrders = async (req, res) => {
  const orders = await PurchaseOrder.find().populate('vendor_id createdby');
  res.json(orders);
};

export const createPurchaseOrder = async (req, res) => {
  const order = await PurchaseOrder.create(req.body);
  res.json(order);
};

export const getPurchaseInvoices = async (req, res) => {
  const invoices = await PurchaseInvoice.find().populate('vendor_id');
  res.json(invoices);
};
