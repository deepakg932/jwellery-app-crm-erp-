

import Quotation from "../Models/models/QuatationModel.js"
import Customer from "../Models/models/Customer.js";
import Product from "../Models/models/ProductModel.js";
import { generateQuotationNumber } from "../middleware/generateQuotationNumber.js";

export const createQuotation = async (req, res) => {
  try {
    const {
      customer_id,
      quotation_date,
      expiry_date,
      items,
      note,
      terms_conditions,
      shipping_cost = 0,
      discount = 0,
      branch_id,
      status,
      valid_days = 30,
    } = req.body;

    console.log("Creating quotation for customer ID:", customer_id);

    const customer = await Customer.findById(customer_id);
    console.log("Customer found:", customer)
    if (!customer) {
      return res.status(404).json({success: false,message: "Customer not found"});
    }

    let subtotal = 0;
    let taxTotal = 0;


    for (const item of items) {
      const product = await Product.findById(item.product_id);
      console.log("Processing item for product ID:", item.product_id, "Product found:", product)
      if (!product) {
        return res.status(404).json({success: false, message: "Product not found"});
      }

      const qty = Number(item.quantity);
      const price = Number(item.unit_price);
      const itemDiscount = Number(item.discount || 0);

      const beforeDiscount = qty * price;
      const afterDiscount = beforeDiscount - itemDiscount;

      const taxAmount = (afterDiscount * Number(item.tax_rate || 0)) / 100;
      const netPrice = afterDiscount + taxAmount;

      item.tax_amount = taxAmount;
      item.net_price = netPrice;
      item.subtotal = netPrice;

      subtotal += netPrice;
      taxTotal += taxAmount;
    }

    const grandTotal =
      subtotal + Number(shipping_cost) - Number(discount);

    const quotation = await Quotation.create({
      quotation_number: await generateQuotationNumber(),
      customer_id,
      quotation_date,
      expiry_date,
      items,
      note,
      terms_conditions,
      shipping_cost,
      discount,
      tax_amount: taxTotal,
      subtotal,
      total_amount: grandTotal,
      grand_total: grandTotal,
      branch_id,
      status,
      valid_days,
      created_by: req.user?._id,
    });
console.log("Quotation created with ID:", quotation._id)
    const populatedQuotation = await Quotation.findById(quotation._id)
      .populate("customer_id", "name mobile")
.populate("branch_id", "branch_name branch_code");

      console.log("Populated Quotation:", populatedQuotation)

    return res.status(200).json({success: true,message: "Quotation created successfully",data:{...populatedQuotation.toObject(),}});

  } catch (error) {
    console.error("Create Quotation Error:", error);
    return res.status(500).json({success: false,message: error.message });
  }
};




export const listQuotations = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      search,
    } = req.query;

    const skip = (page - 1) * limit;

    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { quotation_number: { $regex: search, $options: "i" } },
      ];
    }

    const quotations = await Quotation.find(filter)
      .populate("customer_id", "name mobile")
   .populate("branch_id", "branch_name branch_code")
      .sort({ createdAt: -1 })
      .skip(Number(skip))
      .limit(Number(limit));

    const total = await Quotation.countDocuments(filter);

    return res.status(200).json({
      success: true,
      data: quotations,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        total_pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("List Quotations Error:", error);
    return res.status(500).json({success: false,message: error.message});
  }
};


export const updateQuotation = async (req, res) => {
  try {
    const { id } = req.params;


    const oldQuotation = await Quotation.findById(id);
    if (!oldQuotation) {
      return res.status(404).json({
        success: false,
        message: "Quotation not found",
      });
    }




    const {
      customer_id,
      quotation_date,
      expiry_date,
      items,
      note,
      terms_conditions,
      shipping_cost = 0,
      discount = 0,
      branch_id,
      status,
      valid_days = 30,
    } = req.body;

    const quotation = await Quotation.findById(id);
    if (!quotation) {
      return res.status(404).json({success: false,message: "Quotation not found"});
    }

  
    if (customer_id) {
      const customer = await Customer.findById(customer_id);
      if (!customer) {
        return res.status(404).json({success: false, message: "Customer not found"});
      }
    }

    let subtotal = 0;
    let taxTotal = 0;

  
    if (items && items.length > 0) {
      for (const item of items) {
        const product = await Product.findById(item.product_id);
        if (!product) {
          return res.status(404).json({success: false,message: "Product not found",});
        }

        const qty = Number(item.quantity);
        const price = Number(item.unit_price);
        const itemDiscount = Number(item.discount || 0);

        const beforeDiscount = qty * price;
        const afterDiscount = beforeDiscount - itemDiscount;

        const taxAmount =
          (afterDiscount * Number(item.tax_rate || 0)) / 100;

        const netPrice = afterDiscount + taxAmount;

        item.tax_amount = taxAmount;
        item.net_price = netPrice;
        item.subtotal = netPrice;

        subtotal += netPrice;
        taxTotal += taxAmount;
      }
    }

    const grandTotal =
      subtotal + Number(shipping_cost) - Number(discount);


    quotation.customer_id = customer_id ?? quotation.customer_id;
    quotation.quotation_date = quotation_date ?? quotation.quotation_date;
    quotation.expiry_date = expiry_date ?? quotation.expiry_date;
    quotation.items = items ?? quotation.items;
    quotation.note = note ?? quotation.note;
    quotation.terms_conditions =
      terms_conditions ?? quotation.terms_conditions;
    quotation.shipping_cost = shipping_cost;
    quotation.discount = discount;
    quotation.tax_amount = taxTotal;
    quotation.subtotal = subtotal;
    quotation.total_amount = grandTotal;
    quotation.grand_total = grandTotal;
    quotation.branch_id = branch_id ?? quotation.branch_id;
    quotation.status = status ?? quotation.status;
    quotation.valid_days = valid_days;

    await quotation.save();

    const populatedQuotation = await Quotation.findById(quotation._id)
      .populate("customer_id", "name mobile")
      .populate("branch_id", "name code");

    return res.status(200).json({success: true,message: "Quotation updated successfully",data: populatedQuotation,});
  } catch (error) {
    console.error("Update Quotation Error:", error);
    return res.status(500).json({success: false,message: error.message, });
  }
};



export const deleteQuotation = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Deleting quotation with ID:", id)

   let jj = await Quotation.findByIdAndDelete(id);
   console.log("Deleted quotation:", jj);

    return res.status(200).json({success: true,message: "Quotation deleted successfully",});

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


export const getQuotationWithHistory = async (req, res) => {
  try {
    const { id } = req.params;

    const quotation = await Quotation.findById(id);
    if (!quotation) {
      return res.status(404).json({
        success: false,
        message: "Quotation not found",
      });
    }

    const parentId =
      quotation.parent_quotation_id || quotation._id;

    const allQuotations = await Quotation.find({
      $or: [
        { _id: parentId },
        { parent_quotation_id: parentId },
      ],
    })
      .sort({ version: 1 })
      .populate("customer_id", "name mobile")
      .populate("branch_id", "branch_name branch_code");

    const actual = allQuotations.find(q => q.is_latest);
    const old = allQuotations.filter(q => !q.is_latest);

    return res.status(200).json({
      success: true,
      data: {
        actual_quotation: actual,
        old_quotations: old,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
