import CustomOrder from "../Models/models/CustomOrder.js";

export const createCustomOrder = async (req, res) => {
  try {
    const {
      order_number, customer_id, weight, unit_id, metal_type_id,
      purity_id, delivery_date, status, notes, images,
    } = req.body;

    if (!customer_id) {
      return res.status(400).json({ success: false, message: "Customer is required" });
    }

    let imageUrls = [];
    if (images && typeof images === "string") {
      imageUrls = JSON.parse(images);
    } else if (Array.isArray(images)) {
      imageUrls = images;
    }
    if (req.files && req.files.length > 0) {
      imageUrls = [...imageUrls, ...req.files.map((f) => f.filename)];
    }

    const order = await CustomOrder.create({
      order_number,
      customer_id,
      weight: parseFloat(weight) || 0,
      unit_id: unit_id || null,
      metal_type_id: metal_type_id || null,
      purity_id: purity_id || null,
      delivery_date: delivery_date || null,
      status: status || "pending",
      notes: notes || "",
      images: imageUrls,
    });

    const populated = await CustomOrder.findById(order._id)
      .populate("customer_id")
      .populate("unit_id")
      .populate("metal_type_id")
      .populate("purity_id");

    return res.status(201).json({ success: true, message: "Custom order created successfully", data: populated });
  } catch (err) {
    console.error("Create custom order error:", err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

export const getCustomOrders = async (req, res) => {
  try {
    const orders = await CustomOrder.find()
      .populate("customer_id")
      .populate("unit_id")
      .populate("metal_type_id")
      .populate("purity_id")
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: orders });
  } catch (err) {
    console.error("Get custom orders error:", err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

export const updateCustomOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await CustomOrder.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Custom order not found" });
    }

    const updateData = { ...req.body };

    if (updateData.weight) updateData.weight = parseFloat(updateData.weight) || 0;
    if (updateData.images && typeof updateData.images === "string") {
      updateData.images = JSON.parse(updateData.images);
    }
    if (req.files && req.files.length > 0) {
      updateData.images = [...(updateData.images || []), ...req.files.map((f) => f.filename)];
    }

    const updated = await CustomOrder.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      .populate("customer_id")
      .populate("unit_id")
      .populate("metal_type_id")
      .populate("purity_id");

    return res.status(200).json({ success: true, message: "Custom order updated successfully", data: updated });
  } catch (err) {
    console.error("Update custom order error:", err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

export const deleteCustomOrder = async (req, res) => {
  try {
    const order = await CustomOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Custom order not found" });
    }
    await CustomOrder.findByIdAndDelete(req.params.id);
    return res.status(200).json({ success: true, message: "Custom order deleted successfully" });
  } catch (err) {
    console.error("Delete custom order error:", err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};
