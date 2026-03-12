import mongoose from "mongoose";
import Customer from "../Models/models/Customer.js";
import CustomerGroup from "../Models/models/CustomerGroup.js";
import SalesOrder from "../Models/models/SalesOrder.js";

export const createCustomer = async (req, res) => {
  try {
    const data = req.body;

    const existing = await Customer.findOne({ mobile: data.phone });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Customer with this phone already exists",
      });
    }

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

    // 🟢 IMAGE PATH
    let imagePath = null;
    if (req.file) {
      imagePath = `/uploads/customers/${req.file.filename}`;
    }
    console.log("Customer Image Path:", imagePath);

const customer = await Customer.create({
  customer_group_id: data.customer_group_id,

  name: data.customer_name || data.name,
  aadhar_number: data.aadhar_number,

  mobile: data.phone || data.mobile,
  whatsapp_number: data.whatsapp_number || null,

  email: data.email || null,
  tax_number: data.tax_number || null,

  address: data.address,
  city: data.city,
  state: data.state,
  country: data.country,
  pincode: data.pincode,

  status: data.status ? "active" : "inactive",
  image: imagePath,
});
    const populatedCustomer = await Customer.findById(customer._id).populate(
      "customer_group_id",
      "customer_group",
    );

    const BASE_URL =
      process.env.APP_URL || `${req.protocol}://${req.get("host")}`;

    const customerObj = populatedCustomer.toObject();

    customerObj.fullImageUrl = customerObj.image
      ? `${BASE_URL}${customerObj.image}`
      : null;

    return res.status(201).json({
      success: true,
      message: "Customer created successfully",
      data: customerObj,
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
      return res
        .status(404)
        .json({ success: false, message: "Customer not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Customer updated", data: customer });
  } catch (error) {
    console.error("Error updating customer:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};



export const getCustomers = async (req, res) => {
  try {
    const BASE_URL =
      process.env.APP_URL || `${req.protocol}://${req.get("host")}`;

    // 1️⃣ GET CUSTOMERS
    const customers = await Customer.find()
      .select(
        "name mobile email customer_group_id image whatsapp_number tax_number address city state country pincode aadhar_number status createdAt updatedAt"
      )
      .populate("customer_group_id", "customer_group")
      .lean();

    const customerIds = customers.map((c) => c._id);

    // 2️⃣ SALES SUMMARY
    const salesSummary = await SalesOrder.aggregate([
      {
        $match: { customer_id: { $in: customerIds } },
      },
      {
        $group: {
          _id: "$customer_id",
          total_sales: { $sum: "$total_amount" },
          total_paid: { $sum: "$paid_amount" },
          total_orders: { $sum: 1 },
        },
      },
    ]);

    // 3️⃣ LAST SALE
    const lastSales = await SalesOrder.aggregate([
      {
        $match: { customer_id: { $in: customerIds } },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$customer_id",
          last_sale_date: { $first: "$sale_date" },
          last_items: { $first: "$items" },
        },
      },
    ]);

    // 4️⃣ MAP LAST SALE
    const lastSaleMap = {};
    lastSales.forEach((s) => {
      const cleanItems = (s.last_items || []).map((i) => ({
        product_name: i.product_name,
        product_code: i.product_code,
        quantity: i.quantity,
      }));

      const totalQty =
        cleanItems.reduce((sum, i) => sum + Number(i.quantity || 0), 0) || 0;

      lastSaleMap[s._id.toString()] = {
        last_sale_date: s.last_sale_date,
        last_sale_items: cleanItems,
        last_sale_total_quantity: totalQty,
      };
    });

    // 5️⃣ MERGE ALL DATA
    const finalCustomers = customers.map((cust) => {
      const sale =
        salesSummary.find((s) => s._id.toString() === cust._id.toString()) ||
        {};
      const lastSale = lastSaleMap[cust._id.toString()] || {};

      const totalSales = sale.total_sales || 0;
      const totalPaid = sale.total_paid || 0;
      const totalOrders = sale.total_orders || 0;
      const totalBalance = Number((totalSales - totalPaid).toFixed(2));

      return {
        _id: cust._id,

        // 🔥 EXACT SAME AS CREATE RESPONSE
        customer_group_id: cust.customer_group_id,
        name: cust.name,
        customer_name: cust.name, // 👈 frontend ke liye
        mobile: cust.mobile,
        whatsapp_number: cust.whatsapp_number,
        email: cust.email,
        tax_number: cust.tax_number,
        address: cust.address,
        city: cust.city,
        state: cust.state,
        country: cust.country,
        pincode: cust.pincode,
        aadhar_number: cust.aadhar_number,
        status: cust.status,
        image: cust.image,

        // 🔥 IMAGE FULL URL
        fullImageUrl: cust.image ? `${BASE_URL}${cust.image}` : null,

        createdAt: cust.createdAt,
        updatedAt: cust.updatedAt,

        // 🔥 SALES SUMMARY
        total_sales: totalSales,
        total_paid: totalPaid,
        total_balance: totalBalance,
        total_orders: totalOrders,

        // 🔥 LAST SALE
        last_sale_date: lastSale.last_sale_date || null,
        last_sale_items: lastSale.last_sale_items || [],
        last_sale_total_quantity: lastSale.last_sale_total_quantity || 0,
      };
    });

    return res.status(200).json({
      success: true,
      data: finalCustomers,
    });
  } catch (error) {
    console.error("Error fetching customers:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};



export const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer id",
      });
    }

    // 1️⃣ get customer
    const customer = await Customer.findById(id)
      .populate("customer_group_id", "customer_group")
      .lean();

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // 2️⃣ sales aggregation
    const salesAgg = await SalesOrder.aggregate([
      {
        $match: {
          customer_id: new mongoose.Types.ObjectId(id),
        },
      },
      {
        $group: {
          _id: "$customer_id",
          total_sales: { $sum: "$total_amount" },
          total_paid: { $sum: "$paid_amount" },
          total_orders: { $sum: 1 },
        },
      },
    ]);

    const salesData = salesAgg[0] || {};

    const totalSales = salesData.total_sales || 0;
    const totalPaid = salesData.total_paid || 0;
    const totalOrders = salesData.total_orders || 0;

    const totalBalance = Number((totalSales - totalPaid).toFixed(2));

    // 3️⃣ last sale data
    const lastSaleAgg = await SalesOrder.aggregate([
      {
        $match: {
          customer_id: new mongoose.Types.ObjectId(id),
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $limit: 1,
      },
      {
        $project: {
          sale_date: 1,
          items: 1,
        },
      },
    ]);

    let lastSaleDate = null;
    let lastItems = [];
    let totalQty = 0;

    if (lastSaleAgg.length > 0) {
      lastSaleDate = lastSaleAgg[0].sale_date;

      lastItems = (lastSaleAgg[0].items || []).map((i) => ({
        product_name: i.product_name,
        product_code: i.product_code,
        quantity: i.quantity,
      }));

      totalQty = lastItems.reduce((sum, i) => sum + Number(i.quantity || 0), 0);
    }

    // 4️⃣ final response merge
    const finalCustomer = {
      ...customer,
      total_sales: totalSales,
      total_paid: totalPaid,
      total_balance: totalBalance,
      total_orders: totalOrders,
      last_sale_date: lastSaleDate,
      last_sale_items: lastItems,
      last_sale_total_quantity: totalQty,
    };

    return res.status(200).json({
      success: true,
      data: finalCustomer,
    });
  } catch (error) {
    console.error("Error fetching customer:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await Customer.findByIdAndDelete(id);
    if (!customer) {
      return res
        .status(404)
        .json({ success: false, message: "Customer not found" });
    }
    res.status(200).json({ success: true, message: "Customer deleted" });
  } catch (error) {
    console.error("Error deleting customer:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
