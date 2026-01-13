// import StockIn from "../Models/models/stockInModel.js";
// import PurchaseReturn from "../Models/models/purchaseReturnModel.js";

// const markStockInIfFullyReturned = async (stockInId) => {
//   const stockIn = await StockIn.findById(stockInId);
//   if (!stockIn) return;

//   // 🔥 total returned per item calculate
//   const returns = await PurchaseReturn.find({
//     purchase_received_id: stockInId,
//     status: { $ne: "rejected" },
//   });

//   const returnMap = {};
//   returns.forEach((ret) => {
//     ret.items.forEach((item) => {
//       const key = item.inventory_item_id.toString();
//       if (!returnMap[key]) returnMap[key] = { qty: 0, wt: 0 };
//       returnMap[key].qty += Number(item.return_quantity || 0);
//       returnMap[key].wt += Number(item.return_weight || 0);
//     });
//   });

//   // ✅ check available
//   const allZero = stockIn.items.every((item) => {
//     const returned = returnMap[item.inventory_item_id.toString()] || {
//       qty: 0,
//       wt: 0,
//     };

//     const availableQty =
//       (item.received_quantity || 0) - returned.qty;
//     const availableWt =
//       (item.received_weight || 0) - returned.wt;

//     return availableQty <= 0 && availableWt <= 0;
//   });

//   if (allZero) {
//     stockIn.is_fully_returned = true;
//     stockIn.status = "returned";
//     await stockIn.save();
//   }
// };

// export default markStockInIfFullyReturned;


import StockIn from "../Models/models/stockInModel.js";

const markStockInIfFullyReturned = async (stockInId) => {
  const stockIn = await StockIn.findById(stockInId);
  if (!stockIn) return;

  const stillAvailable = stockIn.items.some(
    (i) =>
      (i.received_quantity || 0) > 0 ||
      (i.received_weight || 0) > 0
  );

  if (!stillAvailable) {
    stockIn.is_fully_returned = true;
    await stockIn.save();
  }
};

export default markStockInIfFullyReturned;
