import StockIn from "../Models/models/stockInModel.js";
import mongoose from "mongoose"

const deductFromStockIn = async ({
  inventory_item_id,
  used_qty = 0,
  used_weight = 0,
  wastage_qty = 0,
  wastage_weight = 0,
}) => {
  const netQty = Number(used_qty) + Number(wastage_qty);
  const netWeight = Number(used_weight) + Number(wastage_weight);

  console.log("DEDUCT FINAL:", { netQty, netWeight });

  if (!inventory_item_id) return;

  const stockIns = await StockIn.find({
    is_fully_returned: false,
      "items.inventory_item_id": new mongoose.Types.ObjectId(inventory_item_id),
    // "items.inventory_item_id": inventory_item_id,
  }).sort({ createdAt: 1 }); 

  if (!stockIns.length) {
    throw new Error("Stock not available");
  }

  let remainingQty = netQty;
  console.log(remainingQty,"remainingQty")
  let remainingWeight = netWeight;
  console.log(remainingWeight,"remainingWeight")

  for (const stock of stockIns) {
    for (const item of stock.items) {
      if (
        item.inventory_item_id.toString() !==
        inventory_item_id.toString()
      )
        continue;

      /* ================= PCS BASED ================= */
      if (remainingQty > 0 && item.received_quantity > 0) {
        const deductQty = Math.min(
          item.received_quantity,
          remainingQty
        );
        item.received_quantity -= deductQty;
        remainingQty -= deductQty;
      }

      /* ================= WEIGHT BASED ================= */
      if (remainingWeight > 0 && item.received_weight > 0) {
        const deductWeight = Math.min(
          item.received_weight,
          remainingWeight
        );
        item.received_weight -= deductWeight;
        remainingWeight -= deductWeight;
      }

      if (remainingQty === 0 && remainingWeight === 0) break;
    }

    //update stock status
    const allConsumed = stock.items.every(
      (i) =>
        (i.received_quantity ?? 0) <= 0 &&
        (i.received_weight ?? 0) <= 0
    );

    stock.is_fully_returned = allConsumed;
    stock.status = allConsumed
      ? "received"
      : "partially_received";

    await stock.save();

    if (remainingQty === 0 && remainingWeight === 0) break;
  }

  // if (remainingQty > 0 || remainingWeight > 0) {
  //   throw new Error("Not enough quantity/weight in StockIn");
  // }
};

export default deductFromStockIn;
