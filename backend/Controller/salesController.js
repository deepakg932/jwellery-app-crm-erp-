import Sale from "../Models/models/SaleModel.js"
import { applyStockMovement } from "../services/stockMovement.service.js";

export const createSale = async (req, res) => {
  try {
    const sale = await Sale.create(req.body);

    for (const item of sale.items) {
      await applyStockMovement({
        item: item.inventory_item_id,
        branch: sale.branch,
        transactionType: "OUT",
        reason: "SALE",
        quantity: item.quantity,
        grossWeight: item.grossWeight,
        netWeight: item.netWeight,
        referenceType: "SALE",
        referenceId: sale._id,
        createdBy: req.user._id
      });
    }

    res.status(201).json({ success: true, data: sale });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
