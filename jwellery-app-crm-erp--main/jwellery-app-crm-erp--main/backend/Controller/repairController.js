import Repair from "../Models/models/Repair.js";

export const createRepair = async (req, res) => {
  try {
    const {
      customer_id, employee_id, product_name, product_module,
      product_type, product_id, product_code, is_custom_product,
      problem_description, note, repair_charge, paid_amount, due_amount,
      receiving_date, delivery_date, status, account, sale_item_id,
    } = req.body;

    if (!customer_id) {
      return res.status(400).json({ success: false, message: "Customer is required" });
    }

    const repairData = {
      customer_id,
      employee_id: employee_id || null,
      product_name: product_name || "",
      product_module: product_module || "",
      product_type: product_type || "manual",
      product_id: product_id || null,
      product_code: product_code || "",
      is_custom_product: is_custom_product === "true" || is_custom_product === true,
      problem_description: problem_description || "",
      note: note || "",
      repair_charge: parseFloat(repair_charge) || 0,
      paid_amount: parseFloat(paid_amount) || 0,
      due_amount: parseFloat(due_amount) || 0,
      receiving_date: receiving_date || new Date(),
      delivery_date: delivery_date || null,
      status: status || "pending",
      account: account || "cash",
      sale_item_id: sale_item_id || null,
    };

    const paidAmt = parseFloat(paid_amount) || 0;
    const charge = parseFloat(repair_charge) || 0;
    if (paidAmt >= charge && charge > 0) {
      repairData.payment_status = "paid";
    } else if (paidAmt > 0) {
      repairData.payment_status = "partial";
    } else {
      repairData.payment_status = "unpaid";
    }

    if (req.files && req.files.length > 0) {
      repairData.repair_images = req.files.map((f) => f.filename);
    }

    if (req.user) {
      repairData.created_by = req.user.id;
    }

    const repair = await Repair.create(repairData);
    const populated = await Repair.findById(repair._id)
      .populate("customer_id")
      .populate("employee_id");

    return res.status(201).json({ success: true, message: "Repair created successfully", data: populated });
  } catch (err) {
    console.error("Create repair error:", err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

export const getRepairs = async (req, res) => {
  try {
    const repairs = await Repair.find()
      .populate("customer_id")
      .populate("employee_id")
      .populate("product_id")
      .populate("sale_item_id")
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: repairs });
  } catch (err) {
    console.error("Get repairs error:", err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

export const getRepairById = async (req, res) => {
  try {
    const repair = await Repair.findById(req.params.id)
      .populate("customer_id")
      .populate("employee_id")
      .populate("product_id")
      .populate("sale_item_id");
    if (!repair) {
      return res.status(404).json({ success: false, message: "Repair not found" });
    }
    return res.status(200).json({ success: true, data: repair });
  } catch (err) {
    console.error("Get repair error:", err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

export const updateRepair = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await Repair.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Repair not found" });
    }

    const updateData = { ...req.body };

    if (updateData.repair_charge) updateData.repair_charge = parseFloat(updateData.repair_charge) || 0;
    if (updateData.paid_amount) updateData.paid_amount = parseFloat(updateData.paid_amount) || 0;
    if (updateData.due_amount) updateData.due_amount = parseFloat(updateData.due_amount) || 0;
    if (updateData.is_custom_product !== undefined) {
      updateData.is_custom_product = updateData.is_custom_product === "true" || updateData.is_custom_product === true;
    }
    if (updateData.employee_id === "" || updateData.employee_id === "null") {
      updateData.employee_id = null;
    }
    if (updateData.product_id === "" || updateData.product_id === "null") {
      updateData.product_id = null;
    }
    if (updateData.sale_item_id === "" || updateData.sale_item_id === "null") {
      updateData.sale_item_id = null;
    }

    const paidAmt = parseFloat(updateData.paid_amount) || 0;
    const charge = parseFloat(updateData.repair_charge) || existing.repair_charge || 0;
    if (paidAmt >= charge && charge > 0) {
      updateData.payment_status = "paid";
    } else if (paidAmt > 0) {
      updateData.payment_status = "partial";
    } else {
      updateData.payment_status = "unpaid";
    }

    if (req.files && req.files.length > 0) {
      updateData.repair_images = [...(existing.repair_images || []), ...req.files.map((f) => f.filename)];
    }

    const updated = await Repair.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      .populate("customer_id")
      .populate("employee_id");

    return res.status(200).json({ success: true, message: "Repair updated successfully", data: updated });
  } catch (err) {
    console.error("Update repair error:", err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

export const deleteRepair = async (req, res) => {
  try {
    const repair = await Repair.findById(req.params.id);
    if (!repair) {
      return res.status(404).json({ success: false, message: "Repair not found" });
    }
    await Repair.findByIdAndDelete(req.params.id);
    return res.status(200).json({ success: true, message: "Repair deleted successfully" });
  } catch (err) {
    console.error("Delete repair error:", err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

export const updateRepairPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { paid_amount, due_amount, payment_status, account } = req.body;

    const repair = await Repair.findById(id);
    if (!repair) {
      return res.status(404).json({ success: false, message: "Repair not found" });
    }

    const updated = await Repair.findByIdAndUpdate(id, {
      paid_amount: parseFloat(paid_amount) || 0,
      due_amount: parseFloat(due_amount) || 0,
      payment_status: payment_status || repair.payment_status,
      account: account || repair.account,
    }, { new: true })
      .populate("customer_id")
      .populate("employee_id");

    return res.status(200).json({ success: true, message: "Payment updated successfully", data: updated });
  } catch (err) {
    console.error("Update repair payment error:", err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};
