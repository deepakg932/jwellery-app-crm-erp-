import Product from "../Models/models/ProductModel.js"
import ProductImage from "../Models/models/ProductImage.js";
import Unit from "../Models/models/unitModel.js";
import GstRate from "../Models/models/GstRate.js";
import MaterialTypes from "../Models/models/MaterialTypes.js";
import stonePurityModel from "../Models/models/stonePurityModel.js";
import PriceMaking from "../Models/models/PricemakingModel.js";

import Stone from "../Models/models/Stone.js";
import { MetalType } from "./purityController.js";
import Purity from "../Models/models/Purity.js";
import StoneType from "../Models/models/StoneType.js";
import Subcategory from "../Models/models/Subcategory.js";
import Metal from "../Models/models/MetalTypeModel.js";
import Brand from "../Models/models/brandModel.js";
import Category from "../Models/models/Category.js";
import Wastage from "../Models/models/wastageModel.js";
import mongoose from "mongoose";
import Hallmark from "../Models/models/Hallmark.js";
import {calculateMetalSubtotal, calculateStoneSubtotal, generateProductCode,calculateMaterialCost} from "../helper/generateProductCode.js"






export const getProducts = async (req, res) => {
  try {
    const { 
      status, 
      search, 
      page = 1, 
      limit = 10,
      brand_id,
      category_id,
      subcategory_id,
      min_price,
      max_price
    } = req.query;

    // Build filter object
    const filter = {};

    // Status filter
    if (status && (status === "active" || status === "inactive" || status === "draft" || status === "out_of_stock" || status === "discontinued")) {
      filter.status = status;
    }

    // Search filter (product name or code)
    if (search) {
      filter.$or = [
        { product_name: { $regex: search, $options: "i" } },
        { product_code: { $regex: search, $options: "i" } },
        { product_brand: { $regex: search, $options: "i" } },
        { product_category: { $regex: search, $options: "i" } },
        { product_subcategory: { $regex: search, $options: "i" } }
      ];
    }

    // Brand filter
    if (brand_id && mongoose.Types.ObjectId.isValid(brand_id)) {
      filter.product_brand_id = brand_id;
    }

    // Category filter
    if (category_id && mongoose.Types.ObjectId.isValid(category_id)) {
      filter.product_category_id = category_id;
    }

    // Subcategory filter
    if (subcategory_id && mongoose.Types.ObjectId.isValid(subcategory_id)) {
      filter.product_subcategory_id = subcategory_id;
    }

    // Price range filter
    if (min_price || max_price) {
      filter.selling_price_with_gst = {};
      if (min_price) {
        filter.selling_price_with_gst.$gte = parseFloat(min_price);
      }
      if (max_price) {
        filter.selling_price_with_gst.$lte = parseFloat(max_price);
      }
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Fetch products with filters and pagination
    const [products, totalProducts] = await Promise.all([
      Product.find(filter)
        // Brand, Category, Subcategory
        .populate("product_brand_id", "brand_name name")
        .populate("product_category_id", "category_name name")
        .populate("product_subcategory_id", "sub_category_name name")
        
        // Hallmark
        .populate("hallmark_id", "name metal_type metal_type_name description image")
        
        // Metals and related
        .populate({
          path: "metals.metal_id",
          select: "metal_name name"
        })
        .populate({
          path: "metals.purity_id",
          select: "purity_name name"
        })
        .populate({
          path: "metals.hallmark_id",
          select: "name metal_type metal_type_name description image"
        })
        .populate({
          path: "metals.making_charge_id",
          select: "cost_name cost_type"
        })
        
        // Stones
        .populate({
          path: "stones.stone_id",
          select: "stone_type name"
        })
        .populate({
          path: "stones.stone_purity_id",
          select: "stone_purity purity_name name"
        })
        
        // Materials
        .populate({
          path: "materials.wastage_id",
          select: "wastage_type"
        })
        .populate({
          path: "materials.material_id",
          select: "material_type"
        })
       
        .populate({
          path: "price_making_costs.price_making_id",
          select: "stage_name sub_stage_name cost_type unit_name cost_amount is_active",
          model: "PriceMaking"
        })
        
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
        
      Product.countDocuments(filter),
    ]);

    console.log("Products fetched:", products.length);

    const transformedProducts = products.map(product => {
      const productObj = product.toObject();
      
     
      if (productObj.price_making_costs && Array.isArray(productObj.price_making_costs)) {
        productObj.price_making_costs = productObj.price_making_costs.map(cost => {
          // If we have populated data from price_making_id, use it
          if (cost.price_making_id && typeof cost.price_making_id === 'object') {
            return {
              ...cost,
              stage_name: cost.price_making_id.stage_name || cost.stage_name || "",
              sub_stage_name: cost.price_making_id.sub_stage_name || cost.sub_stage_name || "",
              cost_type: cost.price_making_id.cost_type || cost.cost_type || "",
              unit_name: cost.price_making_id.unit_name || cost.unit_name || "",
              cost_amount: cost.cost_amount || cost.price_making_id.cost_amount || 0
            };
          }
          return cost;
        });
      }
      
      return productObj;
    });

    return res.json({
      success: true,
      products: transformedProducts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalProducts / parseInt(limit)),
        totalProducts,
        limit: parseInt(limit),
      },
    });
  } catch (err) {
    console.error("Error in getProducts:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};










export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id, "Product ID to fetch");
    const product = await Product.findById(id).populate("category_id subcategory_id purity_id branch_id");
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    return res.json({ success: true, product });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id, "Product ID to delete");
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    return res.json({ success: true, message: "Product deleted successfully" });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};
export const getProductImages = async (req, res) => {
  try {
    const { productId } = req.params;
    console.log(productId, "Product ID to fetch images");
    const images = await ProductImage.find({ product_id: productId });
    return res.json({ success: true, images });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};
export const deleteProductImage = async (req, res) => {
  try {
    const { imageId } = req.params;
    console.log(imageId, "Image ID to delete");
    const image = await ProductImage.findByIdAndDelete(imageId);
    if (!image) {
      return res
        .status(404)
        .json({ success: false, message: "Image not found" });
    }
    return res.json({ success: true, message: "Image deleted successfully" });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};

// export const unitCreate = async (req, res) => {
//   try {
//     let { name } = req.body;
//     let a = await Unit.create({ name });
//     console.log(name, "unit name");

//     console.log(a, "create unit");

//     return res
//       .status(200)
//       .json({ success: true, message: "Unit created successfully", data: a });
//   } catch (err) {
//     console.error(err);
//     return res
//       .status(500)
//       .json({ success: false, message: "Server error", error: err.message });
//   }
// };

export const getUnits = async (req, res) => {
  try {
    let a = await Unit.find();
    return res
      .status(200)
      .json({ success: true, message: "Units fetched successfully", data: a });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};

export const unitUpdate = async (req, res) => {
  try {
    let id = req.params.id;
    let a = await Unit.findByIdAndUpdate(id, req.body, { new: true });
    return res
      .status(200)
      .json({ success: true, message: "Unit updated successfully", data: a });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};

export const unitDelete = async (req, res) => {
  try {
    let id = req.params.id;
    let a = await Unit.findByIdAndDelete(id);
    return res
      .status(200)
      .json({ success: true, message: "Unit deleted successfully", data: a });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};

const calculateGSTAmounts = (amount, gst_total) => {
  const total = Number(gst_total);
  const amt = Number(amount);

  const cgst = total / 2;
  const sgst = total / 2;
  const igst = total;

  const cgstAmount = (amt * cgst) / 100;
  const sgstAmount = (amt * sgst) / 100;
  const igstAmount = (amt * igst) / 100;

  return {
    base_amount: amt,
    gst_percentage: total,

    cgst_percentage: cgst,
    sgst_percentage: sgst,
    igst_percentage: igst,

    cgst_amount: cgstAmount,
    sgst_amount: sgstAmount,
    igst_amount: igstAmount,

    final_intra_state: amt + cgstAmount + sgstAmount,
    final_inter_state: amt + igstAmount,
  };
};

const extractPercentage = (rateString) => {
  if (!rateString) return 0;
  return parseFloat(rateString) || 0;
};



export const bulkUpdateProductStatus = async (req, res) => {
  try {
    const { productIds, status } = req.body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide product IDs array",
      });
    }

    if (!status || !["active", "inactive","discontinued",'out_of_stock',"draft"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid status (active/inactive/discontinued/out_of_stock/draft)",
      });
    }

    const result = await Product.updateMany(
      { _id: { $in: productIds } },
      { $set: { status: status } }
    );

    return res.json({
      success: true,
      message: `${result.modifiedCount} products updated to ${status}`,
      modifiedCount: result.modifiedCount,
    });
  } catch (err) {
    console.error("Error in bulk status update:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};

// export const toggleProductStatus = async (req, res) => {
//   try {
//     const { id } = req.params;
//     console.log(id,"id")

//     const product = await Product.findById(id);
//     console.log(product,"product")

//     if (!product) {
//       return res.status(404).json({ success: false, message: "Product not found"});
//     }

//      const newStatus =
//       product.status === "active" ? "draft" :
//       product.status === "inactive" ? "draft" :
//       product.status === "draft" ? "out_of_stock" :
//       product.status === "out_of_stock" ? "discontinued" :
//       product.status === "discontinued" ? "active" :
//       "active"; // Default

//     console.log(newStatus, "newStatus");

//     const updatedProduct = await Product.findByIdAndUpdate(id,{ status: newStatus },{ new: true });

//     return res.json({ success: true, message: `Product status changed to ${newStatus}`, product: updatedProduct});

//   } catch (err) {
//     console.error("Error toggling product status:", err);
//     return res.status(500).json({success: false,message: "Server error",error: err.message});
//   }
// };


export const updateProductStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    let newStatus;
    console.log(newStatus, "newStatus");

    if (status) {
      const validStatuses = [
        "draft",
        "active",
        "inactive",
        "out_of_stock",
        "discontinued",
      ];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${validStatuses.join(", "
            )}`,
          });
      }
      newStatus = status;
    } else {
      switch (product.status) {
        case "active":
          newStatus = "draft";
          break;
        case "inactive":
          newStatus = "draft";
          break;
        case "draft":
          newStatus = "out_of_stock";
          break;
        case "out_of_stock":
          newStatus = "discontinued";
          break;
        case "discontinued":
          newStatus = "active";
          break;
        default:
          newStatus = "active";
      }
    }

    console.log(`Status changed from ${product.status} to ${newStatus}`);

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { status: newStatus },
      { new: true }
    );

    return res.json({ success: true, message: `Product status changed to ${newStatus}`, product: updatedProduct,
    });
  } catch (err) {
    console.error("Error updating product status:", err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};





export const unitCreate = async (req, res) => {
  try {
    const { name, code, base_unit_id, conversion_factor, is_active } = req.body;

    const unit = await Unit.create({
      name,
      code,
      base_unit_id,
      conversion_factor,
      is_active,
    });

    return res.status(200).json({
      success: true,
      message: "Unit created successfully",
      data: unit,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};








export const createProduct = async (req, res) => {
  try {
    let {
      product_name,
      product_code,
      hallmark_id,
      product_brand, 
      product_category, 
      product_subcategory,
      markup_percentage,
      gst_rate,
      cgst_rate,
      sgst_rate,
      igst_rate,
      utgst_rate,
      metals, 
      stones,
      materials,
      price_making_costs 
    } = req.body;
    
    console.log("req.files:", req.files);
    console.log("req.body:", req.body);

    let finalProductCode = product_code;
    if (!finalProductCode || finalProductCode.trim() === "") {
      finalProductCode = await generateProductCode();
    }

    const metalsData = typeof metals === "string" ? JSON.parse(metals) : metals || [];
    const stonesData = typeof stones === "string" ? JSON.parse(stones) : stones || [];
    const materialsData = typeof materials === "string" ? JSON.parse(materials) : materials || [];
    const priceMakingCostsData = typeof price_making_costs === "string" ? JSON.parse(price_making_costs) : price_making_costs || [];

    let brandName = "";
    if (product_brand && mongoose.Types.ObjectId.isValid(product_brand)) {
      const brandDoc = await Brand.findById(product_brand);
      brandName = brandDoc?.brand_name || brandDoc?.name || "";
    }

    let categoryName = "";
    if (product_category && mongoose.Types.ObjectId.isValid(product_category)) {
      const categoryDoc = await Category.findById(product_category);
      categoryName = categoryDoc?.category_name || categoryDoc?.name || "";
    }

    let subcategoryName = "";
    if (product_subcategory && mongoose.Types.ObjectId.isValid(product_subcategory)) {
      const subcategoryDoc = await Subcategory.findById(product_subcategory);
      subcategoryName = subcategoryDoc?.sub_category_name || subcategoryDoc?.name || "";
    }

    // Metals calculation with hallmark
    const calculatedMetals = await Promise.all(
      metalsData.map(async (metal) => {
        const metalDoc = await Metal.findById(metal.metal_type);
        const purityDoc = await Purity.findById(metal.purity);
        
        // Fetch hallmark details if hallmark_id is provided
        let hallmarkData = null;
        if (metal.hallmark_id && mongoose.Types.ObjectId.isValid(metal.hallmark_id)) {
          try {
            const hallmarkDoc = await Hallmark.findById(metal.hallmark_id);
            if (hallmarkDoc) {
              hallmarkData = {
                hallmark_id: hallmarkDoc._id,
                name: hallmarkDoc.name,
                metal_type: hallmarkDoc.metal_type,
                metal_type_name: hallmarkDoc.metal_type_name,
                description: hallmarkDoc.description,
                image: hallmarkDoc.image
              };
            }
          } catch (err) {
            console.error("Error fetching hallmark:", err);
          }
        }

        const subtotal = calculateMetalSubtotal(metal);

        return {
          metal_id: metal.metal_type,
          metal_type: metalDoc?.metal_name || metalDoc?.name || "",
          purity_id: metal.purity,
          purity: purityDoc?.purity_name || purityDoc?.name || "",
          weight: parseFloat(metal.weight) || 0,
          unit: metal.unit || "g",
          rate_per_gram: parseFloat(metal.rate_per_gram) || 0,
          making_charge_type: metal.making_charge_type || "Fixed",
          making_charge_value: parseFloat(metal.making_charge_value) || 0,
          // Hallmark related fields
          hallmark_id: metal.hallmark_id || null,
          hallmark: hallmarkData,
          subtotal,
        };
      })
    );

    // Stones calculation
    const calculatedStones = await Promise.all(
      stonesData.map(async (stone) => {
        let stoneId = stone.stone_type || null;
        let stoneName = "";
        let stonePurityId = stone.stone_purity || null;
        let stonePurityName = "";
        
        if (stoneId && mongoose.Types.ObjectId.isValid(stoneId)) {
          try {
            const stoneDoc = await StoneType.findById(stoneId);
            if (stoneDoc) {
              stoneName = stoneDoc.stone_type || stoneDoc.name || "";
            }
          } catch(err) {
            console.error("Error fetching stone type:", err);
          }
        }
        
        if (stonePurityId && mongoose.Types.ObjectId.isValid(stonePurityId)) {
          try {
            const purityDoc = await stonePurityModel.findById(stonePurityId);
            if (purityDoc) {
              stonePurityName = purityDoc.stone_purity || purityDoc.purity_name || purityDoc.name || "";
            }
          } catch (err) {
            console.error("Error fetching stone purity:", err);
          }
        }

        const subtotal = calculateStoneSubtotal(stone);
        
        return {
          stone_id: stoneId, 
          stone_type: stoneName,
          stone_purity: stonePurityName,
          stone_purity_id: stonePurityId,
          size: parseFloat(stone.size) || 0,
          quantity: parseInt(stone.quantity) || 0,
          weight: parseFloat(stone.weight) || 0,
          price_per_carat: parseFloat(stone.price_per_carat) || 0,
          subtotal,
        };
      })
    );

    // Materials calculation
    const calculatedMaterials = await Promise.all(
      materialsData.map(async (material) => {
        let wastageId = material.wastage_type || null;
        let wastageName = "";
        let materialId = material.material_type || null;
        let materialName = "";

        if (material.wastage_type && mongoose.Types.ObjectId.isValid(material.wastage_type)) {
          wastageId = material.wastage_type;
          try {
            const wastageDoc = await Wastage.findById(wastageId);
            if (wastageDoc) {
              wastageName = wastageDoc.wastage_type || "";
            }
          } catch (err) {
            console.error("Error fetching wastage:", err);
          }
        } else {
          wastageName = material.wastage_type;
          try {
            const wastageDoc = await Wastage.findOne({ wastage_type: material.wastage_type });
            if (wastageDoc) {
              wastageId = wastageDoc._id;
            }
          } catch (err) {
            console.error("Error finding wastage by name:", err);
          }
        }

        if (material.material_type && mongoose.Types.ObjectId.isValid(material.material_type)) {
          materialId = material.material_type;
          try {
            const materialDoc = await MaterialTypes.findById(materialId);
            if (materialDoc) {
              materialName = materialDoc.material_type || "";
            }
          } catch (err) {
            console.error("Error fetching material type:", err);
          }
        } else {
          materialName = material.material_type;
          try {
            const materialDoc = await MaterialTypes.findOne({ material_type: material.material_type });
            if (materialDoc) {
              materialId = materialDoc._id;
            }
          } catch (err) {
            console.error("Error finding material by name:", err);
          }
        }

        const weight = parseFloat(material.weight) || 0;
        const rate = parseFloat(material.rate_per_unit) || 0;
        const cost = weight * rate;

        const result = {
          wastage_type: wastageName,
          material_type: materialName,
          weight,
          unit: material.unit || "g",
          rate_per_unit: rate,
          cost,
        };

        if (wastageId && mongoose.Types.ObjectId.isValid(wastageId)) {
          result.wastage_id = wastageId;
        }
       
        if (materialId && mongoose.Types.ObjectId.isValid(materialId)) {
          result.material_id = materialId;
        }

        return result;
      })
    );
// Price Making Costs calculation - DEBUG VERSION
const calculatedPriceMakingCosts = await Promise.all(
  priceMakingCostsData.map(async (costItem, index) => {
    try {
      console.log(`\n=== Processing Price Making Cost ${index + 1} ===`);
      console.log("Input costItem:", JSON.stringify(costItem, null, 2));
      
      let priceMakingDetails = null;
      
      // Try to find by ID first
      if (costItem.price_making_id && mongoose.Types.ObjectId.isValid(costItem.price_making_id)) {
        console.log(`Looking for price_making_id: ${costItem.price_making_id}`);
        priceMakingDetails = await PriceMaking.findById(costItem.price_making_id);
        console.log("Found by ID:", priceMakingDetails);
      } 
      // If no ID or not found by ID, search by cost_type
      else if (costItem.cost_type) {
        console.log(`Looking for cost_type: "${costItem.cost_type}"`);
        
        // Check what's in the database
        const allCostTypes = await PriceMaking.find({}, 'cost_type stage_name sub_stage_name unit_name');
        console.log("All cost types in DB:", allCostTypes);
        
        // Try exact match
        priceMakingDetails = await PriceMaking.findOne({ 
          cost_type: costItem.cost_type,
          is_active: true
        });
        
        console.log("Found by cost_type (exact):", priceMakingDetails);
        
        // If not found, try case-insensitive search
        if (!priceMakingDetails) {
          const regex = new RegExp(`^${costItem.cost_type}$`, 'i');
          priceMakingDetails = await PriceMaking.findOne({ 
            cost_type: { $regex: regex },
            is_active: true
          });
          console.log("Found by cost_type (case-insensitive):", priceMakingDetails);
        }
      }
      
      // If still not found, create a basic entry from the input data
      if (!priceMakingDetails) {
        console.log("No matching record found in database");
        return {
          stage_name: costItem.stage_name || "",
          sub_stage_name: costItem.sub_stage_name || "",
          cost_type: costItem.cost_type || "",
          unit_name: costItem.unit_name || "",
          cost_amount: parseFloat(costItem.cost_amount) || 0,
          is_active: true,
          source: "manual_input"
        };
      }
      
      console.log("Database record found:", {
        stage_name: priceMakingDetails.stage_name,
        sub_stage_name: priceMakingDetails.sub_stage_name,
        cost_type: priceMakingDetails.cost_type,
        unit_name: priceMakingDetails.unit_name,
        cost_amount: priceMakingDetails.cost_amount
      });
      
      // Return with details from database
      return {
        price_making_id: priceMakingDetails._id,
        stage_name: priceMakingDetails.stage_name || "",
        sub_stage_name: priceMakingDetails.sub_stage_name || "",
        cost_type: priceMakingDetails.cost_type || "",
        unit_name: priceMakingDetails.unit_name || "",
        cost_amount: parseFloat(costItem.cost_amount) || parseFloat(priceMakingDetails.cost_amount) || 0,
        is_active: priceMakingDetails.is_active !== false,
        source: "database"
      };
    } catch (err) {
      console.error("Error processing price making cost:", err);
      return {
        stage_name: costItem.stage_name || "",
        sub_stage_name: costItem.sub_stage_name || "",
        cost_type: costItem.cost_type || "",
        unit_name: costItem.unit_name || "",
        cost_amount: parseFloat(costItem.cost_amount) || 0,
        is_active: true,
        source: "error_fallback"
      };
    }
  })
);

console.log("\n=== FINAL CALCULATED PRICE MAKING COSTS ===");
console.log(JSON.stringify(calculatedPriceMakingCosts, null, 2));
    // CALCULATE TOTALS
    const total_metals_cost = calculatedMetals.reduce((sum, metal) => sum + (metal.subtotal || 0), 0);
    const total_stones_cost = calculatedStones.reduce((sum, stone) => sum + (stone.subtotal || 0), 0);
    const total_materials_cost = calculatedMaterials.reduce((sum, material) => sum + (material.cost || 0), 0);
    const total_price_making_costs = calculatedPriceMakingCosts.reduce((sum, cost) => sum + (cost.cost_amount || 0), 0);

    const base_total = total_metals_cost + total_stones_cost + total_materials_cost;
    const grand_total = base_total + total_price_making_costs;
    
    console.log("Base Total (metals+stones+materials):", base_total);
    console.log("Price Making Costs Total:", total_price_making_costs);
    console.log("Grand Total (with price making):", grand_total);

    const markup = parseFloat(markup_percentage) || 0;
    const selling_price_before_tax = grand_total * (1 + markup / 100);

    const gstRateValueNum = extractPercentage(gst_rate);
    const cgstRateValueNum = extractPercentage(cgst_rate);
    const sgstRateValueNum = extractPercentage(sgst_rate);
    const igstRateValueNum = extractPercentage(igst_rate);
    const utgstRateValueNum = extractPercentage(utgst_rate);

    const gst_amount = (selling_price_before_tax * gstRateValueNum) / 100;
    const cgst_amount = (selling_price_before_tax * cgstRateValueNum) / 100;
    const sgst_amount = (selling_price_before_tax * sgstRateValueNum) / 100;
    const igst_amount = (selling_price_before_tax * igstRateValueNum) / 100;
    const utgst_amount = (selling_price_before_tax * utgstRateValueNum) / 100;

    const selling_price_with_gst = selling_price_before_tax + cgst_amount + sgst_amount + igst_amount + utgst_amount;
    
    console.log("Selling Price with GST:", selling_price_with_gst);

    // Handle images
    let imagePaths = [];
    if (req.files && req.files.length > 0) {
      imagePaths = req.files.map(f => `/uploads/products/images/${f.filename}`);
    } else if (req.file) {
      imagePaths = [`/uploads/products/${req.file.filename}`];
    }
    console.log("Image Paths:", imagePaths);

    // Create product
    const product = await Product.create({
      product_name,
      product_code: finalProductCode,
      // hallmark_id: hallmark_id || null,
      product_brand_id: product_brand,
      product_category_id: product_category,
      product_subcategory_id: product_subcategory,

      product_brand: brandName,
      product_category: categoryName,
      product_subcategory: subcategoryName,

      markup_percentage: markup,

      gst_rate: gst_rate,
      cgst_rate: cgst_rate,
      sgst_rate: sgst_rate,
      igst_rate: igst_rate,
      utgst_rate: utgst_rate,

      metals: calculatedMetals,
      stones: calculatedStones,
      materials: calculatedMaterials,
      price_making_costs: calculatedPriceMakingCosts, // नया field

      total_metals_cost,
      total_stones_cost,
      total_materials_cost,
      total_price_making_costs, // नया field
      base_total, // नया field
      grand_total,

      gst_amount,
      cgst_amount,
      sgst_amount,
      igst_amount,
      utgst_amount,

      selling_price_before_tax,
      selling_price_with_gst,

      images: imagePaths,
      status: "active",
    });

    // Populate and return
    const populatedProduct = await Product.findById(product._id)
      .populate("product_brand_id", "brand_name name")
      .populate("product_category_id", "category_name name")
      .populate("product_subcategory_id", "sub_category_name name")
      .populate("metals.metal_id", "metal_name name")
      .populate("metals.purity_id", "purity_name")
      .populate("metals.making_charge_id", "cost_type cost_name")
      .populate("metals.hallmark_id", "name metal_type metal_type_name description image")
      .populate("stones.stone_id", "stone_type name")
      .populate("materials.wastage_id", "wastage_type")
      .populate("materials.material_id", "material_type");
    
    console.log("Product created successfully:", populatedProduct._id);

    return res.status(200).json({ 
      success: true,  
      message: "Product created successfully",  
      data: populatedProduct,
    });
  } catch (err) {
    console.error("Error creating product:", err);
    return res.status(500).json({   
      success: false,   
      message: err.message || "Internal server error", 
    });
  }
};



export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    let updateFields = req.body;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid product id" });
    }

    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Handle images
    if (req.files?.images) {
      updateFields.images = req.files.images.map(f => `/uploads/products/images/${f.filename}`);
    }

    // Parse JSON fields
    const jsonFields = ["metals", "stones", "materials", "price_making_costs"];
    jsonFields.forEach(field => {
      if (updateFields[field] && typeof updateFields[field] === "string") {
        try {
          updateFields[field] = JSON.parse(updateFields[field]);
        } catch (err) {
          console.error(`Error parsing ${field}:`, err);
        }
      }
    });

    // Recalculate totals if needed
    const shouldRecalculate =
      updateFields.metals ||
      updateFields.stones ||
      updateFields.materials ||
      updateFields.price_making_costs ||
      updateFields.markup_percentage ||
      updateFields.gst_rate;

    if (shouldRecalculate) {
      const metalsData = updateFields.metals || existingProduct.metals;
      const stonesData = updateFields.stones || existingProduct.stones;
      const materialsData = updateFields.materials || existingProduct.materials;
      const priceMakingCostsData = updateFields.price_making_costs || existingProduct.price_making_costs;
      const markup = updateFields.markup_percentage || existingProduct.markup_percentage;

      // ✅ Use same calculation logic as createProduct (simplified here)
      const total_metals_cost = Array.isArray(metalsData)
        ? metalsData.reduce((sum, m) => sum + (m.subtotal || 0), 0)
        : existingProduct.total_metals_cost;

      const total_stones_cost = Array.isArray(stonesData)
        ? stonesData.reduce((sum, s) => sum + (s.subtotal || 0), 0)
        : existingProduct.total_stones_cost;

      const total_materials_cost = Array.isArray(materialsData)
        ? materialsData.reduce((sum, mat) => sum + (mat.cost || 0), 0)
        : existingProduct.total_materials_cost;

      const total_price_making_costs = Array.isArray(priceMakingCostsData)
        ? priceMakingCostsData.reduce((sum, c) => sum + (c.cost_amount || 0), 0)
        : existingProduct.total_price_making_costs;

      const base_total = total_metals_cost + total_stones_cost + total_materials_cost;
      const grand_total = base_total + total_price_making_costs;
      const selling_price_before_tax = grand_total * (1 + (markup || 0) / 100);

      updateFields.total_metals_cost = total_metals_cost;
      updateFields.total_stones_cost = total_stones_cost;
      updateFields.total_materials_cost = total_materials_cost;
      updateFields.total_price_making_costs = total_price_making_costs;
      updateFields.base_total = base_total;
      updateFields.grand_total = grand_total;
      updateFields.selling_price_before_tax = selling_price_before_tax;

      // ✅ GST calculation with updated gst_rate if provided
      const gstRateValueNum = extractPercentage(updateFields.gst_rate || existingProduct.gst_rate);
      updateFields.gst_amount = (selling_price_before_tax * gstRateValueNum) / 100;
      updateFields.selling_price_with_gst = selling_price_before_tax + updateFields.gst_amount;
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updateFields, { new: true, runValidators: true })
      .populate("product_brand_id", "brand_name name")
      .populate("product_category_id", "category_name name")
      .populate("product_subcategory_id", "sub_category_name name")
      .populate("metals.metal_id", "metal_name name")
      .populate("metals.purity_id", "purity_name")
      .populate("metals.hallmark_id", "name metal_type metal_type_name description image")
      .populate("stones.stone_id", "stone_type name")
      .populate("materials.wastage_id", "wastage_type")
      .populate("materials.material_id", "material_type")
      .populate({
        path: "price_making_costs.price_making_id",
        select: "stage_name sub_stage_name cost_type unit_name",
        model: "PriceMaking"
      });

    return res.status(200).json({ success: true, message: "Product updated successfully", data: updatedProduct });
  } catch (err) {
    console.error("Update product error:", err);
    return res.status(500).json({ success: false, message: err.message || "Internal server error" });
  }
};







// export const getProducts = async (req, res) => {
//   try {
//     const { status, search, page = 1, limit = 10 } = req.query;

//     // Build filter object
//     const filter = {};

//     // Status filter
//     if (status && (status === "active" || status === "inactive")) {
//       filter.status = status;
//     }

//     // Search filter (product name or code)
//     if (search) {
//       filter.$or = [
//         { product_name: { $regex: search, $options: "i" } },
//         { product_code: { $regex: search, $options: "i" } },
//       ];
//     }

//     // Calculate pagination
//     const skip = (parseInt(page) - 1) * parseInt(limit);

//     // Fetch products with filters and pagination
//     const [products, totalProducts] = await Promise.all([
//       Product.find(filter)
//         .populate("product_brand_id", "brand_name")
//         .populate("product_category_id", "category_name")
//         .populate("product_subcategory_id", "sub_category_name")
//         .populate({
//           path: "metals.metal_id",
//           select: "metal_name name"
//         })
//         .populate({
//           path: "metals.purity_id",
//           select: "purity_name name"
//         })
//         .populate({
//           path: "metals.hallmark_id",
//           select: "name metal_type metal_type_name description image"
//         })
//         // Stones populate
//         .populate({
//           path: "stones.stone_id",
//           select: "stone_type name"
//         })
//         .populate({
//           path: "stones.stone_purity_id",
//           select: "stone_purity purity_name name"
//         })
//         // Materials populate
//         .populate({
//           path: "materials.wastage_id",
//           select: "wastage_type"
//         })
//         .populate({
//           path: "materials.material_id",
//           select: "material_type"
//         })
//         .sort({ createdAt: -1 })
//         .skip(skip)
//         .limit(parseInt(limit)),
//       Product.countDocuments(filter),
//     ]);

//     console.log("Products fetched:", products.length);

//     return res.json({
//       success: true,
//       products,
//       pagination: {
//         currentPage: parseInt(page),
//         totalPages: Math.ceil(totalProducts / parseInt(limit)),
//         totalProducts,
//         limit: parseInt(limit),
//       },
//     });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: err.message,
//     });
//   }
// };