import Quotation from "../Models/models/Quotation.js";

export const createQuotation = async (req, res) => {
  try {
    const {
      customer_id, branch_id, quotation_date, expiry_date,
      items, status, note, shipping_cost, discount,
      tax_amount, subtotal, total_amount, grand_total,
      terms_conditions, valid_days,
    } = req.body;

    if (!customer_id) {
      return res.status(400).json({ success: false, message: "Customer is required" });
    }

    const quotation = await Quotation.create({
      customer_id,
      branch_id: branch_id || null,
      quotation_date: quotation_date || new Date(),
      expiry_date: expiry_date || null,
      items: Array.isArray(items) ? items : [],
      status: status || "draft",
      note: note || "",
      shipping_cost: parseFloat(shipping_cost) || 0,
      discount: parseFloat(discount) || 0,
      tax_amount: parseFloat(tax_amount) || 0,
      subtotal: parseFloat(subtotal) || 0,
      total_amount: parseFloat(total_amount) || 0,
      grand_total: parseFloat(grand_total) || 0,
      terms_conditions: terms_conditions || "",
      valid_days: parseInt(valid_days) || 30,
      created_by: req.user?.id || null,
    });

    const populated = await Quotation.findById(quotation._id)
      .populate("customer_id")
      .populate("branch_id");

    return res.status(201).json({ success: true, message: "Quotation created successfully", data: populated });
  } catch (err) {
    console.error("Create quotation error:", err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

export const getQuotations = async (req, res) => {
  try {
    const quotations = await Quotation.find()
      .populate("customer_id")
      .populate("branch_id")
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: quotations });
  } catch (err) {
    console.error("Get quotations error:", err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

export const updateQuotation = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await Quotation.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Quotation not found" });
    }

    const updateData = { ...req.body };
    ["shipping_cost", "discount", "tax_amount", "subtotal", "total_amount", "grand_total"].forEach((f) => {
      if (updateData[f] !== undefined) updateData[f] = parseFloat(updateData[f]) || 0;
    });
    if (updateData.valid_days) updateData.valid_days = parseInt(updateData.valid_days) || 30;

    const updated = await Quotation.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      .populate("customer_id")
      .populate("branch_id");

    return res.status(200).json({ success: true, message: "Quotation updated successfully", data: updated });
  } catch (err) {
    console.error("Update quotation error:", err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

export const deleteQuotation = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id);
    if (!quotation) {
      return res.status(404).json({ success: false, message: "Quotation not found" });
    }
    await Quotation.findByIdAndDelete(req.params.id);
    return res.status(200).json({ success: true, message: "Quotation deleted successfully" });
  } catch (err) {
    console.error("Delete quotation error:", err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};
