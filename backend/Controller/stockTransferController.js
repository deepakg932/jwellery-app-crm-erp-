

import StockTransfer from "../Models/models/StockTransfer.js"
import { addStockLedger } from "../services/stockLedger.service.js";

export const approveTransfer = async (req, res) => {
  const transfer = await StockTransfer.findById(req.params.id);

  if (!transfer) return res.status(404).json({ message: "Not found" });

  for (const i of transfer.items) {
    // OUT from source
    await addStockLedger({
      item: i.item,
      branch: transfer.fromBranch,
      transactionType: "OUT",
      reason: "TRANSFER_OUT",
      grossWeight: i.grossWeight,
      netWeight: i.netWeight,
      referenceId: transfer._id,
      createdBy: req.user._id
    });

    // IN to destination
    await addStockLedger({
      item: i.item,
      branch: transfer.toBranch,
      transactionType: "IN",
      reason: "TRANSFER_IN",
      grossWeight: i.grossWeight,
      netWeight: i.netWeight,
      referenceId: transfer._id,
      createdBy: req.user._id
    });
  }

  transfer.status = "APPROVED";
  await transfer.save();

  res.json({ success: true });
};
