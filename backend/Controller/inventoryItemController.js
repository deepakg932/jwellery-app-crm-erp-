import InventoryItem from "../Models/models/InventoryModel.js";
import InventoryCategory from "../Models/models/InventoryCategory.js";
import Purity from "../Models/models/Purity.js";
import Metal from "../Models/models/MetalTypeModel.js";
import StoneType from "../Models/models/StoneType.js";
import MaterialTypes from "../Models/models/MaterialTypes.js";
import Product from "../Models/models/ProductModel.js"
import Unit from "../Models/models/unitModel.js";
import mongoose from "mongoose";
import stonePurityModel from "../Models/models/stonePurityModel.js";
import Supplier from "../Models/models/SuppliersModel.js";
import Branch from "../Models/models/Branch.js"




export const createInventoryItem = async (req, res) => {
  try {
    const { 
      item_name,
      item_code,
      inventory_category_id,
      branch_id,
      metals = [],
      stones = [],
      gold_rate,
      stone_rate,
      making_charges = 0,
      making_type = "percentage",
      wastage_percentage = 5,
      profit_margin = 20,
      // Other fields
      design_number,
      jewelry_type,
      size,
      gender,
      occasion,
      discount_type = "none",
      discount_value = 0,
      gst_percentage = 3,
      current_stock = 1,
      minimum_stock = 1,
      location_type = "showcase",
      location_details,
      supplier_id,
      purchase_date,
      purchase_invoice,
      purchase_price = 0,
      images = [],
      description,
      tags, // यहाँ tags लें
      status = "active",
      created_by
    } = req.body;
    
    console.log("📥 Received tags:", tags); // Debug log
    
    // ==================== VALIDATION ====================
    
    // Required fields
    if (!item_name || !item_code || !inventory_category_id || !branch_id) {
      return res.status(400).json({ 
        success: false,
        message: "Required fields: item_name, item_code, inventory_category_id, branch_id" 
      });
    }
    
    // Check for duplicate item_code
    const existingItem = await InventoryItem.findOne({ item_code });
    if (existingItem) {
      return res.status(400).json({
        success: false,
        message: "Item code already exists"
      });
    }
    
    // Check category exists
    const category = await InventoryCategory.findById(inventory_category_id);
    if (!category) {
      return res.status(404).json({ 
        success: false, 
        message: "Inventory Category not found" 
      });
    }
    
    // Check branch exists
    const branch = await Branch.findById(branch_id);
    if (!branch) {
      return res.status(404).json({ 
        success: false, 
        message: "Branch not found" 
      });
    }
    
    // ==================== CALCULATIONS IN CONTROLLER ====================
    
    // Calculate metal weight
    let metal_weight = 0;
    if (metals.length > 0) {
      metal_weight = metals.reduce((sum, metal) => sum + (metal.weight || 0), 0);
    }
    
    // Calculate total carat
    let total_carat = 0;
    if (stones.length > 0) {
      total_carat = stones.reduce((sum, stone) => sum + (stone.carat_weight || 0), 0);
    }
    
    // Calculate costs
    const metal_cost = gold_rate && metal_weight ? gold_rate * metal_weight : 0;
    const stone_cost = stone_rate && total_carat ? stone_rate * total_carat : 0;
    
    // Calculate wastage charges
    const wastage_charges = wastage_percentage > 0 && metal_cost ? 
      (metal_cost * wastage_percentage) / 100 : 0;
    
    // Calculate making charges
    let makingChargesAmount = making_charges;
    if (making_type === "per_gram" && metal_weight) {
      makingChargesAmount = metal_weight * making_charges;
    } else if (making_type === "percentage" && metal_cost) {
      makingChargesAmount = (metal_cost * making_charges) / 100;
    }
    
    // Calculate total cost
    const total_cost_price = metal_cost + stone_cost + makingChargesAmount + wastage_charges;
    
    // Calculate selling price
    const selling_price = total_cost_price > 0 && profit_margin > 0 ?
      total_cost_price * (1 + profit_margin / 100) : 0;
    
    // ==================== CREATE ITEM ====================
    
    const itemData = {
      // Basic Information
      item_name,
      item_code,
      inventory_category_id,
      branch_id,
      
      // Metals and Stones
      metals,
      stones,
      
      // Jewelry Details
      design_number,
      jewelry_type,
      size,
      gender,
      occasion,
      
      // Pricing
      gold_rate,
      stone_rate,
      making_charges,
      making_type,
      wastage_percentage,
      profit_margin,
      discount_type,
      discount_value,
      gst_percentage,
      
      // Pre-calculated values
      metal_weight,
      total_carat,
      metal_cost,
      stone_cost,
      wastage_charges,
      total_cost_price,
      selling_price,
      
      // Stock and Location
      current_stock,
      minimum_stock,
      location_type,
      location_details,
      
      // Supplier
      supplier_id: supplier_id || null,
      purchase_date: purchase_date || null,
      purchase_invoice: purchase_invoice || "",
      purchase_price: purchase_price || 0,
      
      // Images and Description
      images: images || [],
      description: description || "",
      
      // Tags - यहाँ add करें
      tags: tags || "",
      
      // Status
      status: status || "active",
      
      // Created by
      created_by: created_by || req.user?._id || null,
    };
    
    console.log("✅ Item data with tags:", itemData.tags); 
    
    const item = await InventoryItem.create(itemData);
    
    return res.status(201).json({
      success: true,
      message: "Item created successfully",
      data: item
    });
    
  } catch (err) {
    console.error("Error:", err.message);
    console.error("Full error:", err);
    
    // Handle duplicate key errors
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(409).json({ 
        success: false, 
        message: `${field} already exists` 
      });
    }
    
    // Handle validation errors
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    
    return res.status(500).json({ 
      success: false, 
      message: "Server error",
      error: err.message 
    });
  }
};




// export const getInventoryItems = async (req, res) => {
//   try {
//     const items = await InventoryItem.find()
//       .populate("inventory_category_id", "name")
//       .populate("material_type_id", "material_type")
//       .populate("product_id", "product_name")
//       .populate("unit_id", "name")
//       .populate({
//         path: "metals.metal_id",
//         select: "name"
//       })
//       .populate({
//         path: "metals.purity_id",
//         select: "purity_name metal_type percentage karat"
//       })
//       .populate({
//         path: "stones.stone_id",
//         select: "stone_type stone_purity percentage"
//       })
//       .populate({
//         path: "stones.stone_purity_id",
//         select: "stone_type stone_purity percentage"
//       })
//       .sort({ createdAt: -1 }); 

//     console.log(items, "items");

//     return res.status(200).json({ success: true, count: items.length,data: items });
//   } catch (err) {
//     console.error("Get Inventory Items Error:", err);
//     return res.status(500).json({ success: false, message: "Server error",error: process.env.NODE_ENV === 'development' ? err.message : undefined });
//   }
// };






export const getInventoryItems = async (req, res) => {
  try {
    // Optional: Add query parameters for filtering
    const { 
      page = 1, 
      limit = 10, 
      category_id, 
      branch_id, 
      status, 
      item_type,
      search
    } = req.query;
    
    // Build query object
    const query = {};
    
    if (category_id) {
      query.inventory_category_id = category_id;
    }
    
    if (branch_id) {
      query.branch_id = branch_id;
    }
    
    if (status) {
      query.status = status;
    }
    
    if (item_type) {
      query.item_type = item_type;
    }
    
    if (search) {
      query.$or = [
        { item_name: { $regex: search, $options: 'i' } },
        { item_code: { $regex: search, $options: 'i' } },
        { sku_code: { $regex: search, $options: 'i' } },
        { design_number: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Execute query with pagination
    const items = await InventoryItem.find(query)
      .populate("inventory_category_id", "name")
      .populate("branch_id", "name address phone")
      .populate("supplier_id", "name contact_person phone email")
      .populate("created_by", "name email")
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count for pagination info
    const total = await InventoryItem.countDocuments(query);
    
    console.log(`✅ Found ${items.length} items out of ${total} total`);
    
    return res.status(200).json({ 
      success: true, 
      count: items.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: items 
    });
    
  } catch (err) {
    console.error("❌ Get Inventory Items Error:", err);
    return res.status(500).json({ 
      success: false, 
      message: "Server error",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined 
    });
  }
};



export const getInventoryPagination= async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      material_type,
      inventory_category,
      track_by,
      status = true
    } = req.query;

    const filter = {};

    
    filter.status = status === 'true' || status === true;

    
    if (material_type && mongoose.Types.ObjectId.isValid(material_type)) {
      filter.material_type_id = material_type;
    }

 
    if (inventory_category && mongoose.Types.ObjectId.isValid(inventory_category)) {
      filter.inventory_category_id = inventory_category;
    }

 
    if (track_by && ['weight', 'quantity', 'both'].includes(track_by)) {
      filter.track_by = track_by;
    }

    
    if (search) {
      filter.$or = [
        { item_name: { $regex: search, $options: 'i' } },
        { sku_code: { $regex: search, $options: 'i' } }
      ];
    }


    const skip = (parseInt(page) - 1) * parseInt(limit);


    const total = await InventoryItem.countDocuments(filter);

  
    const items = await InventoryItem.find(filter)
      .populate("inventory_category_id", "name")
      .populate("material_type_id", "material_type")
      .populate("product_id", "product_name")
      .populate("unit_id", "name")
      .populate({
        path: "metals.metal_id",
        select: "name"
      })
      .populate({
        path: "metals.purity_id",
        select: "purity_name metal_type percentage karat"
      })
      .populate({
        path: "stones.stone_id",
        select: "stone_type stone_purity percentage"
      })
      .populate({
        path: "stones.stone_purity_id",
        select: "stone_type stone_purity percentage"
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    console.log(`Found ${items.length} items`, "items");

    return res.status(200).json({ success: true, count: items.length,total,totalPages: Math.ceil(total / parseInt(limit)),currentPage: parseInt(page),
      data: items 
    });
  } catch (err) {
    console.error("Get Inventory Items Error:", err);
    return res.status(500).json({ success: false, message: "Server error",error: process.env.NODE_ENV === 'development' ? err.message : undefined  });
  }
};

export const updateInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("id", id);

    const {
      item_name,
      inventory_category_id,
      material_type_id,
      metal_type_name,
      metal_purity_name,
      stone_type_name,
      stone_purity_name,
      unit_id,
      product_id,
      track_by,
      weight,
      quantity
    } = req.body;

    console.log("Update Request Body:", req.body);

    const existingItem = await InventoryItem.findById(id);
    if (!existingItem) {
      return res.status(404).json({success: false,message: "Inventory Item not found",});
    }


    let updateData = {};

    if (item_name !== undefined) updateData.item_name = item_name;
    if (track_by !== undefined) updateData.track_by = track_by;
    
  
    if (track_by !== undefined) {
      if (track_by === "weight" || track_by === "both") {
        if (weight !== undefined) updateData.total_weight = weight;
        else if (track_by === "weight") updateData.total_weight = weight || null;
      } else {
        updateData.total_weight = null;
      }
      
      if (track_by === "quantity" || track_by === "both") {
        if (quantity !== undefined) updateData.total_quantity = quantity;
        else if (track_by === "quantity") updateData.total_quantity = quantity || null;
      } else {
        updateData.total_quantity = null;
      }
    }

 
    const hasMetalUpdate = metal_type_name !== undefined || metal_purity_name !== undefined;
    const hasStoneUpdate = stone_type_name !== undefined || stone_purity_name !== undefined;
    const hasMaterialUpdate = material_type_id !== undefined;

    console.log("Update flags:", { hasMetalUpdate, hasStoneUpdate, hasMaterialUpdate });


    if (hasMetalUpdate || hasStoneUpdate || hasMaterialUpdate) {
    
      if (hasMaterialUpdate && !hasMetalUpdate && !hasStoneUpdate) {
        console.log("Updating to MATERIAL item - clearing metals and stones");
        updateData.metals = [];
        updateData.stones = [];
      }
     
      else if (hasMetalUpdate) {
        console.log("Updating to METAL item");
        
        let metals = [];
        console.log(metals,"metals")
        
    
        if (metal_type_name !== undefined) {
          if (metal_type_name) {
            const metalDoc = await Metal.findOne({ name: metal_type_name });
            
            if (!metalDoc) {
              return res.status(404).json({success: false,message: `Metal type '${metal_type_name}' not found`});
            }

           
            let purityDoc = null;
            if (metal_purity_name !== undefined && metal_purity_name) {
              purityDoc = await Purity.findOne({ purity_name: metal_purity_name });
              
              if (!purityDoc) {
                purityDoc = await Purity.findOne({
                  metal_type: metal_type_name,
                  $or: [
                    { purity_name: metal_purity_name },
                    { karat: parseInt(metal_purity_name) || 0 }
                  ]
                });
              }
              
              if (!purityDoc) {
                return res.status(404).json({success: false,message: `Metal purity '${metal_purity_name}' not found for metal type '${metal_type_name}'`});
              }

              if (purityDoc.stone_purity) {
                return res.status(400).json({success: false, message: "This purity is for stone, not for metal"});
              }
            }

            metals.push({
              metal_id: metalDoc._id,
              purity_id: purityDoc?._id || null,
              purity_name: purityDoc?.purity_name || purityDoc?.metal_type || null,
              karat: purityDoc?.karat || null,
              percentage: purityDoc?.percentage || null,
              metal_weight: updateData.total_weight || existingItem.metals[0]?.metal_weight || null
            });
          } else {
          
            metals = [];
          }
        } 

        else if (metal_purity_name !== undefined && existingItem.metals.length > 0) {
          const existingMetal = existingItem.metals[0];
          
          if (metal_purity_name) {
            const purityDoc = await Purity.findOne({ purity_name: metal_purity_name });
            
            if (!purityDoc) {
              return res.status(404).json({success: false,message: `Metal purity '${metal_purity_name}' not found`});
            }

            metals = [{
              ...existingMetal.toObject(),
              purity_id: purityDoc._id,
              purity_name: purityDoc.purity_name,
              karat: purityDoc.karat || null,
              percentage: purityDoc.percentage || null
            }];
          } else {
           
            metals = [{
              ...existingMetal.toObject(),
              purity_id: null,
              purity_name: null,
              karat: null,
              percentage: null
            }];
          }
        }
        
        updateData.metals = metals;
        
        if (!hasStoneUpdate) {
          console.log("Clearing stones when updating to metal");
          updateData.stones = [];
        }
      }

 
      if (hasStoneUpdate) {
        console.log("Updating to STONE item");
        
        let stones = [];
        
       
        if (stone_type_name !== undefined) {
          if (stone_type_name) {
            
            const stoneDoc = await StoneType.findOne({ stone_type: stone_type_name });
            
            if (!stoneDoc) {
              return res.status(404).json({
                success: false,
                message: `Stone type '${stone_type_name}' not found`
              });
            }

        
            let stonePurityInfo = null;
            
            if (stone_purity_name !== undefined) {
              if (stone_purity_name) {
               
                let stonePurityDoc = await StoneType.findOne({
                  stone_type: stone_type_name,
                  stone_purity: stone_purity_name
                });
                
                if (stonePurityDoc) {
                  stonePurityInfo = {
                    stone_purity_id: stonePurityDoc._id,
                    stone_purity_value: stonePurityDoc.stone_purity,
                    percentage: stonePurityDoc.percentage || null
                  };
                } else {
                  const purityDoc = await Purity.findOne({
                    stone_type: stone_type_name,
                    stone_purity: stone_purity_name
                  });
                  
                  if (purityDoc) {
                    stonePurityInfo = {
                      stone_purity_id: purityDoc._id,
                      stone_purity_value: purityDoc.stone_purity,
                      percentage: purityDoc.percentage || null
                    };
                  } else {
                    const stonePurityByModel = await stonePurityModel.findOne({
                      stone_purity: stone_purity_name
                    });
                    
                    if (stonePurityByModel) {
                      stonePurityInfo = {
                        stone_purity_id: stonePurityByModel._id,
                        stone_purity_value: stonePurityByModel.stone_purity,
                        percentage: stonePurityByModel.percentage || null
                      };
                    } else {
                      stonePurityInfo = {
                        stone_purity_value: stone_purity_name,
                        percentage: null
                      };
                    }
                  }
                }
              } else {
                stonePurityInfo = {
                  stone_purity_value: null,
                  percentage: null
                };
              }
            } else {
             
              stonePurityInfo = {
                stone_purity_value: stoneDoc.stone_purity || null,
                percentage: stoneDoc.percentage || null
              };
            }

            stones.push({
              stone_id: stoneDoc._id,
              stone_purity_id: stonePurityInfo.stone_purity_id || null,
              stone_purity_value: stonePurityInfo.stone_purity_value,
              percentage: stonePurityInfo.percentage,
              stone_quantity: updateData.total_quantity || existingItem.stones[0]?.stone_quantity || null
            });
          } else {
           
            stones = [];
          }
        } 
       
        else if (stone_purity_name !== undefined && existingItem.stones.length > 0) {
          const existingStone = existingItem.stones[0];
          
          if (stone_purity_name) {
            let stonePurityDoc = await StoneType.findOne({ stone_purity: stone_purity_name });
            
            if (!stonePurityDoc) {
              const purityDoc = await Purity.findOne({ stone_purity: stone_purity_name });
              
              if (purityDoc) {
                stones = [{
                  ...existingStone.toObject(),
                  stone_purity_id: purityDoc._id,
                  stone_purity_value: purityDoc.stone_purity,
                  percentage: purityDoc.percentage || null
                }];
              } else {
                stones = [{
                  ...existingStone.toObject(),
                  stone_purity_value: stone_purity_name,
                  percentage: null
                }];
              }
            } else {
              stones = [{
                ...existingStone.toObject(),
                stone_purity_id: stonePurityDoc._id,
                stone_purity_value: stonePurityDoc.stone_purity,
                percentage: stonePurityDoc.percentage || null
              }];
            }
          } else {
           
            stones = [{
              ...existingStone.toObject(),
              stone_purity_id: null,
              stone_purity_value: null,
              percentage: null
            }];
          }
        }
        
        updateData.stones = stones;
        
        
        if (!hasMetalUpdate) {
          console.log("Clearing metals when updating to stone");
          updateData.metals = [];
        }
      }
    }


    if (material_type_id !== undefined) {
      if (material_type_id) {
        const materialType = await MaterialTypes.findById(material_type_id);
        if (!materialType) {
          return res.status(404).json({success: false,message: "Material type not found"});
        }
        updateData.material_type_id = material_type_id;
        
        
        if (!hasMetalUpdate && !hasStoneUpdate) {
          console.log("Setting material type - clearing metals and stones");
          updateData.metals = [];
          updateData.stones = [];
        }
      } else {
        updateData.material_type_id = null;
      }
    }

  
    if (unit_id !== undefined) {
      if (unit_id) {
        const unit = await Unit.findById(unit_id);
        if (!unit) {
          return res.status(404).json({success: false,message: "Unit not found"});
        }
        updateData.unit_id = unit_id;
      } else {
        updateData.unit_id = null;
      }
    }

    if (product_id !== undefined) {
      if (product_id) {
        const product = await Product.findById(product_id);
        if (!product) {
          return res.status(404).json({ success: false, message: "Product not found"});
        }
        updateData.product_id = product_id;
      } else {
        updateData.product_id = null;
      }
    }

    if (inventory_category_id !== undefined) {
      if (inventory_category_id) {
        const category = await InventoryCategory.findById(inventory_category_id);
        if (!category) {
          return res.status(404).json({ success: false, message: "Inventory Category not found"});
        }
        updateData.inventory_category_id = inventory_category_id;
      } else {
        updateData.inventory_category_id = null;
      }
    }

    console.log("Final Update Data:", JSON.stringify(updateData, null, 2));

    const updatedItem = await InventoryItem.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate("inventory_category_id", "name")
      .populate("material_type_id", "material_type")
      .populate("product_id", "product_name")
      .populate("unit_id", "name")
      .populate({
        path: "metals.metal_id",
        select: "name"
      })
      .populate({
        path: "metals.purity_id",
        select: "purity_name metal_type percentage karat"
      })
      .populate({
        path: "stones.stone_id",
        select: "stone_type stone_purity percentage"
      })
      .populate({
        path: "stones.stone_purity_id",
        select: "stone_type stone_purity percentage"
      });

    return res.status(200).json({success: true,message: "Inventory Item updated successfully",data: updatedItem,});
  } catch (error) {
    console.error("Update Inventory Item Error:", error);
    return res.status(500).json({success: false,message: "Server error",error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const deleteinventoryitem = async (req,res) => {
  try {
    let id = req.params.id;
    console.log(id,"id")
    const deleted = await InventoryItem.findById({ _id: id });
    console.log(deleted, "deleted");
    if (!deleted) {
      return res.status(404).json({ status: false, message: "Inventory not found" });
    } else {
      let c = await InventoryItem.findByIdAndDelete({ _id: id });
      console.log(c, "c");
      return res.status(200).json({ status: true, message: "Inventory deleted successfully" });
    }
  } catch (errr) {
    console.log(errr, "errr");
    return res.status(500).json({ success: false, message: errr.message });
  }
};



