import Customer from "../Models/models/Customer.js";
import CustomerGroup from "../Models/models/CustomerGroup.js";
import path from "path";

export const createCustomer = async (req, res) => {
  try {
    const {
      name, customer_group_id, mobile, email, whatsapp_number,
      aadhar_number, tax_number, address, country, country_code,
      state, state_code, city, pincode, status,
    } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: "Customer name is required" });
    }

    if (mobile) {
      const existing = await Customer.findOne({ mobile });
      if (existing) {
        return res.status(400).json({ success: false, message: "Customer with this phone already exists" });
      }
    }

    const customerData = {
      name,
      customer_group_id: customer_group_id || null,
      mobile: mobile || "",
      email: email || "",
      whatsapp_number: whatsapp_number || "",
      aadhar_number: aadhar_number || "",
      tax_number: tax_number || "",
      address: address || "",
      country: country || "",
      country_code: country_code || "",
      state: state || "",
      state_code: state_code || "",
      city: city || "",
      pincode: pincode || "",
      status: status || "active",
    };

    if (req.file) {
      customerData.image = req.file.filename;
      customerData.image_url = `/uploads/customer/${req.file.filename}`;
    }

    if (req.user) {
      customerData.created_by = req.user.id;
    }

    const customer = await Customer.create(customerData);
    const populated = await Customer.findById(customer._id).populate("customer_group_id");

    return res.status(201).json({ success: true, message: "Customer created successfully", data: populated });
  } catch (err) {
    console.error("Create customer error:", err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

export const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find().populate("customer_group_id").sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: customers });
  } catch (err) {
    console.error("Get customers error:", err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

export const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).populate("customer_group_id");
    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }
    return res.status(200).json({ success: true, data: customer });
  } catch (err) {
    console.error("Get customer error:", err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

export const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name, customer_group_id, mobile, email, whatsapp_number,
      aadhar_number, tax_number, address, country, country_code,
      state, state_code, city, pincode, status,
    } = req.body;

    const existing = await Customer.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

    if (mobile) {
      const duplicate = await Customer.findOne({ mobile, _id: { $ne: id } });
      if (duplicate) {
        return res.status(400).json({ success: false, message: "Customer with this phone already exists" });
      }
    }

    const updateData = {
      name, customer_group_id: customer_group_id || null,
      mobile: mobile || "", email: email || "",
      whatsapp_number: whatsapp_number || "",
      aadhar_number: aadhar_number || "", tax_number: tax_number || "",
      address: address || "", country: country || "",
      country_code: country_code || "", state: state || "",
      state_code: state_code || "", city: city || "",
      pincode: pincode || "", status: status || "active",
    };

    if (req.file) {
      updateData.image = req.file.filename;
      updateData.image_url = `/uploads/customer/${req.file.filename}`;
    }

    const updated = await Customer.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      .populate("customer_group_id");

    return res.status(200).json({ success: true, message: "Customer updated successfully", data: updated });
  } catch (err) {
    console.error("Update customer error:", err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

export const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }
    await Customer.findByIdAndDelete(req.params.id);
    return res.status(200).json({ success: true, message: "Customer deleted successfully" });
  } catch (err) {
    console.error("Delete customer error:", err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

export const createCustomerGroup = async (req, res) => {
  try {
    const { customer_group } = req.body;
    if (!customer_group) {
      return res.status(400).json({ success: false, message: "Customer group name is required" });
    }

    const existing = await CustomerGroup.findOne({ customer_group });
    if (existing) {
      return res.status(400).json({ success: false, message: "Customer group already exists" });
    }

    const group = await CustomerGroup.create({ customer_group });
    return res.status(201).json({ success: true, message: "Customer group created successfully", data: group, created: group });
  } catch (err) {
    console.error("Create customer group error:", err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

export const getCustomerGroups = async (req, res) => {
  try {
    const groups = await CustomerGroup.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: groups });
  } catch (err) {
    console.error("Get customer groups error:", err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

export const updateCustomerGroup = async (req, res) => {
  try {
    const { customer_group } = req.body;
    if (!customer_group) {
      return res.status(400).json({ success: false, message: "Customer group name is required" });
    }

    const group = await CustomerGroup.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ success: false, message: "Customer group not found" });
    }

    const duplicate = await CustomerGroup.findOne({ customer_group, _id: { $ne: req.params.id } });
    if (duplicate) {
      return res.status(400).json({ success: false, message: "Customer group name already exists" });
    }

    const updated = await CustomerGroup.findByIdAndUpdate(req.params.id, { customer_group }, { new: true, runValidators: true });
    return res.status(200).json({ success: true, message: "Customer group updated successfully", data: updated });
  } catch (err) {
    console.error("Update customer group error:", err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

export const deleteCustomerGroup = async (req, res) => {
  try {
    const group = await CustomerGroup.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ success: false, message: "Customer group not found" });
    }
    await CustomerGroup.findByIdAndDelete(req.params.id);
    return res.status(200).json({ success: true, message: "Customer group deleted successfully" });
  } catch (err) {
    console.error("Delete customer group error:", err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};
