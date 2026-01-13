import PurchaseOrder from "../Models/models/PurchaseOrder.js";
import InventoryItem from "../Models/models/InventoryModel.js"
import Suppliers from "../Models/models/SuppliersModel.js";
import mongoose from "mongoose";
import Branch from "../Models/models/Branch.js"


export const getAllPurchaseOrders = async (req, res) => {
  try {
    const { status, supplier_id, startDate, endDate, search } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (supplier_id) filter.supplier_id = supplier_id;

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    if (search) {
      filter.$or = [
        { po_number: { $regex: search, $options: "i" } },
        { reference_no: { $regex: search, $options: "i" } },
        { notes: { $regex: search, $options: "i" } },
      ];
    }

    const purchaseOrders = await PurchaseOrder.find(filter)
      .populate("branch", "branch_name branch_code")
      .populate("supplier_id", "supplier_name supplier_code phone email")
      .populate("items.inventory_item_id", "name item_code")
      .populate("items.unit_id", "name code")
      .populate("created_by", "full_name email")
      .sort({ createdAt: -1 });

    const response = purchaseOrders.map(po => ({
      _id: po._id,
      po_number: po.po_number,
      reference_no: po.reference_no,

      branch: po.branch ? {
        _id: po.branch._id,
        name: po.branch.branch_name,
        code: po.branch.branch_code,
      } : null,

      supplier: po.supplier_id ? {
        _id: po.supplier_id._id,
        name: po.supplier_id.supplier_name,
        code: po.supplier_id.supplier_code,
        phone: po.supplier_id.phone,
        email: po.supplier_id.email,
      } : null,

      order_date: po.order_date,
      currency: po.currency,
      exchange_rate: po.exchange_rate,

      vat: po.vat,
      discount: po.discount,
      shipping_cost: po.shipping_cost,

      subtotal: po.subtotal,
      total_amount: po.total_amount,
      grand_total: po.grand_total,

      payment_status: po.payment_status,
      status: po.status,
      notes: po.notes,

      items: po.items.map(item => ({
        _id: item._id,

        inventory_item: item.inventory_item_id ? {
          _id: item.inventory_item_id._id,
          name: item.inventory_item_id.name,
          item_code: item.inventory_item_id.item_code,
        } : null,

        quantity: item.quantity,
        weight: item.weight,

        unit: item.unit_id ? {
          _id: item.unit_id._id,
          name: item.unit_id.name,
          code: item.unit_id.code,
        } : null,

        rate: item.rate,          // ✅ supplier quoted rate
        discount: item.discount,
        tax: item.tax,
        total: item.total,
      })),

      created_by: po.created_by ? {
        _id: po.created_by._id,
        name: po.created_by.full_name,
        email: po.created_by.email,
      } : null,

      createdAt: po.createdAt,
      updatedAt: po.updatedAt,
    }));

    return res.status(200).json({
      success: true,
      count: response.length,
      data: response,
    });

  } catch (error) {
    console.error("Get All Purchase Orders Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};




// export const getAllPurchaseOrders = async (req, res) => {
//   try {
//     const { status, supplier_id, startDate, endDate, search } = req.query;
//     console.log(req.query,"req.query")

//     const filter = {};
//     if (status) filter.status = status;
//     if (supplier_id) filter.supplier_id = supplier_id;

//     if (startDate || endDate) {
//       filter.createdAt = {};
//       if (startDate) filter.createdAt.$gte = new Date(startDate);
//       if (endDate) filter.createdAt.$lte = new Date(endDate);
//     }

//     if (search) {
//       filter.$or = [
//         { po_number: { $regex: search, $options: "i" } },
//         { notes: { $regex: search, $options: "i" } },
//          { notes: { $regex: search, $options: "i" } },
//       ];
//     }

//     const purchaseOrders = await PurchaseOrder.find(filter)
//        .populate("branch", "branch_name branch_code")
//       .populate("supplier_id", "supplier_name supplier_code phone email")
//       .populate("items.inventory_item_id", "name item_code")
//       .populate("items.unit_id", "name code")
//       .populate("created_by", "full_name email")
//       .sort({ createdAt: -1 });
// console.log(purchaseOrders,"purchaseOrders")
//  const response = purchaseOrders.map(po => ({
//       _id: po._id,
//       po_number: po.po_number,
//       reference_no: po.reference_no,

//       branch: po.branch ? {
//         _id: po.branch._id,
//         name: po.branch.branch_name,
//         code: po.branch.branch_code
//       } : null,

//       supplier: po.supplier_id ? {
//         _id: po.supplier_id._id,
//         name: po.supplier_id.supplier_name,
//         code: po.supplier_id.supplier_code,
//         phone: po.supplier_id.phone,
//         email: po.supplier_id.email
//       } : null,

//       order_date: po.order_date,
//       currency: po.currency,
//       exchange_rate: po.exchange_rate,

//       vat: po.vat,
//       discount: po.discount,
//       shipping_cost: po.shipping_cost,

//       subtotal: po.subtotal,
//       total_amount: po.total_amount,
//       grand_total: po.grand_total,

//       payment_status: po.payment_status,
//       status: po.status,
//       notes: po.notes,

//       items: po.items.map(item => ({
//         _id: item._id,

//         inventory_item: item.inventory_item_id ? {
//           _id: item.inventory_item_id._id,
//           name: item.inventory_item_id.name,
//           item_code: item.inventory_item_id.item_code
//         } : null,

//         quantity: item.quantity,
//         weight: item.weight,

//         unit: item.unit_id ? {
//           _id: item.unit_id._id,
//           name: item.unit_id.name,
//           code: item.unit_id.code
//         } : null,

//         net_unit_cost: item.net_unit_cost,
//         rate: item.rate,
//         purchase_price: item.purchase_price,
//         profit_margin: item.profit_margin,

//         discount: item.discount,
//         tax: item.tax,
//         total: item.total
//       })),

//       created_by: po.created_by ? {
//         _id: po.created_by._id,
//         name: po.created_by.full_name,
//         email: po.created_by.email
//       } : null,

//       createdAt: po.createdAt,
//       updatedAt: po.updatedAt
//     }));

//     return res.status(200).json({
//       success: true,
//       count: response.length,
//       data: response
//     });


//   } catch (error) {
//     console.error("Get All Purchase Orders Error:", error);
//     return res.status(500).json({success: false,message: "Internal server error",});
//   }
// };


export const getPurchaseOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id,"id")
    
    const purchaseOrder = await PurchaseOrder.findById(id)
      .populate({
        path: 'supplier_id',
        select: '_id supplier_name'
      })
      .populate({
        path: 'items.inventory_item_id',
        select: '_id item_name sku_code track_by'
      })
      .populate({
        path: 'items.unit_id',
        select: '_id name'
      })
      .populate({
        path: 'created_by',
        select: '_id name'
      })
      .populate({
        path: 'approved_by',
        select: '_id name'
      });

      console.log("purchaseOrder",purchaseOrder)

    if (!purchaseOrder) {
      return res.status(404).json({ success: false, message: "Purchase order not found"});
    }

    const customResponse = {
      _id: purchaseOrder._id,
      po_number: purchaseOrder.po_number,
      supplier_id: purchaseOrder.supplier_id ? {
        _id: purchaseOrder.supplier_id._id,
        name: purchaseOrder.supplier_id.supplier_name
      } : null,
      items: purchaseOrder.items.map(item => ({
        _id: item._id,
        inventory_item_id: item.inventory_item_id ? {
          _id: item.inventory_item_id._id,
          name: item.inventory_item_id.item_name,
          sku_code: item.inventory_item_id.sku_code,
          track_by: item.inventory_item_id.track_by
        } : null,
        quantity: item.quantity,
        weight: item.weight,
        rate: item.rate,
        expected_date: item.expected_date,
        status: item.status,
        unit_id: item.unit_id ? {
          _id: item.unit_id._id,
          name: item.unit_id.name
        } : null,
    
        metal_purities: item.metal_purities || [],
        stone_purities: item.stone_purities || []
      })),
      status: purchaseOrder.status,
      total_amount: purchaseOrder.total_amount,
      notes: purchaseOrder.notes,
      order_date: purchaseOrder.order_date,
      createdAt: purchaseOrder.createdAt,
      updatedAt: purchaseOrder.updatedAt,
      payment_terms: purchaseOrder.payment_terms,
payment_type: purchaseOrder.payment_type,
expected_delivery_date: purchaseOrder.expected_delivery_date || null,
    };

    return res.status(200).json({success: true,data: customResponse});

  } catch (error) {
    console.error("Get Purchase Order by ID Error:", error);
    return res.status(500).json({success: false,message: "Internal server error"});
  }
};


export const getPurchaseOrdersPaginated = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      supplier_id,
      branch_id,
      startDate,
      endDate,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const filter = {};

    
    if (status) filter.status = status;
    if (supplier_id) filter.supplier_id = supplier_id;
    if (branch_id) filter.branch = branch_id;

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    if (search) {
      const supplierIds = await Suppliers.find({
        supplier_name: { $regex: search, $options: "i" },
      }).select("_id");

      filter.$or = [
        { po_number: { $regex: search, $options: "i" } },
        { notes: { $regex: search, $options: "i" } },
        { supplier_id: { $in: supplierIds.map(s => s._id) } },
      ];
    }

    
    const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };
    const skip = (Number(page) - 1) * Number(limit);

    const [purchaseOrders, totalCount] = await Promise.all([
      PurchaseOrder.find(filter)
        .populate("branch", "branch_name branch_code")
        .populate("supplier_id", "supplier_name supplier_code")
        .populate("items.inventory_item_id", "name item_code")
        .populate("items.unit_id", "name code")
        .sort(sort)
        .skip(skip)
        .limit(Number(limit)),

      PurchaseOrder.countDocuments(filter),
    ]);

    const response = purchaseOrders.map(po => ({
      _id: po._id,
      po_number: po.po_number,
      branch: po.branch,
      supplier: po.supplier_id,
      items_count: po.items.length,
      subtotal: po.subtotal,
      total_amount: po.total_amount,
      grand_total: po.grand_total,
      payment_status: po.payment_status,
      status: po.status,
      order_date: po.order_date,
      createdAt: po.createdAt,
    }));

    return res.status(200).json({success: true,data: response,pagination: {
        page: Number(page),
        limit: Number(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Get Purchase Orders Paginated Error:", error);
    return res.status(500).json({success: false,message: "Internal server error"});
  }
};




export const updatePOItemStatus = async (req, res) => {
  try {
    const { poId, itemId } = req.params;
    const { status, received_quantity, received_weight } = req.body;


    const validItemStatuses = ["pending", "partially_received", "received", "cancelled"];
    if (!status || !validItemStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Valid status is required (pending, partially_received, received, cancelled)"
      });
    }

    const updateFields = { "items.$.status": status };

   
    if (received_quantity !== undefined) {
      const rq = Number(received_quantity);
      if (Number.isNaN(rq) || rq < 0) {
        return res.status(400).json({ success: false, message: "received_quantity must be a non-negative number" });
      }
      updateFields["items.$.received_quantity"] = rq;
    }
    if (received_weight !== undefined) {
      const rw = Number(received_weight);
      if (Number.isNaN(rw) || rw < 0) {
        return res.status(400).json({ success: false, message: "received_weight must be a non-negative number" });
      }
      updateFields["items.$.received_weight"] = rw;
    }

   
    const updatedPO = await PurchaseOrder.findOneAndUpdate(
      { _id: poId, "items._id": itemId },
      { $set: updateFields },
      { new: true }
    )
      .populate({ path: "supplier_id", select: "supplier_name" })
      .populate({ path: "items.inventory_item_id", select: "_id item_name" })
      .populate({ path: "items.unit_id", select: "_id name" });

    if (!updatedPO) {
      return res.status(404).json({ success: false, message: "Purchase Order or Item not found" });
    }

    
    const allItemsReceived = updatedPO.items.every(item => item.status === "received");
    const someItemsReceived = updatedPO.items.some(
      item => item.status === "received" || item.status === "partially_received"
    );

    let overallStatus = updatedPO.status;
    if (allItemsReceived && updatedPO.status !== "completed") {
      overallStatus = "completed";
    } else if (someItemsReceived && updatedPO.status === "pending") {
      overallStatus = "partially_received";
    }

    if (overallStatus !== updatedPO.status) {
      await PurchaseOrder.findByIdAndUpdate(poId, { status: overallStatus });
      updatedPO.status = overallStatus;
    }

    const customResponse = {
      _id: updatedPO._id,
      po_number: updatedPO.po_number,
      status: updatedPO.status,
      items: updatedPO.items.map(item => ({
        _id: item._id,
        inventory_item_id: item.inventory_item_id
          ? { _id: item.inventory_item_id._id, name: item.inventory_item_id.item_name }
          : null,
        quantity: item.quantity,
        weight: item.weight,
        rate: item.rate,
        expected_date: item.expected_date,
        status: item.status,
        unit_id: item.unit_id ? { _id: item.unit_id._id, name: item.unit_id.name } : null,
        received_quantity: item.received_quantity ?? null,
        received_weight: item.received_weight ?? null
      }))
    };

    return res.status(200).json({success: true,message: `Item status updated to ${status}`,data: customResponse});
  } catch (error) {
    console.error("Update PO Item Status Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};



export const updatePOStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, approved_by } = req.body;

    const validStatuses = ["draft", "pending", "approved", "partially_received", "received", "cancelled"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Valid status is required. Allowed values: ${validStatuses.join(", ")}`
      });
    }

    // Fetch existing PO for validations
    const existingPO = await PurchaseOrder.findById(id).populate({
      path: "items.inventory_item_id",
      select: "_id item_name"
    });
    if (!existingPO) {
      return res.status(404).json({ success: false, message: "Purchase Order not found" });
    }

    // If approving, approved_by must be present
    const updateData = { status };
    if (status === "approved") {
      if (!approved_by) {
        return res.status(400).json({ success: false, message: "approved_by is required when status = approved" });
      }
      updateData.approved_by = approved_by;
    }

    // Safeguard: cannot mark completed unless all items received
    if (status === "received") {
      const allReceived = existingPO.items.length > 0 && existingPO.items.every(i => i.status === "received");
      if (!allReceived) {
        return res.status(400).json({
          success: false,
          message: "PO cannot be marked completed until all items are received"
        });
      }
    }

    const updatedPO = await PurchaseOrder.findByIdAndUpdate(id, updateData, { new: true })
      .populate({ path: "supplier_id", select: "supplier_name" })
      .populate({ path: "items.inventory_item_id", select: "_id item_name" })
      .populate({ path: "items.unit_id", select: "_id name" })
      .populate({ path: "approved_by", select: "_id name" });

    const customResponse = {
      _id: updatedPO._id,
      po_number: updatedPO.po_number,
      status: updatedPO.status,
      supplier_id: updatedPO.supplier_id
        ? { _id: updatedPO.supplier_id._id, name: updatedPO.supplier_id.supplier_name }
        : null,
      approved_by: updatedPO.approved_by ? { _id: updatedPO.approved_by._id, name: updatedPO.approved_by.name } : null,
      updatedAt: updatedPO.updatedAt
    };

    return res.status(200).json({
      success: true,
      message: `Purchase Order status updated to ${status}`,
      data: customResponse
    });
  } catch (error) {
    console.error("Update PO Status Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};




export const deletePurchaseOrder = async(req,res)=>{
  const {id} = req.params;
  console.log(id,"id")
  
  try{

    const checkd = await PurchaseOrder.findById(id)
    console.log(checkd,"checked")
    if(!checkd){
      return res.status(404).json({status:false,message:"Order not found"})
    }
    else{
      let deleted = await PurchaseOrder.findByIdAndDelete(id)
      console.log(deleted,"deleted")
      if(deleted){
        return res.status(200).json({status:true,message:"Purchase order deleted"})
      }
    }
  }catch(e){
     console.error("Update PO Status Error:", e);
return res.status(500).json({success: false,message: "Internal server error"});
  }

}


// export const updatePurchaseOrder = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const {
//       supplier_id,
//       branch_id,
//       reference_no,
//       order_date,
//       currency,
//       exchange_rate,

//       vat,
//       discount,
//       shipping_cost,
//       subtotal,
//       total_amount,
//       grand_total,

//       payment_status,
//       status,
//       notes,
//       items,
//     } = req.body;

//    console.log(req.body,"req.body")
//     const existingPO = await PurchaseOrder.findById(id);
//     console.log(existingPO,"exitingPOO")
//     if (!existingPO) {
//       return res.status(404).json({ success: false, message: "Purchase Order not found", });
//     }

   
//     if (branch_id) {
//       if (!mongoose.Types.ObjectId.isValid(branch_id)) {
//         return res.status(400).json({ success: false, message: "Invalid branch ID" });
//       }

//       const branch = await Branch.findById(branch_id);
//       console.log(branch,"branch")
//       if (!branch) {
//         return res.status(404).json({ success: false, message: "Branch not found" });
//       }
//     }

//     if (supplier_id) {
//       if (!mongoose.Types.ObjectId.isValid(supplier_id)) {
//         return res.status(400).json({ success: false, message: "Invalid supplier ID" });
//       }

//       const supplier = await Suppliers.findById(supplier_id);
//       if (!supplier) {
//         return res.status(404).json({ success: false, message: "Supplier not found" });
//       }
//     }

   
//     let validatedItems = existingPO.items;

//     if (items && items.length > 0) {
//       validatedItems = [];

//       for (const item of items) {
//         const {
//           inventory_item_id,
//           quantity = 0,
//           weight = 0,
//           unit_id,
//           rate,
//           net_unit_cost,
//           purchase_price,
//           profite_margin,
//           discount = 0,
//           tax = 0,
//           total,
//         } = item;

//         if (!inventory_item_id || !unit_id || !rate) {
//           return res.status(400).json({success: false,message: "Inventory item, unit and rate are required",});
//         }

//         if (quantity <= 0 && weight <= 0) {
//           return res.status(400).json({success: false,message: "Either quantity or weight is required",});
//         }

//         const inventory = await InventoryItem.findById(inventory_item_id);
//         console.log(inventory,"inventoryy")
//         if (!inventory) {
//           return res.status(404).json({ success: false, message: "Inventory item not found"});
//         }

//         validatedItems.push({
//           inventory_item_id,
//           quantity,
//           weight,
//           unit_id,
//           rate,
//           net_unit_cost: net_unit_cost ?? rate,
//           purchase_price: purchase_price ?? rate,
//           profite_margin: profite_margin ?? 0,
//           discount,
//           tax,
//           total,
//         });
//       }
//     }


//     const updateData = {
//       supplier_id: supplier_id ?? existingPO.supplier_id,
//       branch: branch_id ?? existingPO.branch,
//       reference_no: reference_no ?? existingPO.reference_no,
//       order_date: order_date ? new Date(order_date) : existingPO.order_date,
//       currency: currency ?? existingPO.currency,
//       exchange_rate: exchange_rate ?? existingPO.exchange_rate,

//       items: validatedItems,

//       vat: vat ?? existingPO.vat,
//       discount: discount ?? existingPO.discount,
//       shipping_cost: shipping_cost ?? existingPO.shipping_cost,
//       subtotal: subtotal ?? existingPO.subtotal,
//       total_amount: total_amount ?? existingPO.total_amount,
//       grand_total: grand_total ?? existingPO.grand_total,

//       payment_status: payment_status ?? existingPO.payment_status,
//       status: status ?? existingPO.status,
//       notes: notes ?? existingPO.notes,
//     };

//  console.log(updateData,"updateddata")
//     const updatedPO = await PurchaseOrder.findByIdAndUpdate(
//       id,
//       updateData,
//       { new: true, runValidators: true }
//     )
//       .populate("branch", "branch_name branch_code")
//       .populate("supplier_id", "supplier_name supplier_code phone email")
//       .populate("items.inventory_item_id", "name item_code")
//       .populate("items.unit_id", "name code")
//       .populate("created_by", "full_name email");

//     return res.status(200).json({success: true,message: "Purchase Order updated successfully",data: updatedPO,});

//   } catch (error) {
//     console.error("Update Purchase Order Error:", error);
//     return res.status(500).json({ success: false, message: error.message || "Internal server error",});
//   }
// };






export const exportPurchaseOrders = async (req, res) => {
  try {
    const orders = await PurchaseOrder.find().populate("supplier_id", "supplier_name");
    const csvRows = ["PO Number,Supplier,Amount,Status,Order Date"];
    orders.forEach(po => {
      csvRows.push(`${po.po_number},${po.supplier_id?.supplier_name},${po.total_amount},${po.status},${po.order_date.toISOString().split('T')[0]}`);
    });
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=po_export.csv");
    res.send(csvRows.join("\n"));
  } catch (err) {
    res.status(500).json({ success: false, message: "Export failed", error: err.message });
  }
};


export const getPOHistory = async (req, res) => {
 
  return res.status(501).json({ success: false, message: "Audit log not implemented yet" });
};


export const generatePOPDF = async (req, res) => {

  return res.status(501).json({ success: false, message: "PDF generation not implemented yet" });
};



// export const createPurchaseOrder = async (req, res) => {
//   try {
//     const {
//       supplier_id,
//       branch_id,
//       reference_no,
//       order_date,
//       currency = "USD",
//       exchange_rate = 1,

//       vat = 0,
//       discount = 0,
//       shipping_cost = 0,
//       subtotal = 0,
//       total_amount = 0,
//       grand_total = 0,

//       payment_status = "pending",
//       notes,
//       items = [],
//     } = req.body;

//     if (!branch_id || !supplier_id || items.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Branch, supplier and items are required",
//       });
//     }

//     const branch = await Branch.findById(branch_id);
//     if (!branch) return res.status(404).json({ success: false, message: "Branch not found" });

//     const supplier = await Suppliers.findById(supplier_id);
//     if (!supplier) return res.status(404).json({ success: false, message: "Supplier not found" });

//     const validatedItems = [];

//     for (const item of items) {
//       const {
//         inventory_item_id,
//         quantity = 0,
//         weight = 0,
//         unit_id,
//         rate,
//         discount = 0,
//         tax = 0,
//         total = 0,
//       } = item;

//       if (!inventory_item_id || !unit_id) {
//         return res.status(400).json({
//           success: false,
//           message: "Inventory item and unit are required",
//         });
//       }

//       if (quantity <= 0 && weight <= 0) {
//         return res.status(400).json({
//           success: false,
//           message: "Either quantity or weight is required",
//         });
//       }

//       const inventory = await InventoryItem.findById(inventory_item_id);
//       if (!inventory) {
//         return res.status(404).json({
//           success: false,
//           message: "Inventory item not found",
//         });
//       }

//       const finalRate = rate ?? inventory.purchase_price;

//       validatedItems.push({
//         inventory_item_id,
//         quantity,
//         weight,
//         unit_id,

//         rate: finalRate,
//         purchase_price: finalRate,
//         net_unit_cost: finalRate,

//         discount,
//         tax,
//         total,
//       });
//     }

//     const po = await PurchaseOrder.create({
//       supplier_id,
//       branch: branch_id,
//       reference_no,
//       order_date: order_date ? new Date(order_date) : new Date(),
//       currency,
//       exchange_rate,

//       items: validatedItems,

//       vat,
//       discount,
//       shipping_cost,
//       subtotal,
//       total_amount,
//       grand_total,

//       payment_status,
//       notes,
//       created_by: req.user?._id || null,
//     });

//     const populatedPO = await PurchaseOrder.findById(po._id)
//       .populate("branch", "branch_name branch_code")
//       .populate("supplier_id", "supplier_name supplier_code phone email")
//       .populate("items.inventory_item_id", "name item_code")
//       .populate("items.unit_id", "name code")
//       .populate("created_by", "full_name email");

//     return res.status(201).json({
//       success: true,
//       message: "Purchase Order created successfully",
//       data: populatedPO,
//     });

//   } catch (error) {
//     console.error("Create Purchase Order Error:", error);
//     return res.status(500).json({
//       success: false,
//       message: error.message || "Internal server error",
//     });
//   }
// };





export const searchInventoryItems = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(200).json({
        success: true,
        data: []
      });
    }

    const items = await InventoryItem.find({
      $or: [
        { item_code: { $regex: q, $options: "i" } },
        { name: { $regex: q, $options: "i" } }
      ],
      status: "active"
    })
      .select("_id item_code name purchase_price")
      .limit(20);

    return res.status(200).json({
      success: true,
      data: items.map(item => ({
        _id: item._id,
        label: `${item.item_code} - ${item.name}`, // 👈 UI dropdown
        item_code: item.item_code,
        name: item.name,
        price: item.purchase_price
      }))
    });

  } catch (err) {
    console.error("Inventory Search Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

export const createPurchaseOrder = async (req, res) => {
  try {
    const {
      supplier_id,
      branch_id,
      reference_no,
      order_date,
      currency = "USD",
      exchange_rate = 1,

      vat = 0,
      discount = 0,
      shipping_cost = 0,
      subtotal = 0,
      total_amount = 0,
      grand_total = 0,

      payment_status = "pending",
      notes,
      items = [],
    } = req.body;

    if (!branch_id || !supplier_id || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Branch, supplier and items are required",
      });
    }

    const branch = await Branch.findById(branch_id);
    if (!branch) return res.status(404).json({ success: false, message: "Branch not found" });

    const supplier = await Suppliers.findById(supplier_id);
    if (!supplier) return res.status(404).json({ success: false, message: "Supplier not found" });

    const validatedItems = [];

    for (const item of items) {
      const {
        inventory_item_id,
        quantity = 0,
        weight = 0,
        unit_id,
        rate,
        discount = 0,
        tax = 0,
        total = 0,
      } = item;

      if (!inventory_item_id || !unit_id) {
        return res.status(400).json({
          success: false,
          message: "Inventory item and unit are required",
        });
      }

      if (quantity <= 0 && weight <= 0) {
        return res.status(400).json({
          success: false,
          message: "Either quantity or weight is required",
        });
      }

      const inventory = await InventoryItem.findById(inventory_item_id);
      if (!inventory) {
        return res.status(404).json({
          success: false,
          message: "Inventory item not found",
        });
      }

      const finalRate = rate ?? inventory.purchase_price;

      validatedItems.push({
        inventory_item_id,
        quantity,
        weight,
        unit_id,

        rate: finalRate,
        purchase_price: finalRate,
        net_unit_cost: finalRate,

        discount,
        tax,
        total,
      });
    }

    const po = await PurchaseOrder.create({
      supplier_id,
      branch: branch_id,
      reference_no,
      order_date: order_date ? new Date(order_date) : new Date(),
      currency,
      exchange_rate,

      items: validatedItems,

      vat,
      discount,
      shipping_cost,
      subtotal,
      total_amount,
      grand_total,

      payment_status,
      notes,
      created_by: req.user?._id || null,
    });

    const populatedPO = await PurchaseOrder.findById(po._id)
      .populate("branch", "branch_name branch_code")
      .populate("supplier_id", "supplier_name supplier_code phone email")
      .populate("items.inventory_item_id", "name item_code")
      .populate("items.unit_id", "name code")
      .populate("created_by", "full_name email");

    return res.status(201).json({
      success: true,
      message: "Purchase Order created successfully",
      data: populatedPO,
    });

  } catch (error) {
    console.error("Create Purchase Order Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};



// export const updatePurchaseOrder = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const {
//       supplier_id,
//       branch_id,
//       reference_no,
//       order_date,
//       currency,
//       exchange_rate,

//       vat,
//       discount,
//       shipping_cost,
//       subtotal,
//       total_amount,
//       grand_total,

//       payment_status,
//       status,
//       notes,
//       items,
//     } = req.body;

//     const existingPO = await PurchaseOrder.findById(id);
//     if (!existingPO) {
//       return res.status(404).json({
//         success: false,
//         message: "Purchase Order not found",
//       });
//     }

    
//     if (branch_id) {
//       if (!mongoose.Types.ObjectId.isValid(branch_id)) {
//         return res.status(400).json({ success: false, message: "Invalid branch ID" });
//       }
//       const branch = await Branch.findById(branch_id);
//       if (!branch) {
//         return res.status(404).json({ success: false, message: "Branch not found" });
//       }
//     }

//     if (supplier_id) {
//       if (!mongoose.Types.ObjectId.isValid(supplier_id)) {
//         return res.status(400).json({ success: false, message: "Invalid supplier ID" });
//       }
//       const supplier = await Suppliers.findById(supplier_id);
//       if (!supplier) {
//         return res.status(404).json({ success: false, message: "Supplier not found" });
//       }
//     }

//     let validatedItems = existingPO.items;

//     if (items && items.length > 0) {
//       validatedItems = [];

//       for (const item of items) {
//         const {
//           inventory_item_id,
//           quantity = 0,
//           weight = 0,
//           unit_id,
//           rate,
//           discount = 0,
//           tax = 0,
//           total = 0,
//         } = item;

//         if (!inventory_item_id || !unit_id || rate === undefined) {
//           return res.status(400).json({
//             success: false,
//             message: "Inventory item, unit and rate are required",
//           });
//         }

//         if (quantity <= 0 && weight <= 0) {
//           return res.status(400).json({
//             success: false,
//             message: "Either quantity or weight is required",
//           });
//         }

//         const inventory = await InventoryItem.findById(inventory_item_id);
//         if (!inventory) {
//           return res.status(404).json({
//             success: false,
//             message: "Inventory item not found",
//           });
//         }

//         validatedItems.push({
//           inventory_item_id,
//           quantity,
//           weight,
//           unit_id,
//           rate,
//           discount,
//           tax,
//           total,
//         });
//       }
//     }


//     const updateData = {
//       supplier_id: supplier_id ?? existingPO.supplier_id,
//       branch: branch_id ?? existingPO.branch,
//       reference_no: reference_no ?? existingPO.reference_no,
//       order_date: order_date ? new Date(order_date) : existingPO.order_date,
//       currency: currency ?? existingPO.currency,
//       exchange_rate: exchange_rate ?? existingPO.exchange_rate,

//       items: validatedItems,

//       vat: vat ?? existingPO.vat,
//       discount: discount ?? existingPO.discount,
//       shipping_cost: shipping_cost ?? existingPO.shipping_cost,
//       subtotal: subtotal ?? existingPO.subtotal,
//       total_amount: total_amount ?? existingPO.total_amount,
//       grand_total: grand_total ?? existingPO.grand_total,

//       payment_status: payment_status ?? existingPO.payment_status,
//       status: status ?? existingPO.status,
//       notes: notes ?? existingPO.notes,
//     };

//     const updatedPO = await PurchaseOrder.findByIdAndUpdate(
//       id,
//       updateData,
//       { new: true, runValidators: true }
//     )
//       .populate("branch", "branch_name branch_code")
//       .populate("supplier_id", "supplier_name supplier_code phone email")
//       .populate("items.inventory_item_id", "name item_code")
//       .populate("items.unit_id", "name code")
//       .populate("created_by", "full_name email");

//     return res.status(200).json({
//       success: true,
//       message: "Purchase Order updated successfully",
//       data: updatedPO,
//     });

//   } catch (error) {
//     console.error("Update Purchase Order Error:", error);
//     return res.status(500).json({
//       success: false,
//       message: error.message || "Internal server error",
//     });
//   }
// };


export const updatePurchaseOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      supplier_id,
      branch_id,
      reference_no,
      order_date,
      currency,
      exchange_rate,

      vat,
      discount,
      shipping_cost,
      subtotal,
      total_amount,
      grand_total,

      payment_status,
      status,
      notes,
      items,
    } = req.body;

    const existingPO = await PurchaseOrder.findById(id);
    if (!existingPO) {
      return res.status(404).json({
        success: false,
        message: "Purchase Order not found",
      });
    }

    // Validate branch
    if (branch_id) {
      if (!mongoose.Types.ObjectId.isValid(branch_id)) {
        return res.status(400).json({ success: false, message: "Invalid branch ID" });
      }
      const branch = await Branch.findById(branch_id);
      if (!branch) {
        return res.status(404).json({ success: false, message: "Branch not found" });
      }
    }

    // Validate supplier
    if (supplier_id) {
      if (!mongoose.Types.ObjectId.isValid(supplier_id)) {
        return res.status(400).json({ success: false, message: "Invalid supplier ID" });
      }
      const supplier = await Suppliers.findById(supplier_id);
      if (!supplier) {
        return res.status(404).json({ success: false, message: "Supplier not found" });
      }
    }

    let validatedItems = existingPO.items;

    if (items && items.length > 0) {
      validatedItems = [];

      for (const item of items) {
        const {
          inventory_item_id,
          quantity = 0,
          weight = 0,
          received_quantity = 0,
          received_weight = 0,
          unit_id,
          rate,
          discount = 0,
          tax = 0,
          total = 0,
        } = item;

        // Validation
        if (!inventory_item_id || !unit_id || rate === undefined) {
          return res.status(400).json({
            success: false,
            message: "Inventory item, unit and rate are required",
          });
        }

        if (quantity <= 0 && weight <= 0) {
          return res.status(400).json({
            success: false,
            message: "Either quantity or weight is required",
          });
        }

        // ✅ Validate received quantities don't exceed ordered quantities
        if (received_quantity > quantity) {
          return res.status(400).json({
            success: false,
            message: "Received quantity cannot exceed ordered quantity",
          });
        }

        if (received_weight > weight) {
          return res.status(400).json({
            success: false,
            message: "Received weight cannot exceed ordered weight",
          });
        }

        const inventory = await InventoryItem.findById(inventory_item_id);
        if (!inventory) {
          return res.status(404).json({
            success: false,
            message: "Inventory item not found",
          });
        }

        validatedItems.push({
          inventory_item_id,
          quantity,
          weight,
          received_quantity,
          received_weight,
          unit_id,
          rate,
          discount,
          tax,
          total,
        });
      }
    }

    // ✅ Calculate overall PO status based on received quantities
    let finalStatus = status || existingPO.status;
    
    if (items && items.length > 0) {
      let totalOrderedQty = 0;
      let totalReceivedQty = 0;
      let totalOrderedWeight = 0;
      let totalReceivedWeight = 0;

      for (const item of validatedItems) {
        totalOrderedQty += item.quantity || 0;
        totalReceivedQty += item.received_quantity || 0;
        totalOrderedWeight += item.weight || 0;
        totalReceivedWeight += item.received_weight || 0;
      }

      // Auto-update status based on received quantities
      if (totalReceivedQty === 0 && totalReceivedWeight === 0) {
        finalStatus = "approved"; // Nothing received yet
      } else if ((totalReceivedQty > 0 && totalReceivedQty < totalOrderedQty) || 
                 (totalReceivedWeight > 0 && totalReceivedWeight < totalOrderedWeight)) {
        finalStatus = "partially_received";
      } else if ((totalReceivedQty >= totalOrderedQty) && 
                 (totalReceivedWeight >= totalOrderedWeight)) {
        finalStatus = "completed";
      }
    }

    const updateData = {
      supplier_id: supplier_id ?? existingPO.supplier_id,
      branch: branch_id ?? existingPO.branch,
      reference_no: reference_no ?? existingPO.reference_no,
      order_date: order_date ? new Date(order_date) : existingPO.order_date,
      currency: currency ?? existingPO.currency,
      exchange_rate: exchange_rate ?? existingPO.exchange_rate,

      items: validatedItems,

      vat: vat ?? existingPO.vat,
      discount: discount ?? existingPO.discount,
      shipping_cost: shipping_cost ?? existingPO.shipping_cost,
      subtotal: subtotal ?? existingPO.subtotal,
      total_amount: total_amount ?? existingPO.total_amount,
      grand_total: grand_total ?? existingPO.grand_total,

      payment_status: payment_status ?? existingPO.payment_status,
      status: finalStatus, // ✅ Updated status
      notes: notes ?? existingPO.notes,
    };

    const updatedPO = await PurchaseOrder.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate("branch", "branch_name branch_code")
      .populate("supplier_id", "supplier_name supplier_code phone email")
      .populate("items.inventory_item_id", "name item_code")
      .populate("items.unit_id", "name code")
      .populate("created_by", "full_name email");

    return res.status(200).json({
      success: true,
      message: "Purchase Order updated successfully",
      data: updatedPO,
    });

  } catch (error) {
    console.error("Update Purchase Order Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};





export const getPOReceivedStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const purchaseOrder = await PurchaseOrder.findById(id)
      .populate({
        path: "items.inventory_item_id",
        select: "name item_code unit_type category"
      })
      .populate({
        path: "items.unit_id",
        select: "name code"
      })
      .populate({
        path: "supplier_id",
        select: "supplier_name supplier_code"
      })
      .populate({
        path: "branch",
        select: "branch_name"
      });

    if (!purchaseOrder) {
      return res.status(404).json({
        success: false,
        message: "Purchase Order not found"
      });
    }

    // ---------------- ITEM STATUS CALCULATION ----------------
    const itemWiseStatus = purchaseOrder.items.map(item => {
      const orderedQty = item.quantity || 0;
      const orderedWeight = item.weight || 0;
      const receivedQty = item.received_quantity || 0;
      const receivedWeight = item.received_weight || 0;

      const qtyPercentage =
        orderedQty > 0 ? (receivedQty / orderedQty) * 100 : 0;
      const weightPercentage =
        orderedWeight > 0 ? (receivedWeight / orderedWeight) * 100 : 0;

      let itemStatus = "pending";
      if (receivedQty === 0 && receivedWeight === 0) {
        itemStatus = "pending";
      } else if (
        (orderedQty > 0 && receivedQty < orderedQty) ||
        (orderedWeight > 0 && receivedWeight < orderedWeight)
      ) {
        itemStatus = "partially_received";
      } else {
        itemStatus = "received";
      }

      return {
        item_id: item.inventory_item_id?._id,
        item_name: item.inventory_item_id?.name,
        item_code: item.inventory_item_id?.item_code,

        unit: item.unit_id
          ? {
              _id: item.unit_id._id,
              name: item.unit_id.name,
              code: item.unit_id.code
            }
          : null,

        ordered_quantity: orderedQty,
        ordered_weight: orderedWeight,

        received_quantity: receivedQty,
        received_weight: receivedWeight,

        balance_quantity: orderedQty - receivedQty,
        balance_weight: orderedWeight - receivedWeight,

        qty_percentage: Math.round(qtyPercentage),
        weight_percentage: Math.round(weightPercentage),

        rate: item.rate,
        total_ordered_value:
          orderedQty * item.rate + orderedWeight * item.rate,
        total_received_value:
          receivedQty * item.rate + receivedWeight * item.rate,

        item_status: itemStatus
      };
    });

    // ---------------- SEPARATE SECTIONS ----------------
    const receivedItems = itemWiseStatus.filter(
      item =>
        item.item_status === "received" ||
        item.item_status === "partially_received"
    );

    const pendingItems = itemWiseStatus.filter(
      item => item.item_status === "pending"
    );

    // ---------------- OVERALL SUMMARY ----------------
    const overallSummary = itemWiseStatus.reduce(
      (acc, item) => ({
        total_items: acc.total_items + 1,
        completed_items:
          acc.completed_items +
          (item.item_status === "received" ? 1 : 0),
        partial_items:
          acc.partial_items +
          (item.item_status === "partially_received" ? 1 : 0),
        pending_items:
          acc.pending_items +
          (item.item_status === "pending" ? 1 : 0),

        total_ordered_qty:
          acc.total_ordered_qty + item.ordered_quantity,
        total_received_qty:
          acc.total_received_qty + item.received_quantity,

        total_ordered_value:
          acc.total_ordered_value + item.total_ordered_value,
        total_received_value:
          acc.total_received_value + item.total_received_value
      }),
      {
        total_items: 0,
        completed_items: 0,
        partial_items: 0,
        pending_items: 0,
        total_ordered_qty: 0,
        total_received_qty: 0,
        total_ordered_value: 0,
        total_received_value: 0
      }
    );

    overallSummary.qty_completion_percentage =
      overallSummary.total_ordered_qty > 0
        ? Math.round(
            (overallSummary.total_received_qty /
              overallSummary.total_ordered_qty) *
              100
          )
        : 0;

    overallSummary.value_completion_percentage =
      overallSummary.total_ordered_value > 0
        ? Math.round(
            (overallSummary.total_received_value /
              overallSummary.total_ordered_value) *
              100
          )
        : 0;

    // ---------------- FINAL RESPONSE ----------------
    return res.status(200).json({
      success: true,
      data: {
        po_info: {
          _id: purchaseOrder._id,
          po_number: purchaseOrder.po_number,
          reference_no: purchaseOrder.reference_no,
          order_date: purchaseOrder.order_date,
          status: purchaseOrder.status,
          payment_status: purchaseOrder.payment_status,
          supplier: purchaseOrder.supplier_id
            ? {
                _id: purchaseOrder.supplier_id._id,
                name: purchaseOrder.supplier_id.supplier_name,
                code: purchaseOrder.supplier_id.supplier_code
              }
            : null,
          branch: purchaseOrder.branch
            ? {
                _id: purchaseOrder.branch._id,
                name: purchaseOrder.branch.branch_name
              }
            : null,
          currency: purchaseOrder.currency,
          notes: purchaseOrder.notes
        },

        overall_summary: overallSummary,

        items: {
          all_items: itemWiseStatus,
          received_items: receivedItems,
          pending_items: pendingItems
        }
      }
    });
  } catch (error) {
    console.error("Get PO Received Status Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
