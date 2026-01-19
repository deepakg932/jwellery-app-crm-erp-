import CustomOrder from "../Models/models/CustomOrder.js"
import Customer from "../Models/models/Customer.js"
import { generateCustomOrderNumber } from "../helper/generateCustomOrderNumber.js";

import fs from "fs";
import path from "path";


export const createCustomOrder = async (req, res) => {
  try {
    const {
      customer_id,
      unit_id,
      weight,
      purity,
      delivery_date,
      status,
      notes,
    } = req.body;
    console.log("Request Body:", req.body)

    const customer = await Customer.findById(customer_id);
    console.log("Customer:", customer)
    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found",});
    }
const baseUrl = `${req.protocol}://${req.get("host")}`;
console.log("Base URL:", baseUrl);

   let imagePaths = [];
    if (req.files && req.files.length > 0) {
   imagePaths = req.files.map(
  f => `${baseUrl}/uploads/CustomOrders/${f.filename}`
);
    } else if (req.file) {
      imagePaths = [`/uploads/CustomOrders/${req.file.filename}`];
    }
    console.log("Image Paths:", imagePaths);

    const order = await CustomOrder.create({
      order_number: await generateCustomOrderNumber(),
      customer_id,
      weight,
        unit_id,
      purity,
      delivery_date,
      imagePaths,
      status,
      notes,
      images: imagePaths,
      created_by: req.user?._id,
    });


    const populatedOrder = await CustomOrder.findById(order._id)
      .populate("customer_id", "name mobile")
      .populate("unit_id", "name");

    return res.status(201).json({success: true,message: "Custom order created successfully",data: {
        ...populatedOrder.toObject(),
        customer_name: populatedOrder.customer_id.name,
        customer_mobile: populatedOrder.customer_id.mobile,
      },
    });

  } catch (error) {
    console.error("Create Custom Order Error:", error);
    return res.status(500).json({ success: false, message: error.message,});
  }
};


export const getCustomOrders = async (req, res) => {
  try {
    const {page = 1,limit = 10,search = "",customer_id,status} = req.query;

    const pageNumber = Number(page);
    const pageSize = Number(limit);

    
    const filter = {};
    console.log("Filters:", req.query);

    if (customer_id) {
      filter.customer_id = customer_id;
    }

    if (status) {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { order_number: { $regex: search, $options: "i" } },
        { design_name: { $regex: search, $options: "i" } },
        { jewellery_type: { $regex: search, $options: "i" } },
      ];
    }

    
    const totalOrders = await CustomOrder.countDocuments(filter);
    console.log("Total Orders:", totalOrders)


    const orders = await CustomOrder.find(filter)
      .populate("customer_id", "name mobile")
      .sort({ createdAt: -1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize);
console.log("Fetched Orders:", orders)
    return res.status(200).json({ success: true, meta: {total: totalOrders,page: pageNumber,limit: pageSize,total_pages: Math.ceil(totalOrders / pageSize),}, data: orders,
    });
    

  } catch (error) {
    console.error("Get Custom Orders Error:", error);
    return res.status(500).json({success: false,message: error.message});
  }
};




export const updateCustomOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      customer_id,
      unit_id,
      weight,
      purity,
      delivery_date,
      status,
      notes,
    } = req.body;


    const order = await CustomOrder.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Custom order not found",
      });
    }

 
    if (customer_id) {
      const customer = await Customer.findById(customer_id);
      if (!customer) {
        return res.status(404).json({
          success: false,
          message: "Customer not found",
        });
      }
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    let imagePaths = order.images || [];

    if (req.files && req.files.length > 0) {
      imagePaths = req.files.map(
        (f) => `${baseUrl}/uploads/CustomOrders/${f.filename}`
      );
    }

   
    order.customer_id = customer_id || order.customer_id;
    order.unit_id = unit_id || order.unit_id;
    order.weight = weight ?? order.weight;
    order.purity = purity || order.purity;
    order.delivery_date = delivery_date || order.delivery_date;
    order.status = status || order.status;
    order.notes = notes || order.notes;
    order.images = imagePaths;

    await order.save();


    const populatedOrder = await CustomOrder.findById(order._id)
      .populate("customer_id", "name mobile")
      .populate("unit_id", "name");

    return res.status(200).json({
      success: true,
      message: "Custom order updated successfully",
      data: {
        ...populatedOrder.toObject(),
        customer_name: populatedOrder.customer_id.name,
        customer_mobile: populatedOrder.customer_id.mobile,
      },
    });

  } catch (error) {
    console.error("Update Custom Order Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};






export const deleteCustomOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await CustomOrder.findById(id);
    console.log(order,"order to delete")
    if (!order) {
      return res.status(404).json({success: false,message: "Custom order not found", });
    }

    if (order.images && order.images.length > 0) {
      order.images.forEach((imgUrl) => {
        try {
         
          const filePath = path.join(
            process.cwd(),
            imgUrl.replace(`${req.protocol}://${req.get("host")}`, "")
          );

          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        } catch (err) {
          console.error("Image delete error:", err.message);
        }
      });
    }


  let a =   await CustomOrder.findByIdAndDelete(id);
    console.log("Deleted Order:", a);

    return res.status(200).json({success: true,message: "Custom order deleted successfully",
    });

  } catch (error) {
    console.error("Delete Custom Order Error:", error);
    return res.status(500).json({ success: false, message: error.message,});
  }
};
