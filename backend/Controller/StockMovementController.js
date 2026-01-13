import StockMovement from "../Models/models/StockMovementModel.js"

export const getStockMovement = async (req, res) => {
  const { inventory_item_id, branch } = req.query;

  const filter = {};
  if (inventory_item_id) filter.inventory_item_id = inventory_item_id;
  if (branch) filter.branch = branch;

  const data = await StockMovement.find(filter)
    .populate("inventory_item_id", "name item_code")
    .populate("branch", "branch_name")
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, data });
};
