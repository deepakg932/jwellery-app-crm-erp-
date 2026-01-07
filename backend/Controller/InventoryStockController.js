import InventoryStock from "../Models/models/InventoryStockModel.js"

export const getCurrentStock = async (req, res) => {
  const stock = await InventoryStock.find()
    .populate("inventory_item_id", "item_name")
    .populate("branch_id", "name");
console.log(stock,"Stock")
  return res.json({ success: true, data: stock });
};
