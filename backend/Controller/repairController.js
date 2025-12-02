// controllers/repairController.js
import Repair from '../models/Repair.js';

export const getRepairs = async (req, res) => {
  const repairs = await Repair.find().populate('customer_id');
  res.json(repairs);
};

export const createRepair = async (req, res) => {
  const repair = await Repair.create(req.body);
  res.json(repair);
};
