import Sale from "../Models/models/SalesOrder.js"
import SaleReturn from "../Models/models/SalesReturn.js"
import Invoice from "../Models/models/Invoice.js"
import { generateReturnNumber } from "../helper/generateReturnNumber.js";
import { generateSaleReturnReference } from "../helper/generateSaleReturnReference.js";

export const createSaleReturn = async (req, res) => {
  try {
    const {
      sale_id,
      return_date,
      items,
      reason,
      return_type,
      refund_amount,
      total_amount,
      notes,
    } = req.body;

    if (!sale_id || !items?.length) {
      return res.status(400).json({
        success: false,
        message: "Sale and return items are required",
      });
    }

    const sale = await Sale.findById(sale_id);

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: "Sale not found",
      });
    }

  
    if (sale.sale_status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "Return allowed only for completed sales",
      });
    }

    
    for (const item of items) {
      const saleItem = sale.items.find(
        (i) => i.product_id.toString() === item.product_id
      );

      if (!saleItem) {
        return res.status(400).json({
          success: false,
          message: "Invalid product in return",
        });
      }

      if (item.return_quantity > saleItem.quantity) {
        return res.status(400).json({
          success: false,
          message: "Return quantity exceeds sold quantity",
        });
      }
    }

   
    const saleReturn = await SaleReturn.create({
      return_number: await generateReturnNumber(),
      reference_no: await generateSaleReturnReference(),

      sale_id: sale._id,
      sale_number: sale.reference_no, 

      customer_id: sale.customer_id,
      customer_name: sale.customer_name,

      return_date,
      items,
      reason,
      return_type,
      refund_amount,
      total_amount,
      notes,
      created_by: req.user?._id,

      status: "pending", 
    });

    await Sale.findByIdAndUpdate(sale._id, {
      sale_status: "returned",
    });

    return res.status(201).json({
      success: true,
      message: "Sale return created & sale marked as returned",
      data: saleReturn,
    });

  } catch (error) {
    console.error("Sale Return Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};




export const approveSaleReturn = async (req, res) => {
  try {
    const { id } = req.params;

    const saleReturn = await SaleReturn.findById(id);
    if (!saleReturn) {
      return res.status(404).json({
        success: false,
        message: "Sale return not found",
      });
    }

    if (saleReturn.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Return already processed",
      });
    }

    saleReturn.status = "approved";
    saleReturn.approved_by = req.user?._id;
    saleReturn.approved_at = new Date();
    await saleReturn.save();

    await Sale.findByIdAndUpdate(
      saleReturn.sale_id,
      { sale_status: "returned" },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Sale return approved & sale marked as returned",
    });

  } catch (error) {
    console.error("Approve Return Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



export const getSaleReturns = async (req, res) => {
  try {
    const { status, sale_id, customer_id, from, to } = req.query;

    const filter = {};

    if (status) filter.status = status;
    if (sale_id) filter.sale_id = sale_id;
    if (customer_id) filter.customer_id = customer_id;

    if (from && to) {
      filter.return_date = {
        $gte: new Date(from),
        $lte: new Date(to),
      };
    }

    const saleReturns = await SaleReturn.find(filter)
      .populate("customer_id", "name mobile")
      .populate("created_by", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: saleReturns,
    });

  } catch (error) {
    console.error("Get Sale Returns Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};





export const updateSaleReturn = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      return_date,
      items,
      reason,
      return_type,
      refund_amount,
      total_amount,
      notes,
      status,
    } = req.body;

    const saleReturn = await SaleReturn.findById(id);
    if (!saleReturn) {
      return res.status(404).json({
        success: false,
        message: "Sale return not found",
      });
    }

    // 🔒 optional lock (agar completed ho chuka ho)
    if (saleReturn.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Completed return cannot be updated",
      });
    }

    // ✅ validate items again (safe)
    if (items?.length) {
      const sale = await Sale.findById(saleReturn.sale_id);

      for (const item of items) {
        const saleItem = sale.items.find(
          (i) => i.product_id.toString() === item.product_id
        );

        if (!saleItem) {
          return res.status(400).json({
            success: false,
            message: "Invalid product in return",
          });
        }

        if (item.return_quantity > saleItem.quantity) {
          return res.status(400).json({
            success: false,
            message: "Return quantity exceeds sold quantity",
          });
        }
      }
    }

    // ✅ update allowed fields only
    if (return_date) saleReturn.return_date = return_date;
    if (items) saleReturn.items = items;
    if (reason) saleReturn.reason = reason;
    if (return_type) saleReturn.return_type = return_type;
    if (refund_amount !== undefined) saleReturn.refund_amount = refund_amount;
    if (total_amount !== undefined) saleReturn.total_amount = total_amount;
    if (notes !== undefined) saleReturn.notes = notes;
    if (status) saleReturn.status = status; // pending / approved / completed

    await saleReturn.save();

    return res.status(200).json({
      success: true,
      message: "Sale return updated successfully",
      data: saleReturn,
    });

  } catch (error) {
    console.error("Update Sale Return Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const deleteSaleReturn = async (req, res) => {
  try {
    const { id } = req.params;
    const saleReturn = await SaleReturn.findById(id);
    if (!saleReturn) {
      return res.status(404).json({
        success: false,
        message: "Sale return not found",
      });
    }
    if (saleReturn.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Completed return cannot be deleted",
      });
    }
    await SaleReturn.findByIdAndDelete(id);
    return res.status(200).json({
      success: true,
      message: "Sale return deleted successfully",
    });
  } catch (error) {
    console.error("Delete Sale Return Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};