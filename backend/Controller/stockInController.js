import StockIn from "../Models/models/stockInModel.js";
import InventoryItem from "../Models/models/InventoryModel.js";
import PurchaseOrder from "../Models/models/PurchaseOrder.js";


const updateInventoryStock = async (items) => {
  await Promise.all(
    items.map(async (item) => {
      const received =
        Number(item.received_quantity) > 0
          ? Number(item.received_quantity)
          : Number(item.received_weight) || 0;

      if (!item.inventory_item_id || received <= 0) return;

      await InventoryItem.findByIdAndUpdate(item.inventory_item_id, {
        $inc: {
          current_stock: received,
          stock_in: received,
        },
        $push: {
          stock_history: {
            date: new Date(),
            type: "in",
            quantity: received,
            remarks: "Stock received from Purchase",
          },
        },
      });
    })
  );
};


const updatePurchaseOrder = async (poId, receivedItems) => {
  const po = await PurchaseOrder.findById(poId);
  if (!po) return;

  let allReceived = true;
  let anyPartial = false;

  po.items.forEach((poItem) => {
    const receivedItem = receivedItems.find(
      (i) => i.po_item_id?.toString() === poItem._id.toString()
    );

    if (!receivedItem) {
      allReceived = false;
      return;
    }

    poItem.received_quantity += Number(
      receivedItem.received_quantity || 0
    );
    poItem.received_weight += Number(
      receivedItem.received_weight || 0
    );

    const ordered =
      poItem.quantity > 0 ? poItem.quantity : poItem.weight;

    const received =
      poItem.quantity > 0
        ? poItem.received_quantity
        : poItem.received_weight;

    if (received < ordered) {
      allReceived = false;
      anyPartial = true;
    }
  });

  if (allReceived) po.status = "received";
  else if (anyPartial) po.status = "partially_received";

  await po.save();
};


export const createStockIn = async (req, res) => {
  try {
    const data = req.body;

    if (!data.supplier_id || !data.branch_id || !data.received_date) {
      return res.status(400).json({
        success: false,
        message: "Supplier, Branch & Received Date required",
      });
    }

    if (!data.items || data.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one item required",
      });
    }

    const mappedItems = data.items.map((item) => ({
      po_item_id: item.po_item_id || null,
      inventory_item_id: item.inventory_item_id,

      ordered_quantity: item.ordered_quantity || 0,
      ordered_weight: item.ordered_weight || 0,

      received_quantity: item.received_quantity || 0,
      received_weight: item.received_weight || 0,

      unit_id: item.unit_id,
      unit_code: item.unit_code,
      unit_name: item.unit_name,

      cost: item.cost,
      total_cost: item.total_cost,

      status: item.status || "received",
    }));

    const stockIn = await StockIn.create({
      po_id: data.po_id || null,
      supplier_id: data.supplier_id,
      branch_id: data.branch_id,
      received_date: data.received_date,
      remarks: data.remarks || "",
      total_cost: data.total_cost,
      status: data.status || "received",
      items: mappedItems,
      created_by: req.user?._id || null,
    });

    await updateInventoryStock(mappedItems);

    if (data.po_id) {
      await updatePurchaseOrder(data.po_id, mappedItems);
    }

    res.status(201).json({
      success: true,
      message: "Stock received successfully",
      data: stockIn,
    });
  } catch (error) {
    console.error("StockIn error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const getAllStockIn = async (req, res) => {
 const data = await StockIn.find({ is_fully_returned: false })
    .populate("supplier_id", "name supplier_name")
    .populate("branch_id", "branch_name")
    .populate("po_id", "po_number")
    .populate("items.inventory_item_id", "name item_code")
    .populate("items.unit_id", "name code")
    .sort({ createdAt: -1 });

  res.json({ success: true, data });
};


export const getStockInById = async (req, res) => {
  const stockIn = await StockIn.findById(req.params.id)
  .populate("supplier_id", "name supplier_name code phone")
    .populate("branch_id", "name")
    .populate("po_id", "po_number status")
    .populate("items.inventory_item_id", "name item_code");

  if (!stockIn) {
    return res
      .status(404)
      .json({ success: false, message: "Not found" });
  }

  res.json({ success: true, data: stockIn });
};







const reverseInventoryStock = async (items) => {
  await Promise.all(
    items.map(async (item) => {
      const received =
        Number(item.received_quantity) > 0
          ? Number(item.received_quantity)
          : Number(item.received_weight) || 0;

      if (!item.inventory_item_id || received <= 0) return;

      await InventoryItem.findByIdAndUpdate(item.inventory_item_id, {
        $inc: {
          current_stock: -received,
          stock_in: -received,
        },
        $push: {
          stock_history: {
            date: new Date(),
            type: "out",
            quantity: received,
            remarks: "Stock reversed (StockIn update)",
          },
        },
      });
    })
  );
};



export const updateStockIn = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const existingStockIn = await StockIn.findById(id);
    if (!existingStockIn) {
      return res.status(404).json({
        success: false,
        message: "Stock In not found",
      });
    }


    await reverseInventoryStock(existingStockIn.items);

   
    const mappedItems = data.items.map((item) => ({
      po_item_id: item.po_item_id || null,
      inventory_item_id: item.inventory_item_id,

      ordered_quantity: item.ordered_quantity || 0,
      ordered_weight: item.ordered_weight || 0,

      received_quantity: item.received_quantity || 0,
      received_weight: item.received_weight || 0,

      unit_id: item.unit_id,
      unit_code: item.unit_code,
      unit_name: item.unit_name,

      cost: item.cost,
      total_cost: item.total_cost,

      status: item.status || "received",
    }));

   
    existingStockIn.po_id = data.po_id || null;
    existingStockIn.supplier_id = data.supplier_id;
    existingStockIn.branch_id = data.branch_id;
    existingStockIn.received_date = data.received_date;
    existingStockIn.remarks = data.remarks || "";
    existingStockIn.total_cost = data.total_cost;
    existingStockIn.status = data.status || "received";
    existingStockIn.items = mappedItems;

    let a7 = await existingStockIn.save();
    console.log("a7", a7);

  
    await updateInventoryStock(mappedItems);

    if (data.po_id) {
      await updatePurchaseOrder(data.po_id, mappedItems);
    }

    res.json({
      success: true, message: "Stock In updated successfully", data: existingStockIn,
    });
  } catch (error) {
    console.error("Update StockIn error:", error);
    res.status(500).json({success: false,message: error.message,});
  }
};
