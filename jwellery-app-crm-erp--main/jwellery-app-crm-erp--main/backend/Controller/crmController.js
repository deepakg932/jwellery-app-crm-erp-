// controllers/crmController.js
import Customer from '../models/Customer.js';
import CustomerFollowup from '../models/CustomerFollowup.js';

export const getCustomers = async (req, res) => {
  const customers = await Customer.find();
return  res.json(customers);
};

export const createCustomer = async (req, res) => {
  const customer = await Customer.create(req.body);
  return res.json(customer);
};

export const getFollowups = async (req, res) => {
  const followups = await CustomerFollowup.find().populate('customer_id');
  return res.json(followups);
};
