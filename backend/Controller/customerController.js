import mongoose from "mongoose";
import Customer from "../Models/models/Customer.js";
import CustomerGroup from "../Models/models/CustomerGroup.js";

export const createCustomer = async (req, res) => {
  try {
    const data = req.body;

   

    // 🔁 DUPLICATE MOBILE CHECK
    const existing = await Customer.findOne({ mobile: data.phone });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Customer with this phone already exists",
      });
    }

    // 🔍 VALIDATE CUSTOMER GROUP ID
    if (!mongoose.Types.ObjectId.isValid(data.customer_group_id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer group id",
      });
    }

    const group = await CustomerGroup.findById(data.customer_group_id);
    if (!group || group.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Customer group not found or inactive",
      });
    }

    // ✅ CREATE CUSTOMER
    const customer = await Customer.create({
      customer_group_id: data.customer_group_id,
      name: data.customer_name,
      mobile: data.phone,
      whatsapp_number: data.whatsapp_number || null,
      email: data.email || null,
      tax_number: data.tax_number || null,
      address: data.address,
      city: data.city,
      state: data.state,
      country: data.country,
      pincode: data.pincode,
      status: data.status ? "active" : "inactive",
    });

    // 🔥 POPULATED RESPONSE (GROUP NAME INCLUDED)
    const populatedCustomer = await Customer.findById(customer._id)
      .populate("customer_group_id", "customer_group");

    return res.status(201).json({
      success: true,
      message: "Customer created successfully",
      data: populatedCustomer,
    });
  } catch (error) {
    console.error("Create Customer Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const customer = await Customer.findByIdAndUpdate(id, data, { new: true });
    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }
    res.status(200).json({ success: true, message: "Customer updated", data: customer });
  } catch (error) {
    console.error("Error updating customer:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }

}

export const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find()
      .populate("customer_group_id", "customer_group"); // 👈 group name

    res.status(200).json({
      success: true,
      data: customers,
    });
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};


export const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await Customer.findById(id);
    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }
    res.status(200).json({ success: true, data: customer });
  } catch (error) {
    console.error("Error fetching customer:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
}

export const deleteCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        const customer = await Customer.findByIdAndDelete(id);
        if (!customer) {
            return res.status(404).json({ success: false, message: "Customer not found" });
        }
        res.status(200).json({ success: true, message: "Customer deleted" });
    } catch (error) {
        console.error("Error deleting customer:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
}