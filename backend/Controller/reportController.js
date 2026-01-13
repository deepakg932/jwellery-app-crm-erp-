// controllers/reportController.js
import StockLedger from "../Models/models/StockLedger.js";
export const getStockReport = async (req, res) => {
  try {
    const { branch_id, item_id, category_id } = req.query;
    
    const filter = {};
    if (branch_id) filter.branch_id = branch_id;
    if (item_id) filter.item_id = item_id;
    
    const stockReport = await StockLedger.find(filter)
      .populate('item_id', 'name item_code category unit')
      .populate('branch_id', 'branch_name')
      .sort({ 'item_id.name': 1 });
    
    // Add movement history for each item
    const reportWithHistory = await Promise.all(
      stockReport.map(async (stock) => {
        const movements = await StockMovement.find({
          item_id: stock.item_id._id,
          branch_id: stock.branch_id._id
        })
        .sort({ createdAt: -1 })
        .limit(10);
        
        return {
          ...stock.toObject(),
          recent_movements: movements
        };
      })
    );
    
    return res.status(200).json({
      success: true,
      data: reportWithHistory
    });
  } catch (error) {
    console.error("Stock Report Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};