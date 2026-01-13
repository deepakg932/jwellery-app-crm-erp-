import StockIn from "../Models/models/stockInModel.js";

const updateStockInStatusAfterReturn = async (stockInId) => {
  const stockIn = await StockIn.findById(stockInId);
  if (!stockIn) return;

  let totalReceivedQty = 0;
  let totalReceivedWeight = 0;

  stockIn.items.forEach(item => {
    totalReceivedQty += Number(item.received_quantity || 0);
    totalReceivedWeight += Number(item.received_weight || 0);
  });

  // 🔥 STATUS DECISION
  if (totalReceivedQty === 0 && totalReceivedWeight === 0) {
    stockIn.status = "returned";
    stockIn.is_fully_returned = true;
  } else {
    stockIn.status = "partially_returned";
    stockIn.is_fully_returned = false;
  }

  await stockIn.save();
};

export default updateStockInStatusAfterReturn;
