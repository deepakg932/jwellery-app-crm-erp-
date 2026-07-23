// controllers/salesController.js
import Invoice from '../models/Invoice.js';

export const getInvoices = async (req, res) => {
  const invoices = await Invoice.find().populate('customer_id user_id branch_id');
  res.json(invoices);
};

export const getInvoiceById = async (req, res) => {
  const invoice = await Invoice.findById(req.params.id).populate('items.product_id');
  res.json(invoice);
};

export const createInvoice = async (req, res) => {
  const invoice = await Invoice.create(req.body);
  res.json(invoice);
};
