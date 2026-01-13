import CustomerGroup from "../Models/models/CustomerGroup.js";
export const createCustomerGroup = async (req, res) => {
  try {
    const data = req.body;
    const existingGroup = await CustomerGroup.findOne({ customer_group: data.customer_group });
    if (existingGroup) {
      return res.status(400).json({ success: false, message: "Customer Group with this name already exists" });
    }
    const customerGroup = await CustomerGroup.create({
      customer_group: data.customer_group,
      // percentage: data.percentage,
      // description: data.description || "",
      //   default_discount: data.default_discount || 0,
      //   credit_limit: data.credit_limit || 0,
      //   payment_terms_days: data.payment_terms_days || 0,
        status: data.status || "active",
    });
    return res.status(201).json({ success: true, message: "Customer Group created", data: customerGroup });
  } catch (error) {
    console.error("Error creating customer group:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
}

export const updateCustomerGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const customerGroup = await CustomerGroup.findByIdAndUpdate(id, data, { new: true });
    if (!customerGroup) {
      return res.status(404).json({ success: false, message: "Customer Group not found" });
    }
    res.status(200).json({ success: true, message: "Customer Group updated", data: customerGroup });
  } catch (error) {
    console.error("Error updating customer group:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
}

export const getCustomerGroups = async (req, res) => {
  try {
    const customerGroups = await CustomerGroup.find();
    res.status(200).json({ success: true, data: customerGroups });
  } catch (error) {
    console.error("Error fetching customer groups:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
}

export const deleteCustomerGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const customerGroup = await CustomerGroup.findByIdAndDelete(id);
    if (!customerGroup) {
      return res.status(404).json({ success: false, message: "Customer Group not found" });
    }
    res.status(200).json({ success: true, message: "Customer Group deleted" });
  } catch (error) {
    console.error("Error deleting customer group:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
}