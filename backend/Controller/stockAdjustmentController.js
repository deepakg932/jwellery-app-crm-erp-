import StockAdjustment from "../Models/models/StockAdjustmentModel.js"
import { applyStockMovement } from "../services/stockMovement.service.js";

export const createAdjustment = async (req, res) => {
  try {
    const adjustment = await StockAdjustment.create(req.body);

    await applyStockMovement({
      item: adjustment.inventory_item_id,
      branch: adjustment.branch,
      transactionType: adjustment.adjustmentType,
      reason: "ADJUSTMENT",
      grossWeight: adjustment.grossWeight,
      netWeight: adjustment.netWeight,
      referenceType: "ADJUSTMENT",
      referenceId: adjustment._id,
      createdBy: req.user._id
    });

    res.status(201).json({ success: true, data: adjustment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
