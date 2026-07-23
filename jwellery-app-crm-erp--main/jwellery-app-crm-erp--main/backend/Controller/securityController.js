// controllers/securityController.js
import ActivityLog from '../models/ActivityLog.js';

export const getActivityLogs = async (req, res) => {
  const logs = await ActivityLog.find().populate('user_id');
  res.json(logs);
};
