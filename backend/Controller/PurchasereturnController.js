import InventoryItem from "../Models/models/InventoryModel.js";
import StockIn from "../Models/models/stockInModel.js";
import PurchaseReturn from "../Models/models/purchaseReturnModel.js";
import updateStockInStatusAfterReturn from "../helper/updateStockInStatusAfterReturn.js";

import updatePOReceivedAfterReturn from "../helper/updatePOReceivedAfterReturn.js";


import markStockInIfFullyReturned from "../helper/markStockInIfFullyReturned.js";
import recalculatePOStatus from "../helper/recalculatePOStatusAfterReturn.js";

export const createPurchaseReturn = async (req, res) => {
  try {
    const data = req.body;

    if (!data.purchase_received_id || !data.items?.length) {
      return res.status(400).json({
        success: false,
        message: "Purchase receive & items required",
      });
    }

    // 🔥 CREATE RETURN
    const purchaseReturn = await PurchaseReturn.create({
      purchase_received_id: data.purchase_received_id,
      supplier_id: data.supplier_id,
      branch_id: data.branch_id,
      return_date: data.return_date,
      return_reason: data.return_reason,
      items: data.items,
      remarks: data.remarks || "",
      total_cost: data.total_cost || 0,
      status: "approved",
      created_by: req.user?._id || null,
    });

    // 🔥 INVENTORY & STOCKIN UPDATE
    for (const item of data.items) {
      const returned =
        Number(item.return_quantity) || Number(item.return_weight) || 0;

      // Inventory
      await InventoryItem.findByIdAndUpdate(item.inventory_item_id, {
        $inc: {
          current_stock: -returned,
          stock_out: returned,
        },
      });

      // StockIn
      await StockIn.findByIdAndUpdate(
        data.purchase_received_id,
        {
          $inc: {
            "items.$[elem].received_quantity": -Number(item.return_quantity || 0),
            "items.$[elem].received_weight": -Number(item.return_weight || 0),
          },
        },
        {
          arrayFilters: [
            { "elem.inventory_item_id": item.inventory_item_id },
          ],
        }
      );
    }

    // 🔥 MARK STOCKIN HIDDEN
    await markStockInIfFullyReturned(data.purchase_received_id);

    // 🔥 UPDATE PO STATUS AFTER RETURN
const stockIn = await StockIn.findById(data.purchase_received_id);

if (stockIn?.po_id) {


    await updatePOReceivedAfterReturn(stockIn.po_id, data.items);
  await recalculatePOStatus(stockIn.po_id);
}

    res.status(201).json({
      success: true,
      message: "Purchase return processed successfully",
      data: purchaseReturn,
    });
  } catch (err) {
    console.error("Purchase Return Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};




export const getStockInWithAvailableQty = async (req, res) => {
  try {
    const stockIns = await StockIn.find()
      .populate("supplier_id", "name supplier_name")
      .populate("branch_id", "name branch_name")
      .populate("items.inventory_item_id", "name item_code")
      .populate("items.unit_id", "name code")
      .sort({ createdAt: -1 });

    const result = [];

    for (const stockIn of stockIns) {
      // get all returns against this stockIn
      const returns = await PurchaseReturn.find({
        purchase_received_id: stockIn._id,
        status: { $ne: "rejected" },
      });

      const returnMap = {};

      returns.forEach((ret) => {
        ret.items.forEach((item) => {
          const key = item.inventory_item_id.toString();

          if (!returnMap[key]) {
            returnMap[key] = { qty: 0, wt: 0 };
          }

          returnMap[key].qty += Number(item.return_quantity || 0);
          returnMap[key].wt += Number(item.return_weight || 0);
        });
      });

      const mappedItems = stockIn.items.map((item) => {
        const returned = returnMap[item.inventory_item_id?.toString()] || {
          qty: 0,
          wt: 0,
        };

        return {
          ...item.toObject(),
          available_quantity:
            (item.received_quantity || 0) - returned.qty,
          available_weight:
            (item.received_weight || 0) - returned.wt,
          returned_quantity: returned.qty,
          returned_weight: returned.wt,
        };
      });

      result.push({
        ...stockIn.toObject(),
        items: mappedItems,
      });
    }

    res.json({ success: true, data: result });
  } catch (error) {
    console.error("Available Qty Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


export const getAllPurchaseReturns = async (req, res) => {
  try {
    const data = await PurchaseReturn.find()
      .populate("purchase_received_id", "received_date")
      .populate("supplier_id", "name supplier_name")
      .populate("branch_id", "name branch_name")
      .populate("items.inventory_item_id", "name item_code")
      .populate("items.unit_id", "name code")
      .sort({ createdAt: -1 });

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



export const getPurchaseReturnById = async (req, res) => {
  try {
    const data = await PurchaseReturn.findById(req.params.id)
      .populate("purchase_received_id")
      .populate("supplier_id", "name supplier_name")
      .populate("branch_id", "name branch_name")
      .populate("items.inventory_item_id", "name item_code")
      .populate("items.unit_id", "name code");

    if (!data) {
      return res
        .status(404)
        .json({ success: false, message: "Purchase Return not found" });
    }

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};







export const updatePurchaseReturn = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const existingReturn = await PurchaseReturn.findById(id);
    if (!existingReturn) {
      return res.status(404).json({
        success: false,
        message: "Purchase Return not found",
      });
    }

    const stockIn = await StockIn.findById(existingReturn.purchase_received_id);
    if (!stockIn) {
      return res.status(400).json({
        success: false,
        message: "Linked StockIn not found",
      });
    }

    /* ======================================================
       🔁 STEP 1: REVERSE OLD RETURN
    ====================================================== */
    for (const item of existingReturn.items) {
      const reversed =
        Number(item.return_quantity) || Number(item.return_weight) || 0;

      // Inventory back
      await InventoryItem.findByIdAndUpdate(item.inventory_item_id, {
        $inc: {
          current_stock: reversed,
          stock_out: -reversed,
        },
      });

      // StockIn back
      await StockIn.findByIdAndUpdate(
        existingReturn.purchase_received_id,
        {
          $inc: {
            "items.$[elem].received_quantity": Number(item.return_quantity || 0),
            "items.$[elem].received_weight": Number(item.return_weight || 0),
          },
        },
        {
          arrayFilters: [
            { "elem.inventory_item_id": item.inventory_item_id },
          ],
        }
      );
    }

    // PO received back
    if (stockIn.po_id) {
     await updatePOReceivedAfterReturn(
  stockIn.po_id,
  existingReturn.items.map(i => ({
    inventory_item_id: i.inventory_item_id,
    return_quantity: -Number(i.return_quantity || 0),
    return_weight: -Number(i.return_weight || 0),
  }))
);
    }

    /* ======================================================
       🔥 STEP 2: APPLY NEW RETURN
    ====================================================== */
    for (const item of data.items) {
      const returned =
        Number(item.return_quantity) || Number(item.return_weight) || 0;

      // Inventory
      await InventoryItem.findByIdAndUpdate(item.inventory_item_id, {
        $inc: {
          current_stock: -returned,
          stock_out: returned,
        },
      });

      // StockIn
      await StockIn.findByIdAndUpdate(
        existingReturn.purchase_received_id,
        {
          $inc: {
            "items.$[elem].received_quantity": -Number(item.return_quantity || 0),
            "items.$[elem].received_weight": -Number(item.return_weight || 0),
          },
        },
        {
          arrayFilters: [
            { "elem.inventory_item_id": item.inventory_item_id },
          ],
        }
      );
    }

    // PO received minus
    if (stockIn.po_id) {
      await updatePOReceivedAfterReturn(stockIn.po_id, data.items);
      await recalculatePOStatus(stockIn.po_id);
    }

    /* ======================================================
       📝 STEP 3: UPDATE RETURN DOCUMENT
    ====================================================== */
    existingReturn.items = data.items;
    existingReturn.return_date = data.return_date;
    existingReturn.return_reason = data.return_reason;
    existingReturn.remarks = data.remarks || "";
    existingReturn.total_cost = data.total_cost || 0;

    await existingReturn.save();

    /* ======================================================
       🟢 STEP 4: STOCKIN FINAL CHECK
    ====================================================== */
    await markStockInIfFullyReturned(existingReturn.purchase_received_id);

    res.json({
      success: true,
      message: "Purchase return updated successfully",
      data: existingReturn,
    });
  } catch (error) {
    console.error("Update Purchase Return Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



export const deletePurchaseReturn = async (req, res) => {
  try {
    const { id } = req.params;

    // 🔍 1. FIND RETURN
    const existingReturn = await PurchaseReturn.findById(id);
    if (!existingReturn) {
      return res.status(404).json({
        success: false,
        message: "Purchase Return not found",
      });
    }

    // 🔍 2. FIND STOCKIN
    const stockIn = await StockIn.findById(
      existingReturn.purchase_received_id
    );
    if (!stockIn) {
      return res.status(400).json({
        success: false,
        message: "Linked StockIn not found",
      });
    }

    /* ======================================================
       🔁 3. REVERSE INVENTORY + STOCKIN
    ====================================================== */
    for (const item of existingReturn.items) {
      const qty = Number(item.return_quantity || 0);
      const wt = Number(item.return_weight || 0);
      const total = qty > 0 ? qty : wt;

      // 🟢 INVENTORY BACK
      await InventoryItem.findByIdAndUpdate(item.inventory_item_id, {
        $inc: {
          current_stock: total,
          stock_out: -total,
        },
      });

      // 🟢 STOCKIN BACK
      await StockIn.findByIdAndUpdate(
        existingReturn.purchase_received_id,
        {
          $inc: {
            "items.$[elem].received_quantity": qty,
            "items.$[elem].received_weight": wt,
          },
        },
        {
          arrayFilters: [
            { "elem.inventory_item_id": item.inventory_item_id },
          ],
        }
      );
    }

    /* ======================================================
       🔁 4. REVERSE PO RECEIVED QTY
    ====================================================== */
    if (stockIn.po_id) {
      await updatePOReceivedAfterReturn(
        stockIn.po_id,
        existingReturn.items.map(i => ({
          inventory_item_id: i.inventory_item_id,
          return_quantity: -Number(i.return_quantity || 0),
          return_weight: -Number(i.return_weight || 0),
        }))
      );

      await recalculatePOStatus(stockIn.po_id);
    }

    /* ======================================================
       🗑️ 5. DELETE RETURN DOCUMENT
    ====================================================== */
    await PurchaseReturn.findByIdAndDelete(id);

    /* ======================================================
       🔄 6. RECHECK STOCKIN STATUS
    ====================================================== */
    await markStockInIfFullyReturned(existingReturn.purchase_received_id);

    res.json({
      success: true,
      message: "Purchase return deleted successfully",
    });
  } catch (error) {
    console.error("Delete Purchase Return Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

