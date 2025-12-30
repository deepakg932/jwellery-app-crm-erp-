import GRN from "../Models/models/GRNModel.js"
import PurchaseOrder  from "../Models/models/PurchaseOrder.js"
import Suppliers from "../Models/models/SuppliersModel.js";
import Branch from "../Models/models/Branch.js"
import InventoryItem  from "../Models/models/InventoryModel.js";
import InventoryStock from "../Models/models/InventoryStockModel.js";
import mongoose from "mongoose";



export const verifyGRN = async (req, res) => {
  try {
    const { id } = req.params;
    const { verified_by } = req.body;
    
    console.log("Verify GRN:", { id, verified_by });

    const grn = await GRN.findById(id);
    if (!grn) {
      return res.status(404).json({success: false,message: "GRN not found"});
    }

    if (grn.status === "verified") {
      return res.status(400).json({success: false,message: "GRN is already verified"});
    }

    const updatedGRN = await GRN.findByIdAndUpdate(
      id,
      {
        status: "verified",
        verified_by: verified_by || req.user?._id || null,
        verified_at: new Date()
      },
      { new: true }
    )
      .populate({
        path: 'verified_by',
        select: 'name email'
      });

    return res.status(200).json({success: true, message: "GRN verified successfully",
      data: {
        _id: updatedGRN._id,
        grn_number: updatedGRN.grn_number,
        status: updatedGRN.status,
        verified_by: updatedGRN.verified_by,
        verified_at: updatedGRN.verified_at
      }
    });

  } catch (error) {
    console.error("Verify GRN Error:", error);
    return res.status(500).json({success: false, message: "Internal server error"});
  }
};


export const getGRNsByPO = async (req, res) => {
  try {
    const { po_id } = req.params;
    console.log(po_id,"po")
    
    const grns = await GRN.find({ po_id })
      .populate({
        path: 'branch_id',
        select: 'branch_name'
      })
      .sort({ createdAt: -1 });

    const customResponse = grns.map(grn => ({
      _id: grn._id,
      grn_number: grn.grn_number,
      branch_id: grn.branch_id ? {
        _id: grn.branch_id._id,
        name: grn.branch_id.branch_name
      } : null,
      total_items: grn.total_items,
      total_cost: grn.total_cost,
      status: grn.status,
      received_date: grn.received_date,
      createdAt: grn.createdAt
    }));
console.log(customResponse,"customresponse")
    return res.status(200).json({success: true,count: customResponse.length,data: customResponse});

  } catch (error) {
    console.error("Get GRNs by PO Error:", error);
    return res.status(500).json({success: false,message: "Internal server error"});
  }
};


export const deleteGRN = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id,"id")
    
    const grn = await GRN.findById(id);
    if (!grn) {
      return res.status(404).json({success: false,message: "GRN not found"});
    }

   
    if (grn.status === "verified") {
      return res.status(400).json({success: false,message: "Cannot delete verified GRN"});
    }

    
    for (const item of grn.items) {
      await reverseInventoryStock(item, grn.branch_id);
    }

  
    await resetPOStatus(grn.po_id);

    await GRN.findByIdAndDelete(id);

    return res.status(200).json({success: true,message: "GRN deleted successfully"});

  } catch (error) {
    console.error("Delete GRN Error:", error);
    return res.status(500).json({success: false,message: "Internal server error"});
  }
};



const reverseInventoryStock = async (grnItem, branch_id, user_id) => {
  try {
    if (!grnItem || !grnItem.inventory_item_id) {
      console.log("No inventory item found for reversal");
      return;
    }

    const inventoryItem = await InventoryItem.findById(grnItem.inventory_item_id);
    console.log(inventoryItem,"inventoryItem")
    if (!inventoryItem) {
      console.log(`Inventory item not found: ${grnItem.inventory_item_id}`);
      return;
    }

    
    const existingStock = await InventoryStock.findOne({
      inventory_item_id: grnItem.inventory_item_id,
      branch_id: branch_id
    });
    console.log(existingStock,"exitiongStock")

    if (existingStock) {
      
      if (grnItem.quantity && grnItem.quantity > 0) 
        {
        existingStock.quantity = Math.max(0, existingStock.quantity - grnItem.quantity);
      }
      if (grnItem.weight && grnItem.weight > 0) 
        {
        existingStock.weight = Math.max(0, existingStock.weight - grnItem.weight);
      }

      
      const totalQty = existingStock.quantity || 0;
      console.log(totalQty,"totalQty")
      const totalWt = existingStock.weight || 0;
      console.log(totalWt,"totalWt")

      const oldTotalValue = (existingStock.average_cost || 0) * (totalQty + totalWt);
      console.log(oldTotalValue,"ota")
      const itemValue = grnItem.total_cost || 0;
      
      if (totalQty + totalWt > 0) {
        existingStock.average_cost = (oldTotalValue - itemValue) / (totalQty + totalWt);
      } else {
        existingStock.average_cost = 0;
      }

      existingStock.last_updated = new Date();
      existingStock.updated_by = user_id;

      await existingStock.save();
      console.log(`Stock reversed for item: ${inventoryItem.item_name}`);
    }
  } catch (error) {
    console.error("Error reversing inventory stock:", error);
    throw error;
  }
};

const resetPOStatus = async (po_id) => {
  try {
    const po = await PurchaseOrder.findById(po_id);
    console.log(po,"po")
    if (po) {
     
      const otherGRNs = await GRN.countDocuments({ 
        po_id, 
        status: { $ne: "cancelled" } 
      });
      
      if (otherGRNs === 0) {
      
     let a =    await PurchaseOrder.findByIdAndUpdate(po_id, { status: "pending" });
     console.log(a,"a")
        
     
        await PurchaseOrder.updateMany(
          { _id: po_id },
          { $set: { "items.$[].status": "pending" } }
        );
      }
    }
  } catch (error) {
    console.error("Reset PO Status Error:", error);
  }
};


export const createGRNStock = async (req, res) => {
  try {
    const { po_id, branch_id, items, remarks, received_by, received_date } = req.body;
    console.log("Create GRN Request Body:", req.body);

    if (!po_id || !branch_id || !items || items.length === 0) {
      return res.status(400).json({ success: false, message: "PO ID, Location ID and items are required"});
    }


    if (!mongoose.Types.ObjectId.isValid(po_id)) {
      return res.status(400).json({success: false,message: "Invalid Purchase Order ID"});
    }

    if (!mongoose.Types.ObjectId.isValid(branch_id)) {
      return res.status(400).json({success: false,message: "Invalid Branch ID"});
    }

    const purchaseOrder = await PurchaseOrder.findById(po_id)
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
      });

    console.log(purchaseOrder, "purchasedorder");
    
    if (!purchaseOrder) {
      return res.status(404).json({success: false,message: "Purchase Order not found"});
    }

 
    if (purchaseOrder.status === "draft") {
      purchaseOrder.status = "approved";
      purchaseOrder.approved_by = req.user?._id || null;
      purchaseOrder.approval_date = new Date();
      purchaseOrder.approval_remarks = "Auto-approved during GRN creation";
      
      purchaseOrder.items.forEach(item => {
        if (item.status === "draft") {
          item.status = "pending";
        }
      });
      
      await purchaseOrder.save();
      console.log("Purchase Order auto-approved from draft status");
    }

    
    const validPOStatuses = ["approved", "partially_received"];
    if (!validPOStatuses.includes(purchaseOrder.status)) {
      return res.status(400).json({success: false,message: `Purchase Order must be in 'approved' or 'partially_received' status to create GRN. Current status: ${purchaseOrder.status}`});
    }

    const location = await Branch.findById(branch_id);
    console.log(location, "location");
    if (!location) {
      return res.status(404).json({success: false,message: "Location not found"});
    }

    let totalItems = 0;
    console.log(totalItems, "totalItems")
    let totalCost = 0;
    console.log(totalCost, "totalcost")
    const validatedItems = [];
    console.log(validatedItems, "validatedItems")


    for (const item of items) {
      const { 
        po_item_id, 
        inventory_item_id, 
        quantity, 
        weight, 
        cost, 
        remarks: item_remarks 
      } = item;
      console.log(item)

      if (!inventory_item_id || cost === undefined || cost === null) {
        return res.status(400).json({success: false,message: "Each item must have inventory_item_id and cost"});
      }

      
      const inventoryItem = await InventoryItem.findById(inventory_item_id)
        .populate("unit_id", "name")
        .populate("material_type_id", "material_type")
        .populate({
          path: "metals.metal_id",
          select: "name"
        })
        .populate({
          path: "metals.purity_id",
          select: "purity_name"
        })
        .populate({
          path: "stones.stone_id",
          select: "stone_type"
        })
        .populate({
          path: "stones.stone_purity_id",
          select: "stone_purity"
        });
      
      console.log(inventoryItem, "inventoryItem with details");
      
      if (!inventoryItem) {
        return res.status(404).json({success: false,message: `Inventory item not found with ID: ${inventory_item_id}`});
      }

      const poItem = purchaseOrder.items.find(item => 
        item._id.toString() === po_item_id
      );
      console.log(poItem, "poItem");
      
      if (poItem) {
      
        const trackBy = inventoryItem.track_by || poItem.inventory_item_id?.track_by;
        console.log(trackBy,"trackY")
        
        if (trackBy === 'quantity') {
          if (!quantity || quantity <= 0) {
            return res.status(400).json({success: false,message: `Quantity is required and must be greater than 0 for item: "${inventoryItem.item_name}"`});
          }
          
          if (weight && weight > 0) {
            return res.status(400).json({success: false,message: `Item "${inventoryItem.item_name}" is tracked by quantity only, weight should not be provided`});
          }
        }
        
        if (trackBy === 'weight') {
          if (!weight || weight <= 0) {
            return res.status(400).json({success: false,message: `Weight is required and must be greater than 0 for item: "${inventoryItem.item_name}"`});
          }
          
          if (quantity && quantity > 0) {
            return res.status(400).json({success: false,message: `Item "${inventoryItem.item_name}" is tracked by weight only, quantity should not be provided`
            });
          }
        }
        
        if (trackBy === 'both') {
          const hasQuantity = quantity && quantity > 0;
          console.log(hasQuantity,"hasQuantity")
          const hasWeight = weight && weight > 0;
          console.log(hasWeight,"hasWeight")
          
          if (!hasQuantity && !hasWeight) {
            return res.status(400).json({success: false,message: `Either quantity or weight is required for item: "${inventoryItem.item_name}"`});
          }
        }

  
        let itemTotalCost = 0;
        if (quantity && quantity > 0) {
          itemTotalCost += cost * quantity;
        }
        if (weight && weight > 0) {
          itemTotalCost += cost * weight;
        }

        totalItems++;
        totalCost += itemTotalCost;

   
        let metalType = null;
        let stoneType = null;
        let materialType = null;
        let metalPurities = [];
        let stonePurities = [];

        if (inventoryItem.metals && inventoryItem.metals.length > 0) {
          metalType = inventoryItem.metals[0].metal_id?.name || null;
          metalPurities = inventoryItem.metals
            .filter(metal => metal.purity_id)
            .map(metal => {
              return metal.purity_id?.purity_name || metal.purity_name || null;
            })
            .filter(name => name);
        }

   
        if (inventoryItem.stones && inventoryItem.stones.length > 0) {
          stoneType = inventoryItem.stones[0].stone_id?.stone_type || null;
          stonePurities = inventoryItem.stones
            .filter(stone => stone.stone_purity_id)
            .map(stone => {
              return stone.stone_purity_id?.stone_purity || stone.stone_purity_value || null;
            })
            .filter(name => name);
        }

      
        if (inventoryItem.material_type_id) {
          materialType = inventoryItem.material_type_id.material_type;
        }

   
        const poItemMetalType = poItem.metal_type;
        const poItemStoneType = poItem.stone_type;
        const poItemMaterialType = poItem.material_type;
        const poItemMetalPurities = poItem.metal_purities || [];
        const poItemStonePurities = poItem.stone_purities || [];

        const itemData = {
          po_item_id,
          inventory_item_id,
          ordered_quantity: poItem.quantity,
          ordered_weight: poItem.weight,
          quantity: quantity || null,
          weight: weight || null,
          cost: cost,
          total_cost: itemTotalCost,
    
          metal_type: poItemMetalType || metalType || null,
          stone_type: poItemStoneType || stoneType || null,
          material_type: poItemMaterialType || materialType || null,
          metal_purities: [...new Set([...metalPurities, ...poItemMetalPurities])],
          stone_purities: [...new Set([...stonePurities, ...poItemStonePurities])],
          // remarks: item_remarks || ""
        };
        
        console.log("GRN Item Data with all type info:", itemData);
        validatedItems.push(itemData);
      } else {
        return res.status(404).json({
          success: false,
          message: `PO item with ID: ${po_item_id} not found in purchase order`
        });
      }
    }

    if (validatedItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid items found to create GRN"
      });
    }

 
    const grn = await GRN.create({
      po_id,
      supplier_id: purchaseOrder.supplier_id._id,
      branch_id,
      items: validatedItems,
      total_items: totalItems,
      total_cost: totalCost,
      remarks: remarks || "",
      received_by: received_by || req.user?._id || null,
      received_date: received_date ? new Date(received_date) : new Date(),
      status: "received"
    });
    console.log(grn, "grn");

    for (const grnItem of grn.items) {
      if (grnItem.po_item_id) {
        
        const poItemIndex = purchaseOrder.items.findIndex(
          item => item._id.toString() === grnItem.po_item_id
        );
console.log(poItemIndex,"poo")
        if (poItemIndex !== -1) {
  
          purchaseOrder.items[poItemIndex].received_quantity = 
            (purchaseOrder.items[poItemIndex].received_quantity || 0) + (grnItem.quantity || 0);
          purchaseOrder.items[poItemIndex].received_weight = 
            (purchaseOrder.items[poItemIndex].received_weight || 0) + (grnItem.weight || 0);

         
          const orderedQty = purchaseOrder.items[poItemIndex].quantity;
          const orderedWt = purchaseOrder.items[poItemIndex].weight;
          const receivedQty = purchaseOrder.items[poItemIndex].received_quantity;
          const receivedWt = purchaseOrder.items[poItemIndex].received_weight;

          const isFullyReceived = (orderedQty && receivedQty >= orderedQty) || 
                                  (orderedWt && receivedWt >= orderedWt);

          if (isFullyReceived) {
            purchaseOrder.items[poItemIndex].status = "received";
          } else if (receivedQty > 0 || receivedWt > 0) {
            purchaseOrder.items[poItemIndex].status = "partially_received";
          }
        }
      }
    }

   
    const allItemsReceived = purchaseOrder.items.every(item => item.status === "received");
    const anyItemReceived = purchaseOrder.items.some(item => 
      item.status === "received" || item.status === "partially_received"
    );

    if (allItemsReceived) {
      purchaseOrder.status = "completed";
    } else if (anyItemReceived) {
      purchaseOrder.status = "partially_received";
    }

   let saved=  await purchaseOrder.save();
   console.log(saved,"saved")

  
    for (const grnItem of grn.items) {
      const user_id = req.user?._id || received_by || null;
      await updateInventoryStock(grnItem, branch_id, user_id);
    }


    const populatedGRN = await GRN.findById(grn._id)
      .populate({
        path: 'po_id',
        select: 'po_number status'
      })
      .populate({
        path: 'supplier_id',
        select: 'supplier_name'
      })
      .populate({
        path: 'branch_id',
        select: 'branch_name address'
      })
      .populate({
        path: 'items.inventory_item_id',
        select: 'item_name sku_code track_by'
      })
      .populate({
        path: 'received_by',
        select: 'name email'
      });
    
    console.log(populatedGRN, "populatedGRN");

    const responseData = {
      _id: populatedGRN._id,
      grn_number: populatedGRN.grn_number,
      po_id: populatedGRN.po_id ? {
        _id: populatedGRN.po_id._id,
        po_number: populatedGRN.po_id.po_number,
        status: populatedGRN.po_id.status
      } : null,
      supplier_id: populatedGRN.supplier_id ? {
        _id: populatedGRN.supplier_id._id,
        name: populatedGRN.supplier_id.supplier_name
      } : null,
      branch_id: populatedGRN.branch_id ? {
        _id: populatedGRN.branch_id._id,
        name: populatedGRN.branch_id.branch_name,
        address: populatedGRN.branch_id.address
      } : null,
      items: populatedGRN.items.map(item => ({
        _id: item._id,
        po_item_id: item.po_item_id,
        inventory_item_id: item.inventory_item_id ? {
          _id: item.inventory_item_id._id,
          name: item.inventory_item_id.item_name,
          sku_code: item.inventory_item_id.sku_code,
          track_by: item.inventory_item_id.track_by
        } : null,
        ordered_quantity: item.ordered_quantity,
        ordered_weight: item.ordered_weight,
        quantity: item.quantity,
        weight: item.weight,
        cost: item.cost,
        total_cost: item.total_cost,
        remarks: item.remarks || "",

        metal_type: item.metal_type || null,
        stone_type: item.stone_type || null,
        material_type: item.material_type || null,
        metal_purities: item.metal_purities || [],
        stone_purities: item.stone_purities || []
      })),
      total_items: populatedGRN.total_items,
      total_cost: populatedGRN.total_cost,
      status: populatedGRN.status,
      remarks: populatedGRN.remarks,
      received_by: populatedGRN.received_by ? {
        _id: populatedGRN.received_by._id,
        name: populatedGRN.received_by.name,
        email: populatedGRN.received_by.email
      } : null,
      received_date: populatedGRN.received_date,
      createdAt: populatedGRN.createdAt,
      updatedAt: populatedGRN.updatedAt
    };
    
    console.log(responseData, "responseData");

    return res.status(201).json({success: true,message: "GRN created successfully",data: responseData});

  } catch (error) {
    console.error("Create GRN Error:", error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, message: messages.join(', ')});
    }
    
    if (error.code === 11000) {
      return res.status(400).json({ success: false,message: "GRN number already exists"});
    }
    
    return res.status(500).json({success: false,message: "Internal server error",error: process.env.NODE_ENV === 'development' ? error.message : undefined});
  }
};



const updateInventoryStock = async (grnItem, branch_id, user_id) => {
  try {
    const { inventory_item_id, quantity, weight, cost } = grnItem;
    console.log(grnItem,"grnItem")

    const qty = Number(quantity) || 0;
    const wt = Number(weight) || 0;
    const itemCost = Number(cost) || 0;

    if ((qty <= 0 && wt <= 0) || itemCost <= 0) {
      console.log("Skipping stock update - invalid values");
      return null;
    }

    const totalQuantity = qty + wt;
    console.log(totalQuantity,"toatalQuantity")
    const totalValue = itemCost * totalQuantity;
    console.log(totalValue,"totalValue")

    let stock = await InventoryStock.findOne({
      inventory_item_id,
      branch_id: branch_id  
    });
    console.log(stock,"Stocks")

    if (stock) {
      stock.current_quantity += qty;
      stock.current_weight += wt;
      
      const existingQuantity = stock.current_quantity + stock.current_weight;
      const existingValue = stock.total_value || 0;
      const newTotalValue = existingValue + totalValue;
      
      if (existingQuantity > 0) {
        stock.average_cost = newTotalValue / existingQuantity;
      }
      
      stock.total_value = newTotalValue;
      stock.last_updated_by = user_id;
    } else {
      stock = await InventoryStock.create({
        inventory_item_id,
        branch_id: branch_id,
        current_quantity: qty,
        current_weight: wt,
        average_cost: itemCost,
        total_value: totalValue,
        last_grn_id: grnItem._id,
        last_updated_by: user_id
      });
    }

    stock.last_updated = new Date();
    await stock.save();
    
    return stock;
  } catch (error) {
    console.error("Stock update error:", error);
    throw error;
  }
};





export const getAllGRNs = async (req, res) => {
  try {
    const { po_id, branch_id, supplier_id, status, startDate, endDate, search, page = 1, limit = 20 } = req.query;
    console.log("Get GRNs Query:", req.query);
    
    let filter = {};
    console.log(filter, "filter");
    
    // Build filter object
    if (po_id) filter.po_id = po_id;
    if (branch_id) filter.branch_id = branch_id;
    if (supplier_id) filter.supplier_id = supplier_id;
    if (status) filter.status = status;
    
    // Date range filter
    if (startDate || endDate) {
      filter.received_date = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        filter.received_date.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.received_date.$lte = end;
      }
    }
    
    // Search filter
    if (search) {
      filter.$or = [
        { grn_number: { $regex: search, $options: 'i' } },
        { remarks: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Calculate pagination
    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const skip = (pageNumber - 1) * pageSize;
    
    // Get total count for pagination
    const totalGRNs = await GRN.countDocuments(filter);
    
    // Get GRNs with pagination and populate
    const grns = await GRN.find(filter)
      .populate({
        path: 'po_id',
        select: 'po_number status'
      })
      .populate({
        path: 'supplier_id',
        select: 'supplier_name email phone'
      })
      .populate({
        path: 'branch_id',
        select: 'branch_name address city'
      })
      .populate({
        path: 'items.inventory_item_id',
       select: 'item_name sku_code track_by unit_id', // Include unit_id here
      populate: { // Then populate unit_id within inventory_item_id
      path: 'unit_id',
      select: '_id name'
    }
  })
      
      .populate({
        path: 'received_by',
        select: 'name email'
      })
      .populate({
        path: 'verified_by',
        select: 'name email'
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize);

    // Create custom response with all type information
    const customResponse = grns.map(grn => ({
      _id: grn._id,
      grn_number: grn.grn_number,
      po_id: grn.po_id ? {
        _id: grn.po_id._id,
        po_number: grn.po_id.po_number,
        status: grn.po_id.status
      } : null,
      supplier_id: grn.supplier_id ? {
        _id: grn.supplier_id._id,
        name: grn.supplier_id.supplier_name,
        email: grn.supplier_id.email,
        phone: grn.supplier_id.phone
      } : null,
      branch_id: grn.branch_id ? {
        _id: grn.branch_id._id,
        name: grn.branch_id.branch_name,
        address: grn.branch_id.address,
        city: grn.branch_id.city
      } : null,
      items: grn.items.map(item => ({
        _id: item._id,
        po_item_id: item.po_item_id,
        inventory_item_id: item.inventory_item_id ? {
          _id: item.inventory_item_id._id,
          name: item.inventory_item_id.item_name,
          sku_code: item.inventory_item_id.sku_code,
          track_by: item.inventory_item_id.track_by
        } : null,
        ordered_quantity: item.ordered_quantity,
        ordered_weight: item.ordered_weight,
        quantity: item.quantity,
        weight: item.weight,
        cost: item.cost,
        total_cost: item.total_cost,
        remarks: item.remarks,
        // Type information (metal, stone, material)
        metal_type: item.metal_type || null,
        stone_type: item.stone_type || null,
        material_type: item.material_type || null,
        metal_purities: item.metal_purities || [],
        stone_purities: item.stone_purities || []
      })),
      total_items: grn.total_items,
      total_cost: grn.total_cost,
      status: grn.status,
      remarks: grn.remarks,
      received_by: grn.received_by ? {
        _id: grn.received_by._id,
        name: grn.received_by.name,
        email: grn.received_by.email
      } : null,
      received_date: grn.received_date,
      verified_by: grn.verified_by ? {
        _id: grn.verified_by._id,
        name: grn.verified_by.name,
        email: grn.verified_by.email
      } : null,
      verified_date: grn.verified_date,
      createdAt: grn.createdAt,
      updatedAt: grn.updatedAt
    }));

    // Calculate pagination info
    const totalPages = Math.ceil(totalGRNs / pageSize);
    const hasNextPage = pageNumber < totalPages;
    const hasPrevPage = pageNumber > 1;

    return res.status(200).json({
      success: true,
      count: customResponse.length,
      total: totalGRNs,
      page: pageNumber,
      pages: totalPages,
      hasNextPage,
      hasPrevPage,
      data: customResponse
    });

  } catch (error) {
    console.error("Get All GRNs Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


export const getGRNById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Get GRN by ID:", id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid GRN ID"
      });
    }

    const grn = await GRN.findById(id)
      .populate({
        path: 'po_id',
        select: 'po_number status order_date'
      })
      .populate({
        path: 'supplier_id',
        select: 'supplier_name email phone address'
      })
      .populate({
        path: 'branch_id',
        select: 'branch_name address city state country'
      })
      .populate({
        path: 'items.inventory_item_id',
        select: 'item_name sku_code track_by category'
      })
      .populate({
        path: 'items.unit_id',
        select: '_id name symbol'
      })
      .populate({
        path: 'received_by',
        select: 'name email role'
      })
      .populate({
        path: 'verified_by',
        select: 'name email role'
      });

    if (!grn) {
      return res.status(404).json({
        success: false,
        message: "GRN not found"
      });
    }

    // Create detailed custom response
    const customResponse = {
      _id: grn._id,
      grn_number: grn.grn_number,
      po_id: grn.po_id ? {
        _id: grn.po_id._id,
        po_number: grn.po_id.po_number,
        status: grn.po_id.status,
        order_date: grn.po_id.order_date
      } : null,
      supplier_id: grn.supplier_id ? {
        _id: grn.supplier_id._id,
        name: grn.supplier_id.supplier_name,
        email: grn.supplier_id.email,
        phone: grn.supplier_id.phone,
        address: grn.supplier_id.address
      } : null,
      branch_id: grn.branch_id ? {
        _id: grn.branch_id._id,
        name: grn.branch_id.branch_name,
        address: grn.branch_id.address,
        city: grn.branch_id.city,
        state: grn.branch_id.state,
        country: grn.branch_id.country
      } : null,
      items: grn.items.map(item => ({
        _id: item._id,
        po_item_id: item.po_item_id,
        inventory_item_id: item.inventory_item_id ? {
          _id: item.inventory_item_id._id,
          name: item.inventory_item_id.item_name,
          sku_code: item.inventory_item_id.sku_code,
          track_by: item.inventory_item_id.track_by,
          category: item.inventory_item_id.category
        } : null,
        ordered_quantity: item.ordered_quantity,
        ordered_weight: item.ordered_weight,
        quantity: item.quantity,
        weight: item.weight,
        cost: item.cost,
        total_cost: item.total_cost,
        remarks: item.remarks,
        // Type information
        metal_type: item.metal_type || null,
        stone_type: item.stone_type || null,
        material_type: item.material_type || null,
        metal_purities: item.metal_purities || [],
        stone_purities: item.stone_purities || [],
        unit_id: item.unit_id ? {
          _id: item.unit_id._id,
          name: item.unit_id.name,
          symbol: item.unit_id.symbol
        } : null
      })),
      total_items: grn.total_items,
      total_cost: grn.total_cost,
      status: grn.status,
      remarks: grn.remarks,
      received_by: grn.received_by ? {
        _id: grn.received_by._id,
        name: grn.received_by.name,
        email: grn.received_by.email,
        role: grn.received_by.role
      } : null,
      received_date: grn.received_date,
      verified_by: grn.verified_by ? {
        _id: grn.verified_by._id,
        name: grn.verified_by.name,
        email: grn.verified_by.email,
        role: grn.verified_by.role
      } : null,
      verified_date: grn.verified_date,
      createdAt: grn.createdAt,
      updatedAt: grn.updatedAt
    };

    return res.status(200).json({
      success: true,
      data: customResponse
    });

  } catch (error) {
    console.error("Get GRN by ID Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


export const getGRNsByPOId = async (req, res) => {
  try {
    const { po_id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    console.log("Get GRNs by PO ID:", po_id);

    if (!mongoose.Types.ObjectId.isValid(po_id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Purchase Order ID"
      });
    }

    // Verify PO exists
    const purchaseOrder = await PurchaseOrder.findById(po_id);
    if (!purchaseOrder) {
      return res.status(404).json({
        success: false,
        message: "Purchase Order not found"
      });
    }

    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const skip = (pageNumber - 1) * pageSize;

    // Get total count
    const totalGRNs = await GRN.countDocuments({ po_id });
    
    // Get GRNs for this PO
    const grns = await GRN.find({ po_id })
      .populate({
        path: 'po_id',
        select: 'po_number status'
      })
      .populate({
        path: 'supplier_id',
        select: 'supplier_name'
      })
      .populate({
        path: 'branch_id',
        select: 'branch_name'
      })
      .populate({
        path: 'items.inventory_item_id',
        select: 'item_name sku_code'
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize);

    const customResponse = grns.map(grn => ({
      _id: grn._id,
      grn_number: grn.grn_number,
      po_id: grn.po_id ? {
        _id: grn.po_id._id,
        po_number: grn.po_id.po_number,
        status: grn.po_id.status
      } : null,
      supplier_id: grn.supplier_id ? {
        _id: grn.supplier_id._id,
        name: grn.supplier_id.supplier_name
      } : null,
      branch_id: grn.branch_id ? {
        _id: grn.branch_id._id,
        name: grn.branch_id.branch_name
      } : null,
      total_items: grn.total_items,
      total_cost: grn.total_cost,
      status: grn.status,
      remarks: grn.remarks,
      received_date: grn.received_date,
      createdAt: grn.createdAt,
      items_summary: grn.items.map(item => ({
        item_name: item.inventory_item_id?.item_name || 'N/A',
        quantity: item.quantity,
        weight: item.weight,
        cost: item.cost
      }))
    }));

    const totalPages = Math.ceil(totalGRNs / pageSize);

    return res.status(200).json({
      success: true,
      count: customResponse.length,
      total: totalGRNs,
      page: pageNumber,
      pages: totalPages,
      po_number: purchaseOrder.po_number,
      data: customResponse
    });

  } catch (error) {
    console.error("Get GRNs by PO ID Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};


export const updateGRNStock = async (req, res) => {
  try {
    const { id } = req.params; 
    const { po_id, branch_id, items, remarks, received_by, received_date } = req.body;
    
    console.log("Update GRN Request Body:", req.body);
    console.log("GRN ID:", id);

    // Validate GRN ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid GRN ID"
      });
    }

    // Check if GRN exists
    const existingGRN = await GRN.findById(id);
    if (!existingGRN) {
      return res.status(404).json({
        success: false,
        message: "GRN not found"
      });
    }

    // Check if GRN can be updated (only draft or received status can be updated)
    const allowedStatuses = ["draft", "received"];
    if (!allowedStatuses.includes(existingGRN.status)) {
      return res.status(400).json({
        success: false,
        message: `GRN with status "${existingGRN.status}" cannot be updated. Only draft or received GRNs can be modified.`
      });
    }

    // Get purchase order for validation
    const purchaseOrder = await PurchaseOrder.findById(existingGRN.po_id)
      .populate({
        path: 'supplier_id',
        select: 'supplier_name'
      })
      .populate({
        path: 'items.inventory_item_id',
        select: 'item_name sku_code track_by'
      });

    if (!purchaseOrder) {
      return res.status(404).json({
        success: false,
        message: "Associated Purchase Order not found"
      });
    }

    let totalItems = 0;
    let totalCost = 0;
    const validatedItems = [];

    // Process each item if provided
    if (items && items.length > 0) {
      for (const item of items) {
        const { 
          po_item_id, 
          inventory_item_id, 
          quantity, 
          weight, 
          cost, 
          remarks: item_remarks 
        } = item;

        if (!inventory_item_id || cost === undefined || cost === null) {
          return res.status(400).json({
            success: false,
            message: "Each item must have inventory_item_id and cost"
          });
        }

        // Validate inventory item exists
        const inventoryItem = await InventoryItem.findById(inventory_item_id)
          .populate("unit_id", "name")
          .populate("material_type_id", "material_type")
          .populate({
            path: "metals.metal_id",
            select: "name"
          })
          .populate({
            path: "metals.purity_id",
            select: "purity_name"
          })
          .populate({
            path: "stones.stone_id",
            select: "stone_type"
          })
          .populate({
            path: "stones.stone_purity_id",
            select: "stone_purity"
          });

        if (!inventoryItem) {
          return res.status(404).json({
            success: false,
            message: `Inventory item not found with ID: ${inventory_item_id}`
          });
        }

        const poItem = purchaseOrder.items.find(item => 
          item._id.toString() === po_item_id
        );

        if (!poItem) {
          return res.status(404).json({
            success: false,
            message: `PO item with ID: ${po_item_id} not found in purchase order`
          });
        }

      
        const trackBy = inventoryItem.track_by || poItem.inventory_item_id?.track_by;
        
        if (trackBy === 'quantity') {
          if (!quantity || quantity <= 0) {
            return res.status(400).json({
              success: false,
              message: `Quantity is required and must be greater than 0 for item: "${inventoryItem.item_name}"`
            });
          }
          
          if (weight && weight > 0) {
            return res.status(400).json({
              success: false,
              message: `Item "${inventoryItem.item_name}" is tracked by quantity only, weight should not be provided`
            });
          }
        }
        
        if (trackBy === 'weight') {
          if (!weight || weight <= 0) {
            return res.status(400).json({
              success: false,
              message: `Weight is required and must be greater than 0 for item: "${inventoryItem.item_name}"`
            });
          }
          
          if (quantity && quantity > 0) {
            return res.status(400).json({
              success: false,
              message: `Item "${inventoryItem.item_name}" is tracked by weight only, quantity should not be provided`
            });
          }
        }
        
        if (trackBy === 'both') {
          const hasQuantity = quantity && quantity > 0;
          const hasWeight = weight && weight > 0;
          
          if (!hasQuantity && !hasWeight) {
            return res.status(400).json({
              success: false,
              message: `Either quantity or weight is required for item: "${inventoryItem.item_name}"`
            });
          }
        }

       
        let itemTotalCost = 0;
        if (quantity && quantity > 0) {
          itemTotalCost += cost * quantity;
        }
        if (weight && weight > 0) {
          itemTotalCost += cost * weight;
        }

        totalItems++;
        totalCost += itemTotalCost;

 
        let metalType = null;
        let stoneType = null;
        let materialType = null;
        let metalPurities = [];
        let stonePurities = [];

    
        if (inventoryItem.metals && inventoryItem.metals.length > 0) {
          metalType = inventoryItem.metals[0].metal_id?.name || null;
          metalPurities = inventoryItem.metals
            .filter(metal => metal.purity_id)
            .map(metal => {
              return metal.purity_id?.purity_name || metal.purity_name || null;
            })
            .filter(name => name);
        }

        if (inventoryItem.stones && inventoryItem.stones.length > 0) {
          stoneType = inventoryItem.stones[0].stone_id?.stone_type || null;
          stonePurities = inventoryItem.stones
            .filter(stone => stone.stone_purity_id)
            .map(stone => {
              return stone.stone_purity_id?.stone_purity || stone.stone_purity_value || null;
            })
            .filter(name => name);
        }

        
        if (inventoryItem.material_type_id) {
          materialType = inventoryItem.material_type_id.material_type;
        }

        const poItemMetalType = poItem.metal_type;
        const poItemStoneType = poItem.stone_type;
        const poItemMaterialType = poItem.material_type;
        const poItemMetalPurities = poItem.metal_purities || [];
        const poItemStonePurities = poItem.stone_purities || [];

        const itemData = {
          po_item_id,
          inventory_item_id,
          ordered_quantity: poItem.quantity,
          ordered_weight: poItem.weight,
          quantity: quantity || null,
          weight: weight || null,
          cost: cost,
          total_cost: itemTotalCost,
          metal_type: poItemMetalType || metalType || null,
          stone_type: poItemStoneType || stoneType || null,
          material_type: poItemMaterialType || materialType || null,
          metal_purities: [...new Set([...metalPurities, ...poItemMetalPurities])],
          stone_purities: [...new Set([...stonePurities, ...poItemStonePurities])],
          remarks: item_remarks || ""
        };
        
        validatedItems.push(itemData);
      }
    } else {
  s
      validatedItems.push(...existingGRN.items);
      totalItems = existingGRN.total_items;
      totalCost = existingGRN.total_cost;
    }

   
    const updateData = {
      items: validatedItems,
      total_items: totalItems,
      total_cost: totalCost,
      remarks: remarks !== undefined ? remarks : existingGRN.remarks,
      received_by: received_by || existingGRN.received_by,
      received_date: received_date ? new Date(received_date) : existingGRN.received_date,
      status: "received" 
    };

   
    const updatedGRN = await GRN.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

 
    for (const oldItem of existingGRN.items) {
      if (oldItem.po_item_id) {
        const poItemIndex = purchaseOrder.items.findIndex(
          item => item._id.toString() === oldItem.po_item_id
        );

        if (poItemIndex !== -1) {
          purchaseOrder.items[poItemIndex].received_quantity = 
            Math.max(0, (purchaseOrder.items[poItemIndex].received_quantity || 0) - (oldItem.quantity || 0));
          purchaseOrder.items[poItemIndex].received_weight = 
            Math.max(0, (purchaseOrder.items[poItemIndex].received_weight || 0) - (oldItem.weight || 0));
        }
      }
    }

   
    for (const newItem of updatedGRN.items) {
      if (newItem.po_item_id) {
        const poItemIndex = purchaseOrder.items.findIndex(
          item => item._id.toString() === newItem.po_item_id
        );

        if (poItemIndex !== -1) {
          purchaseOrder.items[poItemIndex].received_quantity = 
            (purchaseOrder.items[poItemIndex].received_quantity || 0) + (newItem.quantity || 0);
          purchaseOrder.items[poItemIndex].received_weight = 
            (purchaseOrder.items[poItemIndex].received_weight || 0) + (newItem.weight || 0);

        
          const orderedQty = purchaseOrder.items[poItemIndex].quantity;
          const orderedWt = purchaseOrder.items[poItemIndex].weight;
          const receivedQty = purchaseOrder.items[poItemIndex].received_quantity;
          const receivedWt = purchaseOrder.items[poItemIndex].received_weight;

          const isFullyReceived = (orderedQty && receivedQty >= orderedQty) || 
                                  (orderedWt && receivedWt >= orderedWt);

          if (isFullyReceived) {
            purchaseOrder.items[poItemIndex].status = "received";
          } else if (receivedQty > 0 || receivedWt > 0) {
            purchaseOrder.items[poItemIndex].status = "partially_received";
          } else {
            purchaseOrder.items[poItemIndex].status = "pending";
          }
        }
      }
    }


    const allItemsReceived = purchaseOrder.items.every(item => item.status === "received");
    const anyItemReceived = purchaseOrder.items.some(item => 
      item.status === "received" || item.status === "partially_received"
    );
    const anyItemPending = purchaseOrder.items.some(item => 
      item.status === "pending"
    );

    if (allItemsReceived) {
      purchaseOrder.status = "completed";
    } else if (anyItemReceived) {
      purchaseOrder.status = "partially_received";
    } else if (anyItemPending) {
      purchaseOrder.status = "approved";
    }

    await purchaseOrder.save();

    for (const oldItem of existingGRN.items) {
      const user_id = existingGRN.received_by || null;
      await reverseInventoryStock(oldItem, existingGRN.branch_id, user_id);
    }


    for (const newItem of updatedGRN.items) {
      const user_id = updatedGRN.received_by || null;
      await updateInventoryStock(newItem, updatedGRN.branch_id, user_id);
    }

 
    const populatedGRN = await GRN.findById(updatedGRN._id)
      .populate({
        path: 'po_id',
        select: 'po_number status'
      })
      .populate({
        path: 'supplier_id',
        select: 'supplier_name'
      })
      .populate({
        path: 'branch_id',
        select: 'branch_name address'
      })
      .populate({
        path: 'items.inventory_item_id',
        select: 'item_name sku_code track_by'
      })
      .populate({
        path: 'received_by',
        select: 'name email'
      });

    // Format response
    const responseData = {
      _id: populatedGRN._id,
      grn_number: populatedGRN.grn_number,
      po_id: populatedGRN.po_id ? {
        _id: populatedGRN.po_id._id,
        po_number: populatedGRN.po_id.po_number,
        status: populatedGRN.po_id.status
      } : null,
      supplier_id: populatedGRN.supplier_id ? {
        _id: populatedGRN.supplier_id._id,
        name: populatedGRN.supplier_id.supplier_name
      } : null,
      branch_id: populatedGRN.branch_id ? {
        _id: populatedGRN.branch_id._id,
        name: populatedGRN.branch_id.branch_name,
        address: populatedGRN.branch_id.address
      } : null,
      items: populatedGRN.items.map(item => ({
        _id: item._id,
        po_item_id: item.po_item_id,
        inventory_item_id: item.inventory_item_id ? {
          _id: item.inventory_item_id._id,
          name: item.inventory_item_id.item_name,
          sku_code: item.inventory_item_id.sku_code,
          track_by: item.inventory_item_id.track_by
        } : null,
        ordered_quantity: item.ordered_quantity,
        ordered_weight: item.ordered_weight,
        quantity: item.quantity,
        weight: item.weight,
        cost: item.cost,
        total_cost: item.total_cost,
        // remarks: item.remarks || "",
        metal_type: item.metal_type || null,
        stone_type: item.stone_type || null,
        material_type: item.material_type || null,
        metal_purities: item.metal_purities || [],
        stone_purities: item.stone_purities || []
      })),
      total_items: populatedGRN.total_items,
      total_cost: populatedGRN.total_cost,
      status: populatedGRN.status,
      remarks: populatedGRN.remarks,
      received_by: populatedGRN.received_by ? {
        _id: populatedGRN.received_by._id,
        name: populatedGRN.received_by.name,
        email: populatedGRN.received_by.email
      } : null,
      received_date: populatedGRN.received_date,
      createdAt: populatedGRN.createdAt,
      updatedAt: populatedGRN.updatedAt
    };

    return res.status(200).json({
      success: true,
      message: "GRN updated successfully",
      data: responseData
    });

  } catch (error) {
    console.error("Update GRN Error:", error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ 
        success: false, 
        message: messages.join(', ')
      });
    }
    
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


