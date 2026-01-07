

import StockTransfer from "../Models/models/StockTransferModel.js"

import { applyStockMovement } from "../services/stockMovement.service.js";

export const approveTransfer = async (req, res) => {
  try {
    const transfer = await StockTransfer.findById(req.params.id);

    if (!transfer) return res.status(404).json({ message: "Not found" });

    for (const item of transfer.items) {
      // OUT
      await applyStockMovement({
        item: item.inventory_item_id,
        branch: transfer.fromBranch,
        transactionType: "OUT",
        reason: "TRANSFER_OUT",
        grossWeight: item.grossWeight,
        netWeight: item.netWeight,
        referenceType: "TRANSFER",
        referenceId: transfer._id,
        createdBy: req.user._id
      });

      // IN
      await applyStockMovement({
        item: item.inventory_item_id,
        branch: transfer.toBranch,
        transactionType: "IN",
        reason: "TRANSFER_IN",
        grossWeight: item.grossWeight,
        netWeight: item.netWeight,
        referenceType: "TRANSFER",
        referenceId: transfer._id,
        createdBy: req.user._id
      });
    }

    transfer.status = "APPROVED";
    await transfer.save();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};