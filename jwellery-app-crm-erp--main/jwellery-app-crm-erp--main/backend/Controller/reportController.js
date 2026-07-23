// controllers/reportController.js
export const getReport = async (req, res) => {
  const { type } = req.params;
  // Placeholder: implement aggregation logic
  res.json({ type, data: [] });
};
