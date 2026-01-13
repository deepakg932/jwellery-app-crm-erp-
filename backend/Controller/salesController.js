import Sale from "../Models/models/SalesOrder.js";
import InventoryItem from "../Models/models/InventoryModel.js";

export const createSale = async (req, res) => {
  try {
    const data = req.body;

    if (!data.customer_id || !data.branch_id || !data.items?.length) {
      return res.status(400).json({
        success: false,
        message: "Customer, Branch and items are required",
      });
    }

   
    for (const item of data.items) {
      const inventory = await InventoryItem.findById(item.item_id);

      if (!inventory) {
        return res.status(404).json({
          success: false,
          message: "Inventory item not found",
        });
      }

      if (inventory.current_stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `${inventory.name} stock not sufficient`,
        });
      }
    }

    const sale = await Sale.create({
      ...data,
      created_by: req.user?._id,
    });

    for (const item of data.items) {
      await InventoryItem.findByIdAndUpdate(item.item_id, {
        $inc: {
          current_stock: -item.quantity,
          stock_out: item.quantity,
        },
        $push: {
          stock_history: {
            date: new Date(),
            type: "out",
            quantity: item.quantity,
            remarks: `Sold via ${sale.so_number}`,
          },
        },
      });
    }

    const populatedSale = await Sale.findById(sale._id)
      .populate("customer_id", "name mobile")
      .populate("items.item_id", "name item_code");

    return res.status(201).json({
      success: true,
      message: "Sale created successfully",
      data: populatedSale,
    });
  } catch (error) {
    console.error("Create Sale Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const deliverSale = async (req, res) => {
  try {
    const { id } = req.params;

    const sale = await Sale.findById(id);
    if (!sale) {
      return res.status(404).json({
        success: false,
        message: "Sale not found",
      });
    }

    sale.items.forEach(item => {
      item.delivered_quantity = item.quantity;
      item.status = "delivered";
    });

    sale.delivery_status = "delivered";
    sale.sale_status = "completed";

    await sale.save();

    return res.json({
      success: true,
      message: "Sale delivered successfully",
      data: sale,
    });
  } catch (error) {
    console.error("Deliver Sale Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

