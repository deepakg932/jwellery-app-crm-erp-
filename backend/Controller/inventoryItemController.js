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





export const createInventoryItem = async (req, res) => {
  try {
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
    
    console.log(req.body, "req.body");

    // // 1. Basic validations - material_type_id is NOT required
    // if (!item_name || !inventory_category_id || !track_by || !unit_id) {
    //   return res.status(400).json({ 
    //     success: false,
    //     message: "Required fields missing: item_name, inventory_category_id, track_by, unit_id" 
    //   });
    // }

    // 2. Check: User must provide EITHER metal details OR stone details OR material details
    const hasMetal = metal_type_name || metal_purity_name;
    const hasStone = stone_type_name || stone_purity_name;
    const hasMaterial = material_type_id;
    
    if (!hasMetal && !hasStone && !hasMaterial) {
      return res.status(400).json({success: false,message: "Please provide either metal details, stone details, or material type"});
    }

   
    const validateObjectId = (id, fieldName) => {
      if (id && !mongoose.Types.ObjectId.isValid(id)) {
        throw new Error(`Invalid ${fieldName}`);
      }
      return true;
    };

    try {
      if (material_type_id) validateObjectId(material_type_id, "material type");
      validateObjectId(inventory_category_id, "inventory category");
      validateObjectId(unit_id, "unit");
      if (product_id) validateObjectId(product_id, "product");
    } catch (validationError) {
      return res.status(400).json({success: false,message: validationError.message});
    }


    const category = await InventoryCategory.findById(inventory_category_id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Inventory Category not found" });
    }
    console.log(category, "category");
    
    
    const unit = await Unit.findById(unit_id);
    console.log(unit, "unit");
    // if (!unit) {
    //   return res.status(404).json({ 
    //     success: false, 
    //     message: "Unit not found" 
    //   });
    // }

    
    let materialType = null;
    if (material_type_id) {
      materialType = await MaterialTypes.findById(material_type_id);
      if (!materialType) {
        return res.status(404).json({success: false,message: "Material type not found"});
      }
      console.log(materialType, "materialType");
    }

 
    if (track_by === "weight" && (!weight || weight <= 0)) {
      return res.status(400).json({ success: false,message: "Valid weight is required when track_by is 'weight'" });
    }

    if (track_by === "quantity" && (!quantity || quantity <= 0)) {
      return res.status(400).json({  success: false, message: "Valid quantity is required when track_by is 'quantity'" });
    }

    if (track_by === "both" && (!weight || weight <= 0 || !quantity || quantity <= 0)) {
      return res.status(400).json({success: false,message: "Both weight and quantity are required and must be positive"});
    }

    let metals = [];
    console.log(metals)
    if (metal_type_name) {
      
      if (!metal_purity_name) {
        return res.status(400).json({success: false,message: "Metal purity name is required when metal type is provided"});
      }

      const metalDoc = await Metal.findOne({ name: metal_type_name });
      console.log(metalDoc, "metalDoc");
      
      if (!metalDoc) {
        return res.status(404).json({ success: false, message: `Metal type '${metal_type_name}' not found` });
      }

      let purityDoc = await Purity.findOne({ purity_name: metal_purity_name });
      console.log(purityDoc, "purityDoc");

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
        return res.status(400).json({success: false,message: "This purity is for stone, not for metal"});
      }

      if (purityDoc.metal_type && purityDoc.metal_type.toLowerCase() !== metal_type_name.toLowerCase()) {
        return res.status(400).json({success: false,message: `Purity '${metal_purity_name}' does not belong to metal type '${metal_type_name}'`});
      }

      metals.push({
        metal_id: metalDoc._id,
        purity_id: purityDoc._id,
        purity_name: purityDoc.purity_name || purityDoc.metal_type,
        karat: purityDoc.karat || null,
        percentage: purityDoc.percentage || null,
        metal_weight: track_by === "weight" || track_by === "both" ? weight : null
      });
    }

    
    let stones = [];
    console.log(stones,"stones")
    if (stone_type_name) {
      
      const stoneDoc = await StoneType.findOne({ stone_type: stone_type_name });
      console.log(stoneDoc, "stoneDoc");
      
      if (!stoneDoc) {
        return res.status(404).json({ success: false, message: `Stone type '${stone_type_name}' not found` });
      }

      let stonePurityInfo = null;
      console.log(stonePurityInfo, "stonePurityInfo");
      
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
          stone_purity_value: stoneDoc.stone_purity || null,
          percentage: stoneDoc.percentage || null
        };
      }

      stones.push({
        stone_id: stoneDoc._id,
        stone_purity_id: stonePurityInfo.stone_purity_id || null,
        stone_purity_value: stonePurityInfo.stone_purity_value,
        percentage: stonePurityInfo.percentage,
        stone_quantity: track_by === "quantity" || track_by === "both" ? quantity : null
      });
    }

    
    const sku_code = `SKU-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    console.log(sku_code, "sku_code");


    const itemData = {
      item_name,
      sku_code,
      unit_id,
      inventory_category_id,
      track_by,
      total_weight: track_by === "weight" || track_by === "both" ? weight : null,
      total_quantity: track_by === "quantity" || track_by === "both" ? quantity : null,
    };

    if (material_type_id && materialType) {
      itemData.material_type_id = materialType._id;
    }
  
    if (metals.length > 0) {
      itemData.metals = metals;
    }

    if (stones.length > 0) {
      itemData.stones = stones;
    }
    
    console.log(itemData, "itemData");

   
    if (product_id) {
      const product = await Product.findById(product_id);
      console.log("product", product);
      if (product) itemData.product_id = product_id;
    }

    const item = await InventoryItem.create(itemData);
    console.log(item, "item");

    const populatedItem = await InventoryItem.findById(item._id)
      .populate("inventory_category_id", "name")
      .populate("unit_id", "name")
      .populate("product_id", "product_name")
      .populate("material_type_id", "material_type")
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
    
    console.log(populatedItem, "populatedItem");

    return res.status(200).json({success: true, message: "Inventory Item created successfully",data: populatedItem,});
  } catch (err) {
    console.error("Create Inventory Item Error:", err);
    
    if (err.code === 11000) {
      return res.status(409).json({ success: false,  message: "SKU already exists" });
    }
    
    return res.status(500).json({  success: false,  message: "Server error", error: process.env.NODE_ENV === 'development' ? err.message : undefined });
  }
};






export const getInventoryItems = async (req, res) => {
  try {
    const items = await InventoryItem.find()
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
      .sort({ createdAt: -1 }); 

    console.log(items, "items");

    return res.status(200).json({ success: true, count: items.length,data: items });
  } catch (err) {
    console.error("Get Inventory Items Error:", err);
    return res.status(500).json({ success: false, message: "Server error",error: process.env.NODE_ENV === 'development' ? err.message : undefined });
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



