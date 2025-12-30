import PurchaseOrder from "../Models/models/PurchaseOrder.js";
import InventoryItem from "../Models/models/InventoryModel.js"
import Suppliers from "../Models/models/SuppliersModel.js";





export const createPurchaseOrder = async (req, res) => {
  try {
    const { supplier_id, items, status, notes, order_date } = req.body;
    console.log("Request Body:", req.body);

    if (!supplier_id || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Supplier ID and items are required"
      });
    }

    // Check supplier exists
    const supplier = await Suppliers.findById(supplier_id);
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found"
      });
    }

    let totalAmount = 0;
    const validatedItems = [];

    for (const item of items) {
      const { inventory_item_id, quantity, weight, rate, expected_date, unit_id } = item;

      

      if (rate <= 0) {
        return res.status(400).json({
          success: false,
          message: "Rate must be greater than 0"
        });
      }

      // Get inventory item with ALL details including metals, stones, and material type
      const inventory = await InventoryItem.findById(inventory_item_id)
        .populate("unit_id", "name")
        .populate("material_type_id", "material_type") // Get material type
        .populate({
          path: "metals.metal_id", // Get metal type name
          select: "name"
        })
        .populate({
          path: "metals.purity_id",
          select: "purity_name"
        })
        .populate({
          path: "stones.stone_id", // Get stone type
          select: "stone_type"
        })
        .populate({
          path: "stones.stone_purity_id",
          select: "stone_purity"
        });

      if (!inventory) {
        return res.status(404).json({
          success: false,
          message: `Inventory item not found with ID: ${inventory_item_id}`
        });
      }

      if (!quantity && !weight) {
        return res.status(400).json({
          success: false,
          message: `Either quantity or weight is required for item: "${inventory.item_name}"`
        });
      }

      // Calculate item total
      let itemTotal = 0;
      if (quantity && quantity > 0) {
        itemTotal += rate * quantity;
      }
      if (weight && weight > 0) {
        itemTotal += rate * weight;
      }

      if (itemTotal <= 0) {
        return res.status(400).json({
          success: false,
          message: `Item total must be greater than 0 for item: "${inventory.item_name}"`
        });
      }

      totalAmount += itemTotal;

      // Prepare item data
      const itemData = {
        inventory_item_id,
        rate,
        expected_date: new Date(expected_date),
      };

      // Add quantity/weight
      if (quantity !== undefined && quantity !== null) {
        itemData.quantity = quantity;
      } else {
        itemData.quantity = null;
      }

      if (weight !== undefined && weight !== null) {
        itemData.weight = weight;
      } else {
        itemData.weight = null;
      }

      // Add unit
      if (unit_id) {
        itemData.unit_id = unit_id;
      } else {
        itemData.unit_id = inventory.unit_id;
      }

      // Extract metal type (if exists)
      let metalType = null;
      if (inventory.metals && inventory.metals.length > 0 && inventory.metals[0].metal_id) {
        metalType = inventory.metals[0].metal_id.name;
      }

      // Extract stone type (if exists)
      let stoneType = null;
      if (inventory.stones && inventory.stones.length > 0 && inventory.stones[0].stone_id) {
        stoneType = inventory.stones[0].stone_id.stone_type;
      }

      // Extract material type (if exists)
      let materialType = null;
      if (inventory.material_type_id) {
        materialType = inventory.material_type_id.material_type;
      }

      // Extract purity names
      let metalPurityNames = [];
      let stonePurityNames = [];

      // Get metal purity names
      if (inventory.metals && inventory.metals.length > 0) {
        metalPurityNames = inventory.metals
          .filter(metal => metal.purity_id)
          .map(metal => {
            return metal.purity_id?.purity_name || metal.purity_name || null;
          })
          .filter(name => name);
      }

      // Get stone purity names
      if (inventory.stones && inventory.stones.length > 0) {
        stonePurityNames = inventory.stones
          .filter(stone => stone.stone_purity_id)
          .map(stone => {
            return stone.stone_purity_id?.stone_purity || stone.stone_purity_value || null;
          })
          .filter(name => name);
      }

      // Add type information to item data
      if (metalType) {
        itemData.metal_type = metalType; // Store metal type name
      }

      if (stoneType) {
        itemData.stone_type = stoneType; // Store stone type name
      }

      if (materialType) {
        itemData.material_type = materialType; // Store material type
      }

      // Add purity names to item data
      if (metalPurityNames.length > 0) {
        itemData.metal_purities = metalPurityNames;
      }

      if (stonePurityNames.length > 0) {
        itemData.stone_purities = stonePurityNames;
      }

      validatedItems.push(itemData);
    }

    // Validate order date
    let orderDateValue;
    if (order_date) {
      const parsedDate = new Date(order_date);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid order_date format. Use YYYY-MM-DD or ISO format"
        });
      }
      orderDateValue = parsedDate;
    } else {
      orderDateValue = new Date();
    }

    // Create purchase order
    const purchaseOrder = await PurchaseOrder.create({
      supplier_id,
      items: validatedItems,
      total_amount: totalAmount,
      status: status || "draft",
      notes: notes || "",
      order_date: orderDateValue,
      created_by: req.user?._id || null
    });

    // Populate and format response
    const populatedPO = await PurchaseOrder.findById(purchaseOrder._id)
      .populate({
        path: 'supplier_id',
        select: 'supplier_name'
      })
      .populate({
        path: 'items.inventory_item_id',
        select: 'item_name sku_code track_by'
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

    // Format custom response with TYPE information
    const customResponse = {
      _id: populatedPO._id,
      po_number: populatedPO.po_number,
      supplier_id: populatedPO.supplier_id ? {
        _id: populatedPO.supplier_id._id,
        name: populatedPO.supplier_id.supplier_name
      } : null,
      items: populatedPO.items.map(item => ({
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
        unit_id: item.unit_id ? {
          _id: item.unit_id._id,
          name: item.unit_id.name
        } : null,
        // Add TYPE information
        metal_type: item.metal_type || null, // Metal type name like "gold", "silver"
        stone_type: item.stone_type || null, // Stone type name like "Diamond", "Ruby"
        material_type: item.material_type || null, // Material type name
        // Purity names
        metal_purities: item.metal_purities || [],
        stone_purities: item.stone_purities || []
      })),
      status: populatedPO.status,
      total_amount: populatedPO.total_amount,
      notes: populatedPO.notes,
      order_date: populatedPO.order_date,
      createdAt: populatedPO.createdAt,
      updatedAt: populatedPO.updatedAt
    };

    return res.status(201).json({
      success: true,
      message: "Purchase Order created successfully",
      data: customResponse
    });

  } catch (error) {
    console.error("Create PO Error:", error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "PO number already exists"
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};




export const getAllPurchaseOrders = async (req, res) => {
  try {
    const { status, supplier_id, startDate, endDate, search } = req.query;
    console.log(req.query, "req.query");
    
    let filter = {};
    console.log(filter, "filter");
    
    // Apply filters
    if (status) filter.status = status;
    if (supplier_id) filter.supplier_id = supplier_id;
    
    // Date filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    
    // Search filter
    if (search) {
      filter.$or = [
        { po_number: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Get purchase orders with ALL fields
    const purchaseOrders = await PurchaseOrder.find(filter)
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
      .sort({ createdAt: -1 });

    // Format response with ALL type information
    const customResponse = purchaseOrders.map(po => ({
      _id: po._id,
      po_number: po.po_number,
      supplier_id: po.supplier_id ? {
        _id: po.supplier_id._id,
        name: po.supplier_id.supplier_name
      } : null,
      items: po.items.map(item => ({
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
        // ✅ ADD TYPE INFORMATION HERE (same as create API)
        metal_type: item.metal_type || null,
        stone_type: item.stone_type || null,
        material_type: item.material_type || null,
        // ✅ ADD PURITY INFO HERE
        metal_purities: item.metal_purities || [],
        stone_purities: item.stone_purities || []
      })),
      status: po.status,
      total_amount: po.total_amount,
      notes: po.notes,
      order_date: po.order_date,
      createdAt: po.createdAt,
      updatedAt: po.updatedAt
    }));
    
    console.log(customResponse, "customResponse");

    return res.status(200).json({
      success: true,
      message: "All orders",
      count: customResponse.length,
      data: customResponse
    });

  } catch (error) {
    console.error("Get Purchase Orders Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};



export const getPurchaseOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    
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

    if (!purchaseOrder) {
      return res.status(404).json({
        success: false,
        message: "Purchase order not found"
      });
    }

    // Format response with purity info
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
        // ✅ ADD PURITY INFO HERE
        metal_purities: item.metal_purities || [],
        stone_purities: item.stone_purities || []
      })),
      status: purchaseOrder.status,
      total_amount: purchaseOrder.total_amount,
      notes: purchaseOrder.notes,
      order_date: purchaseOrder.order_date,
      createdAt: purchaseOrder.createdAt,
      updatedAt: purchaseOrder.updatedAt
    };

    return res.status(200).json({
      success: true,
      data: customResponse
    });

  } catch (error) {
    console.error("Get Purchase Order by ID Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};


export const getPurchaseOrdersPaginated = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      supplier_id, 
      startDate, 
      endDate,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    console.log(req.query,"req.query")
    
    let filter = {};
    console.log(filter,"filter")
    

    if (status) filter.status = status;
    if (supplier_id) filter.supplier_id = supplier_id;
    
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    
  
    if (search) {
      filter.$or = [
        { po_number: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
        { 'supplier_id.supplier_name': { $regex: search, $options: 'i' } }
      ];
    }
   
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [purchaseOrders, totalCount] = await Promise.all([
      PurchaseOrder.find(filter)
        .populate({
          path: 'supplier_id',
          select: '_id supplier_name'
        })
        .populate({
          path: 'items.inventory_item_id',
          select: '_id item_name'
        })
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      
      PurchaseOrder.countDocuments(filter)
    ]);
    
  
    const customResponse = purchaseOrders.map(po => ({
      _id: po._id,
      po_number: po.po_number,
      supplier_id: po.supplier_id ? {
        _id: po.supplier_id._id,
        name: po.supplier_id.supplier_name
      } : null,
      items_count: po.items.length,
      total_amount: po.total_amount,
      notes: po.notes,
      status: po.status,
      order_date: po.order_date,
      createdAt: po.createdAt
    }));
    console.log(customResponse,"customResponse")
    
    return res.status(200).json({success: true,data: customResponse,pagination: {page: parseInt(page),limit: parseInt(limit),total: totalCount,pages: Math.ceil(totalCount / parseInt(limit))}
    });

  } catch (error) {
    console.error("Get Purchase Orders Paginated Error:", error);
    return res.status(500).json({success: false,message: "Internal server error"});
  }
};




export const updatePOItemStatus = async (req, res) => {
  try {
    const { poId, itemId } = req.params;
    console.log(req.params,"req.params")
    const { status } = req.body;
    console.log(status,"statsus")

    if (!status || !["pending", "partially_received", "received", "cancelled"].includes(status)) {
      return res.status(400).json({success: false,message: "Valid status is required (pending, partially_received, received, cancelled)"
      });
    }

    
    const updatedPO = await PurchaseOrder.findOneAndUpdate(
      { 
        _id: poId,
        "items._id": itemId 
      },
      { 
        $set: { "items.$.status": status } 
      },
      { new: true }
    )
      .populate({
        path: 'supplier_id',
        select: 'supplier_name'
      })
      .populate({
        path: 'items.inventory_item_id',
        select: '_id item_name'
      })
      .populate({
        path: 'items.unit_id',
        select: '_id name'
      });

    if (!updatedPO) {
      return res.status(404).json({ success: false, message: "Purchase Order or Item not found" });
    }

 
    const allItemsReceived = updatedPO.items.every(item => item.status === "received");
    const someItemsReceived = updatedPO.items.some(item => 
      item.status === "received" || item.status === "partially_received"
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
        inventory_item_id: item.inventory_item_id ? {
          _id: item.inventory_item_id._id,
          name: item.inventory_item_id.item_name
        } : null,
        quantity: item.quantity,
        weight: item.weight,
        rate: item.rate,
        expected_date: item.expected_date,
        status: item.status,
        unit_id: item.unit_id ? {
          _id: item.unit_id._id,
          name: item.unit_id.name
        } : null
      }))
    };

    return res.status(200).json({success: true,message: `Item status updated to ${status}`,data: customResponse});

  } catch (error) {
    console.error("Update PO Item Status Error:", error);
    return res.status(500).json({success: false,message: "Internal server error"});
  }
};



export const updatePOStatus = async (req, res) => {
  try {
    const { id } = req.params;
    // console.log(req.params,"req.params")
    // const { status, approved_by } = req.body;
    const { status} = req.body;

    const validStatuses = ["draft", "pending", "approved", "partially_received", "completed", "cancelled"];
    
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({success: false,message: `Valid status is required. Allowed values: ${validStatuses.join(', ')}` });
    }

    const updateData = { status };
    console.log(updateData,"updateData")
    
   
    // if (status === "approved" && approved_by) {
    //   updateData.approved_by = approved_by;
    // }

    const updatedPO = await PurchaseOrder.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    )
      .populate({
        path: 'supplier_id',
        select: 'supplier_name'
      })
      .populate({
        path: 'items.inventory_item_id',
        select: '_id item_name'
      })
      .populate({
        path: 'items.unit_id',
        select: '_id name'
      })
      .populate({
        path: 'approved_by',
        select: '_id name'
      });

    if (!updatedPO) {
      return res.status(404).json({success: false,message: "Purchase Order not found"});
    }

    const customResponse = {
      _id: updatedPO._id,
      po_number: updatedPO.po_number,
      status: updatedPO.status,
      supplier_id: updatedPO.supplier_id ? {
        _id: updatedPO.supplier_id._id,
        name: updatedPO.supplier_id.supplier_name
      } : null,
      approved_by: updatedPO.approved_by ? {
        _id: updatedPO.approved_by._id,
        name: updatedPO.approved_by.name
      } : null,
      updatedAt: updatedPO.updatedAt
    };

    return res.status(200).json({success: true,message: `Purchase Order status updated to ${status}`,data: customResponse});

  } catch (error) {
    console.error("Update PO Status Error:", error);
    return res.status(500).json({success: false,message: "Internal server error"});
  }
};




export const deletePurchaseOrder = async(req,res)=>{
  const {id} = req.params;
  console.log(id,"id")
  
  try{

    const checkd = await PurchaseOrder.findById(id)
    if(!checkd){
      return res.status(404).json({status:false,message:"Order not found"})
    }
    else{
      let deleted = await PurchaseOrder.findByIdAndDelete(id)
      if(deleted){
        return res.status(200).json({status:true,message:"Purchase order deleted"})
      }
    }
  }catch(e){
     console.error("Update PO Status Error:", e);
return res.status(500).json({success: false,message: "Internal server error"});
  }

}



export const updatePurchaseOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { supplier_id, items, status, notes, order_date } = req.body;
    
    console.log("Update Request Body:", req.body);
    console.log("PO ID to update:", id);

    // Check if purchase order exists
    const existingPO = await PurchaseOrder.findById(id);
    if (!existingPO) {
      return res.status(404).json({
        success: false,
        message: "Purchase Order not found"
      });
    }

    // If supplier_id is being updated, validate it exists
    if (supplier_id && supplier_id !== existingPO.supplier_id.toString()) {
      const supplier = await Suppliers.findById(supplier_id);
      if (!supplier) {
        return res.status(404).json({
          success: false,
          message: "Supplier not found"
        });
      }
    }

    let totalAmount = 0;
    const updatedItems = [];
    
    // If items are being updated, validate and process them
    if (items && items.length > 0) {
      for (const item of items) {
        const { inventory_item_id, quantity, weight, rate, expected_date, unit_id } = item;
        
        // Basic validation for updated items
        if (!inventory_item_id || rate === undefined || rate === null || !expected_date) {
          return res.status(400).json({
            success: false,
            message: "Each item must have inventory_item_id, rate, and expected_date"
          });
        }

        // Rate should be positive
        if (rate <= 0) {
          return res.status(400).json({
            success: false,
            message: "Rate must be greater than 0"
          });
        }

        // Get inventory item with ALL details including metals, stones, and material type
        const inventory = await InventoryItem.findById(inventory_item_id)
          .populate("unit_id", "name")
          .populate("material_type_id", "material_type") // Get material type
          .populate({
            path: "metals.metal_id", // Get metal type name
            select: "name"
          })
          .populate({
            path: "metals.purity_id",
            select: "purity_name"
          })
          .populate({
            path: "stones.stone_id", // Get stone type
            select: "stone_type"
          })
          .populate({
            path: "stones.stone_purity_id",
            select: "stone_purity"
          });
        
        if (!inventory) {
          return res.status(404).json({
            success: false,
            message: `Inventory item not found with ID: ${inventory_item_id}`
          });
        }

        console.log("Inventory item:", {
          name: inventory.item_name,
          track_by: inventory.track_by,
          unit: inventory.unit_id?.name || 'N/A'
        });

        // Validate either quantity or weight based on track_by
        if (inventory.track_by === 'quantity' && (!quantity || quantity <= 0)) {
          return res.status(400).json({
            success: false,
            message: `Quantity is required and must be greater than 0 for item: "${inventory.item_name}"`
          });
        }

        if (inventory.track_by === 'weight' && (!weight || weight <= 0)) {
          return res.status(400).json({
            success: false,
            message: `Weight is required and must be greater than 0 for item: "${inventory.item_name}"`
          });
        }

        // For items that can be tracked by both
        if (inventory.track_by === 'both' && !quantity && !weight) {
          return res.status(400).json({
            success: false,
            message: `Either quantity or weight is required for item: "${inventory.item_name}"`
          });
        }

        // Calculate item total
        let itemTotal = 0;
        if (quantity && quantity > 0) {
          itemTotal += rate * quantity;
        }
        if (weight && weight > 0) {
          itemTotal += rate * weight;
        }
        
        if (itemTotal <= 0) {
          return res.status(400).json({
            success: false,
            message: `Item total must be greater than 0 for item: "${inventory.item_name}"`
          });
        }
        
        totalAmount += itemTotal;

        // Prepare item data
        const itemData = {
          inventory_item_id,
          rate,
          expected_date: new Date(expected_date),
          status: item.status || "pending" // Use provided status or default to pending
        };

        // Add quantity/weight based on track_by
        if (inventory.track_by === 'quantity') {
          itemData.quantity = quantity;
          itemData.weight = null;
        } else if (inventory.track_by === 'weight') {
          itemData.weight = weight;
          itemData.quantity = null;
        } else if (inventory.track_by === 'both') {
          if (quantity !== undefined && quantity !== null) {
            itemData.quantity = quantity;
          }
          if (weight !== undefined && weight !== null) {
            itemData.weight = weight;
          }
        }

        // Add unit_id
        if (unit_id) {
          itemData.unit_id = unit_id;
        } else {
          itemData.unit_id = inventory.unit_id;
        }

        // Extract metal type (if exists)
        let metalType = null;
        if (inventory.metals && inventory.metals.length > 0 && inventory.metals[0].metal_id) {
          metalType = inventory.metals[0].metal_id.name;
        }

        // Extract stone type (if exists)
        let stoneType = null;
        if (inventory.stones && inventory.stones.length > 0 && inventory.stones[0].stone_id) {
          stoneType = inventory.stones[0].stone_id.stone_type;
        }

        // Extract material type (if exists)
        let materialType = null;
        if (inventory.material_type_id) {
          materialType = inventory.material_type_id.material_type;
        }

        // Extract purity names
        let metalPurityNames = [];
        let stonePurityNames = [];

        // Get metal purity names
        if (inventory.metals && inventory.metals.length > 0) {
          metalPurityNames = inventory.metals
            .filter(metal => metal.purity_id)
            .map(metal => {
              return metal.purity_id?.purity_name || metal.purity_name || null;
            })
            .filter(name => name);
        }

        // Get stone purity names
        if (inventory.stones && inventory.stones.length > 0) {
          stonePurityNames = inventory.stones
            .filter(stone => stone.stone_purity_id)
            .map(stone => {
              return stone.stone_purity_id?.stone_purity || stone.stone_purity_value || null;
            })
            .filter(name => name);
        }

        // Add type information to item data
        if (metalType) {
          itemData.metal_type = metalType;
        }

        if (stoneType) {
          itemData.stone_type = stoneType;
        }

        if (materialType) {
          itemData.material_type = materialType;
        }

        // Add purity names to item data
        if (metalPurityNames.length > 0) {
          itemData.metal_purities = metalPurityNames;
        }

        if (stonePurityNames.length > 0) {
          itemData.stone_purities = stonePurityNames;
        }

        updatedItems.push(itemData);
      }
    } else {
      // If no new items provided, keep existing items and calculate total
      updatedItems.push(...existingPO.items);
      totalAmount = existingPO.total_amount;
    }

    // Prepare update data
    const updateData = {
      status: status || existingPO.status,
      notes: notes !== undefined ? notes : existingPO.notes,
      order_date: order_date ? new Date(order_date) : existingPO.order_date,
      updatedAt: new Date()
    };

    // Only update if provided
    if (supplier_id) updateData.supplier_id = supplier_id;
    if (items && items.length > 0) {
      updateData.items = updatedItems;
      updateData.total_amount = totalAmount;
    }

    console.log("Update Data:", updateData);

    // Update the purchase order
    const updatedPO = await PurchaseOrder.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    // Populate the updated document with all necessary fields
    const populatedPO = await PurchaseOrder.findById(updatedPO._id)
      .populate({
        path: 'supplier_id',
        select: 'supplier_name'
      })
      .populate({
        path: 'items.inventory_item_id',
        select: 'item_name sku_code track_by'
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

    // Create custom response with TYPE information
    const customResponse = {
      _id: populatedPO._id,
      po_number: populatedPO.po_number,
      supplier_id: populatedPO.supplier_id ? {
        _id: populatedPO.supplier_id._id,
        name: populatedPO.supplier_id.supplier_name
      } : null,
      items: populatedPO.items.map(item => ({
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
        // Add TYPE information
        metal_type: item.metal_type || null,
        stone_type: item.stone_type || null,
        material_type: item.material_type || null,
        // Purity names
        metal_purities: item.metal_purities || [],
        stone_purities: item.stone_purities || []
      })),
      status: populatedPO.status,
      total_amount: populatedPO.total_amount,
      notes: populatedPO.notes,
      order_date: populatedPO.order_date,
      createdAt: populatedPO.createdAt,
      updatedAt: populatedPO.updatedAt,
      created_by: populatedPO.created_by ? {
        _id: populatedPO.created_by._id,
        name: populatedPO.created_by.name
      } : null,
      approved_by: populatedPO.approved_by ? {
        _id: populatedPO.approved_by._id,
        name: populatedPO.approved_by.name
      } : null
    };

    console.log("Updated Custom Response:", customResponse);

    return res.status(200).json({
      success: true,
      message: "Purchase Order updated successfully",
      data: customResponse
    });

  } catch (error) {
    console.error("Update PO Error:", error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "PO number already exists"
      });
    }
    
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};