import SalesReturn from "../Models/models/SalesReturn.js";
import Sale from "../Models/models/SalesOrder.js";
import InventoryItem from "../Models/models/InventoryModel.js";

export const createSalesReturn = async (req, res) => {
  try {
    const data = req.body;

    if (!data.sale_id || !data.items?.length) {
      return res.status(400).json({
        success: false,
        message: "Sale & items required",
      });
    }

    const sale = await Sale.findById(data.sale_id);
    if (!sale) {
      return res.status(404).json({
        success: false,
        message: "Sale not found",
      });
    }

    /* ===============================
       🔥 RETURN STOCK
    =============================== */
    for (const item of data.items) {
      await InventoryItem.findByIdAndUpdate(item.item_id, {
        $inc: {
          current_stock: item.return_quantity,
          stock_in: item.return_quantity,
        },
        $push: {
          stock_history: {
            date: new Date(),
            type: "in",
            quantity: item.return_quantity,
            remarks: "Sales Return",
          },
        },
      });
    }

    const salesReturn = await SalesReturn.create({
      ...data,
      created_by: req.user?._id,
    });

    sale.sale_status = "returned";
    await sale.save();

    return res.status(201).json({
      success: true,
      message: "Sales return processed",
      data: salesReturn,
    });
  } catch (error) {
    console.error("Sales Return Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
