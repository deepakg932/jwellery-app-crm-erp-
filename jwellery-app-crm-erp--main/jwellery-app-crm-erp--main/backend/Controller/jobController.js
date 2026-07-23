// controllers/jobController.js
import JobCard from '../models/JobCard.js';

export const getJobCards = async (req, res) => {
  const jobs = await JobCard.find().populate('assignedkarigar customer_id');
  return res.json(jobs);
};

export const createJobCard = async (req, res) => {
  const job = await JobCard.create(req.body);
  return res.json(job);
};
