import SaleItem from "../Models/models/SaleItem.js";

export const createSaleItem = async (req, res) => {
  try {
    const {
      customer_id, sale_date, sold_by, branch_id,
      items, is_exchange, exchange_amount, exchange_note,
      exchange_item_name, exchange_item_weight, exchange_item_unit,
      exchange_item_actual_rate, sale_note, shipping_cost, discount,
      subtotal, total_tax, total_amount, status, payment_status,
    } = req.body;

    if (!customer_id) {
      return res.status(400).json({ success: false, message: "Customer is required" });
    }

    let parsedItems = [];
    if (items && typeof items === "string") {
      parsedItems = JSON.parse(items);
    } else if (Array.isArray(items)) {
      parsedItems = items;
    }

    const totalAmt = parseFloat(total_amount) || 0;
    const paidAmt = payment_status === "paid" ? totalAmt : 0;

    const saleData = {
      customer_id,
      branch_id: branch_id || null,
      sold_by: sold_by || null,
      sale_date: sale_date || new Date(),
      items: parsedItems,
      is_exchange: is_exchange === "true" || is_exchange === true,
      exchange_amount: parseFloat(exchange_amount) || 0,
      exchange_note: exchange_note || "",
      exchange_item_name: exchange_item_name || "",
      exchange_item_weight: parseFloat(exchange_item_weight) || 0,
      exchange_item_unit: exchange_item_unit || "",
      exchange_item_actual_rate: parseFloat(exchange_item_actual_rate) || 0,
      sale_note: sale_note || "",
      shipping_cost: parseFloat(shipping_cost) || 0,
      discount: parseFloat(discount) || 0,
      subtotal: parseFloat(subtotal) || 0,
      total_tax: parseFloat(total_tax) || 0,
      total_amount: totalAmt,
      status: status || "draft",
      sale_status: status || "draft",
      payment_status: payment_status || "pending",
      current_paid: paidAmt,
      paid_amount: paidAmt,
      balance_amount: totalAmt - paidAmt,
      created_by: req.user?.id || null,
    };

    if (req.file) {
      saleData.exchange_item_image = req.file.filename;
    }

    const sale = await SaleItem.create(saleData);
    const populated = await SaleItem.findById(sale._id)
      .populate("customer_id")
      .populate("branch_id")
      .populate("sold_by");

    return res.status(201).json({ success: true, message: "Sale created successfully", data: populated });
  } catch (err) {
    console.error("Create sale error:", err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

export const getSaleItems = async (req, res) => {
  try {
    const sales = await SaleItem.find()
      .populate("customer_id")
      .populate("branch_id")
      .populate("sold_by")
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: sales });
  } catch (err) {
    console.error("Get sale items error:", err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

export const updateSaleItem = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await SaleItem.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Sale not found" });
    }

    const updateData = { ...req.body };

    if (updateData.items && typeof updateData.items === "string") {
      updateData.items = JSON.parse(updateData.items);
    }
    if (updateData.is_exchange !== undefined) {
      updateData.is_exchange = updateData.is_exchange === "true" || updateData.is_exchange === true;
    }
    ["exchange_amount", "shipping_cost", "discount", "subtotal", "total_tax", "total_amount",
     "exchange_item_weight", "exchange_item_actual_rate", "paid_amount", "balance_amount", "current_paid"
    ].forEach((field) => {
      if (updateData[field] !== undefined) {
        updateData[field] = parseFloat(updateData[field]) || 0;
      }
    });

    if (req.file) {
      updateData.exchange_item_image = req.file.filename;
    }

    const updated = await SaleItem.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      .populate("customer_id")
      .populate("branch_id")
      .populate("sold_by");

    return res.status(200).json({ success: true, message: "Sale updated successfully", data: updated });
  } catch (err) {
    console.error("Update sale error:", err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

export const deleteSaleItem = async (req, res) => {
  try {
    const sale = await SaleItem.findById(req.params.id);
    if (!sale) {
      return res.status(404).json({ success: false, message: "Sale not found" });
    }
    await SaleItem.findByIdAndDelete(req.params.id);
    return res.status(200).json({ success: true, message: "Sale deleted successfully" });
  } catch (err) {
    console.error("Delete sale error:", err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

export const updateSalePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_status, paid_amount, balance_amount, payment_date, payment_method, payment_notes } = req.body;

    const sale = await SaleItem.findById(id);
    if (!sale) {
      return res.status(404).json({ success: false, message: "Sale not found" });
    }

    const updated = await SaleItem.findByIdAndUpdate(id, {
      payment_status: payment_status || sale.payment_status,
      paid_amount: parseFloat(paid_amount) || 0,
      current_paid: parseFloat(paid_amount) || 0,
      balance_amount: parseFloat(balance_amount) || 0,
      payment_date: payment_date || new Date(),
      payment_method: payment_method || "",
      payment_notes: payment_notes || "",
    }, { new: true }).populate("customer_id").populate("branch_id").populate("sold_by");

    return res.status(200).json({ success: true, message: "Payment updated successfully", data: updated });
  } catch (err) {
    console.error("Update payment error:", err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

export const getSaleReturns = async (req, res) => {
  try {
    return res.status(200).json({ success: true, data: [] });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

export const createSaleReturn = async (req, res) => {
  try {
    return res.status(201).json({ success: true, message: "Sale return created", data: req.body });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

export const updateSaleReturn = async (req, res) => {
  try {
    return res.status(200).json({ success: true, message: "Sale return updated", data: req.body });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

export const deleteSaleReturn = async (req, res) => {
  try {
    return res.status(200).json({ success: true, message: "Sale return deleted" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};
