import StockLedger from "../Models/models/StockLedger.js"
import InventoryStock from "../Models/models/InventoryStockModel.js"

export const applyStockMovement = async ({
  item,
  branch,
  transactionType, // IN | OUT
  reason,
  quantity = 0,
  grossWeight = 0,
  netWeight = 0,
  stoneWeight = 0,
  referenceType,
  referenceId,
  createdBy
}) => {
  // 1️⃣ Ledger entry
  await StockLedger.create({
    item,
    branch,
    transactionType,
    reason,
    quantity,
    grossWeight,
    netWeight,
    stoneWeight,
    referenceType,
    referenceId,
    createdBy
  });

  // 2️⃣ Update current stock
  const sign = transactionType === "IN" ? 1 : -1;

  let stock = await InventoryStock.findOne({
    inventory_item_id: item,
    branch_id: branch
  });

  if (!stock) {
    stock = await InventoryStock.create({
      inventory_item_id: item,
      branch_id: branch,
      current_quantity: sign * quantity,
      gross_weight: sign * grossWeight,
      net_weight: sign * netWeight,
      stone_weight: sign * stoneWeight
    });
  } else {
    stock.current_quantity += sign * quantity;
    stock.gross_weight += sign * grossWeight;
    stock.net_weight += sign * netWeight;
    stock.stone_weight += sign * stoneWeight;

    // ❌ Negative stock prevent
    if (stock.net_weight < 0 || stock.current_quantity < 0) {
      throw new Error("Insufficient stock");
    }

    await stock.save();
  }
};
