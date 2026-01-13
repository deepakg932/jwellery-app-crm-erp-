import StockIn from "../Models/models/stockInModel.js";


const updateStockInOnReturn = async (stockInId, items) => {
  for (const item of items) {
    const returnQty = Number(item.return_quantity || 0);
    const returnWt = Number(item.return_weight || 0);

    if (returnQty <= 0 && returnWt <= 0) continue;

    await StockIn.findByIdAndUpdate(
      stockInId,
      {
        $inc: {
          "items.$[elem].received_quantity": -returnQty,
          "items.$[elem].received_weight": -returnWt,
        },
      },
      {
        arrayFilters: [
          { "elem.inventory_item_id": item.inventory_item_id },
        ],
        new: true,
      }
    );
  }
};


export default updateStockInOnReturn;