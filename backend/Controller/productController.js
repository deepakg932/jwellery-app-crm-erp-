import Product from "../Models/models/ProductModel.js";
import ProductImage from "../Models/models/ProductImage.js";
import Unit from "../Models/models/unitModel.js";
import GstRate from "../Models/models/GstRate.js";
import MaterialTypes from "../Models/models/MaterialTypes.js";
import stonePurityModel from "../Models/models/stonePurityModel.js";
import PriceMaking from "../Models/models/PricemakingModel.js";
// import Metal from "../Models/models/MetalTypeModel.js"

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
import {
  calculateMetalSubtotal,
  calculateStoneSubtotal,
  generateProductCode,
  calculateMaterialCost,
} from "../helper/generateProductCode.js";

import { round3 } from "../utils/round3.js";
import SalesOrder from "../Models/models/SalesOrder.js";
import PurchaseOrder from "../Models/models/PurchaseOrder.js";
import GoldRate from "../Models/models/GoldRate.js";

// export const getProducts = async (req, res) => {
//   try {
//     const {
//       status,
//       search,
//       page = 1,
//       limit = 10,
//       brand_id,
//       category_id,
//       subcategory_id,
//       min_price,
//       max_price
//     } = req.query;

//     // Build filter object
//     const filter = {};
//     const BASE_URL = process.env.APP_URL;

//     // Status filter
//     if (status && (status === "active" || status === "inactive" || status === "draft" || status === "out_of_stock" || status === "discontinued")) {
//       filter.status = status;
//     }

//     // Search filter (product name or code)
//     if (search) {
//       filter.$or = [
//         { product_name: { $regex: search, $options: "i" } },
//         { article_no: { $regex: search, $options: "i" } },
//         { product_brand: { $regex: search, $options: "i" } },
//         { product_category: { $regex: search, $options: "i" } },
//         { product_subcategory: { $regex: search, $options: "i" } }
//       ];
//     }

//     // Brand filter
//     if (brand_id && mongoose.Types.ObjectId.isValid(brand_id)) {
//       filter.product_brand_id = brand_id;
//     }

//     // Category filter
//     if (category_id && mongoose.Types.ObjectId.isValid(category_id)) {
//       filter.product_category_id = category_id;
//     }

//     // Subcategory filter
//     if (subcategory_id && mongoose.Types.ObjectId.isValid(subcategory_id)) {
//       filter.product_subcategory_id = subcategory_id;
//     }

//     // Price range filter
//     if (min_price || max_price) {
//       filter.selling_price_with_gst = {};
//       if (min_price) {
//         filter.selling_price_with_gst.$gte = parseFloat(min_price);
//       }
//       if (max_price) {
//         filter.selling_price_with_gst.$lte = parseFloat(max_price);
//       }
//     }

//     // Calculate pagination
//     const skip = (parseInt(page) - 1) * parseInt(limit);

//     // Fetch products with filters and pagination
//     const [products, totalProducts] = await Promise.all([
//       Product.find(filter)
//         // Brand, Category, Subcategory
//         .populate("product_brand_id", "brand_name name")
//         .populate("product_category_id", "category_name name")
//         .populate("product_subcategory_id", "sub_category_name name")

//         // Hallmark
//         .populate("hallmark_id", "name metal_type metal_type_name description image")

//         // Metals and related
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
//         .populate({
//           path: "metals.making_charge_id",
//           select: "cost_name cost_type"
//         })

//         // Stones
//         .populate({
//           path: "stones.stone_id",
//           select: "stone_type name"
//         })
//         .populate({
//           path: "stones.stone_purity_id",
//           select: "stone_purity purity_name name"
//         })

//         // Materials
//         .populate({
//           path: "materials.wastage_id",
//           select: "wastage_type"
//         })
//         .populate({
//           path: "materials.material_id",
//           select: "material_type"
//         })

//         .populate({
//           path: "price_making_costs.price_making_id",
//           select: "stage_name sub_stage_name cost_type unit_name cost_amount is_active",
//           model: "PriceMaking"
//         })

//         .sort({ createdAt: -1 })
//         .skip(skip)
//         .limit(parseInt(limit)),

//       Product.countDocuments(filter),
//     ]);

//     console.log("Products fetched:", products.length);

//     // const transformedProducts = products.map(product => {
//     //   const productObj = product.toObject();

//     //   if (productObj.price_making_costs && Array.isArray(productObj.price_making_costs)) {
//     //     productObj.price_making_costs = productObj.price_making_costs.map(cost => {
//     //       // If we have populated data from price_making_id, use it
//     //       if (cost.price_making_id && typeof cost.price_making_id === 'object') {
//     //         return {
//     //           ...cost,
//     //           stage_name: cost.price_making_id.stage_name || cost.stage_name || "",
//     //           sub_stage_name: cost.price_making_id.sub_stage_name || cost.sub_stage_name || "",
//     //           cost_type: cost.price_making_id.cost_type || cost.cost_type || "",
//     //           unit_name: cost.price_making_id.unit_name || cost.unit_name || "",
//     //           cost_amount: cost.cost_amount || cost.price_making_id.cost_amount || 0
//     //         };
//     //       }
//     //       return cost;
//     //     });
//     //   }

//     //   return productObj;
//     // });

// const transformedProducts = products.map(product => {
//   const productObj = product.toObject();

//   // ✅ ADD FULL IMAGE URLS
//   productObj.fullImageUrls = productObj.image
//     ? productObj.image.map(img => `${BASE_URL}${img}`)
//     : [];

//   // Existing logic (unchanged)
//   if (productObj.price_making_costs && Array.isArray(productObj.price_making_costs)) {
//     productObj.price_making_costs = productObj.price_making_costs.map(cost => {
//       if (cost.price_making_id && typeof cost.price_making_id === "object") {
//         return {
//           ...cost,
//           stage_name: cost.price_making_id.stage_name || cost.stage_name || "",
//           sub_stage_name: cost.price_making_id.sub_stage_name || cost.sub_stage_name || "",
//           cost_type: cost.price_making_id.cost_type || cost.cost_type || "",
//           unit_name: cost.price_making_id.unit_name || cost.unit_name || "",
//           cost_amount: cost.cost_amount || cost.price_making_id.cost_amount || 0,
//         };
//       }
//       return cost;
//     });
//   }

//   return productObj;
// });

//     return res.json({
//       success: true,
//       products: transformedProducts,
//       pagination: {
//         currentPage: parseInt(page),
//         totalPages: Math.ceil(totalProducts / parseInt(limit)),
//         totalProducts,
//         limit: parseInt(limit),
//       },
//     });
//   } catch (err) {
//     console.error("Error in getProducts:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: err.message,
//     });
//   }
// };

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id, "Product ID to fetch");
    const product = await Product.findById(id).populate(
      "category_id subcategory_id purity_id branch_id",
    );
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    return res.json({ success: true, product });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
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

    if (
      !status ||
      !["active", "inactive", "discontinued", "out_of_stock", "draft"].includes(
        status,
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide valid status (active/inactive/discontinued/out_of_stock/draft)",
      });
    }

    const result = await Product.updateMany(
      { _id: { $in: productIds } },
      { $set: { status: status } },
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
        return res.status(400).json({
          success: false,
          message: `Invalid status. Must be one of: ${validStatuses.join(
            ", ",
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
      { new: true },
    );

    return res.json({
      success: true,
      message: `Product status changed to ${newStatus}`,
      product: updatedProduct,
    });
  } catch (err) {
    console.error("Error updating product status:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
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
      article_no,
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
      price_making_costs,
    } = req.body;

    console.log("req.files:", req.files);
    console.log("req.body:", req.body);

    let finalProductCode = article_no;
    if (!finalProductCode || finalProductCode.trim() === "") {
      finalProductCode = await generateProductCode();
    }

    const metalsData =
      typeof metals === "string" ? JSON.parse(metals) : metals || [];
    const stonesData =
      typeof stones === "string" ? JSON.parse(stones) : stones || [];
    const materialsData =
      typeof materials === "string" ? JSON.parse(materials) : materials || [];
    const priceMakingCostsData =
      typeof price_making_costs === "string"
        ? JSON.parse(price_making_costs)
        : price_making_costs || [];

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
    if (
      product_subcategory &&
      mongoose.Types.ObjectId.isValid(product_subcategory)
    ) {
      const subcategoryDoc = await Subcategory.findById(product_subcategory);
      subcategoryName =
        subcategoryDoc?.sub_category_name || subcategoryDoc?.name || "";
    }

    // Metals calculation with hallmark
    const calculatedMetals = await Promise.all(
      metalsData.map(async (metal) => {
        const metalDoc = await Metal.findById(metal.metal_type);
        const purityDoc = await Purity.findById(metal.purity);

        // Fetch hallmark details if hallmark_id is provided
        let hallmarkData = null;
        if (
          metal.hallmark_id &&
          mongoose.Types.ObjectId.isValid(metal.hallmark_id)
        ) {
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
                  ? `${process.env.APP_URL}${hallmarkDoc.image}`
                  : null,
                // image: hallmarkDoc.image
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
      }),
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
          } catch (err) {
            console.error("Error fetching stone type:", err);
          }
        }

        if (stonePurityId && mongoose.Types.ObjectId.isValid(stonePurityId)) {
          try {
            const purityDoc = await stonePurityModel.findById(stonePurityId);
            if (purityDoc) {
              stonePurityName =
                purityDoc.stone_purity ||
                purityDoc.purity_name ||
                purityDoc.name ||
                "";
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
      }),
    );

    // Materials calculation
    // Materials calculation (FIXED VERSION)
    const calculatedMaterials = await Promise.all(
      materialsData.map(async (material) => {
        let wastageId = null;
        let wastageName = "";
        let materialId = null;
        let materialName = "";

        // ------------------ WASTAGE ------------------
        if (
          material.wastage_type &&
          mongoose.Types.ObjectId.isValid(material.wastage_type)
        ) {
          const wastageDoc = await Wastage.findById(material.wastage_type);
          if (wastageDoc) {
            wastageId = wastageDoc._id;
            wastageName = wastageDoc.wastage_type;
          }
        } else if (material.wastage_type) {
          const wastageDoc = await Wastage.findOne({
            wastage_type: {
              $regex: new RegExp(`^${material.wastage_type}$`, "i"),
            },
          });
          if (wastageDoc) {
            wastageId = wastageDoc._id;
            wastageName = wastageDoc.wastage_type;
          } else {
            wastageName = material.wastage_type; // fallback
          }
        }

        // ------------------ MATERIAL TYPE (MAIN FIX) ------------------
        if (
          material.material_type &&
          mongoose.Types.ObjectId.isValid(material.material_type)
        ) {
          const materialDoc = await MaterialTypes.findById(
            material.material_type,
          );
          if (materialDoc) {
            materialId = materialDoc._id;
            materialName = materialDoc.material_type;
          }
        } else if (material.material_type) {
          const materialDoc = await MaterialTypes.findOne({
            material_type: {
              $regex: new RegExp(`^${material.material_type}$`, "i"),
            },
          });

          if (materialDoc) {
            materialId = materialDoc._id;
            materialName = materialDoc.material_type;
          } else {
            materialName = material.material_type; // fallback manual input
          }
        }

        // ------------------ COST CALC ------------------
        const weight = parseFloat(material.weight) || 0;
        const rate = parseFloat(material.rate_per_unit) || 0;
        const cost = weight * rate;

        // ------------------ FINAL OBJECT ------------------
        const result = {
          wastage_type: wastageName,
          material_type: materialName, // ALWAYS FILLED
          weight,
          unit: material.unit || "g",
          rate_per_unit: rate,
          cost,
        };

        if (wastageId) result.wastage_id = wastageId;
        if (materialId) result.material_id = materialId;

        return result;
      }),
    );

    // Price Making Costs calculation - DEBUG VERSION
    const calculatedPriceMakingCosts = await Promise.all(
      priceMakingCostsData.map(async (costItem, index) => {
        try {
          console.log(`\n=== Processing Price Making Cost ${index + 1} ===`);
          console.log("Input costItem:", JSON.stringify(costItem, null, 2));

          let priceMakingDetails = null;

          // Try to find by ID first
          if (
            costItem.price_making_id &&
            mongoose.Types.ObjectId.isValid(costItem.price_making_id)
          ) {
            console.log(
              `Looking for price_making_id: ${costItem.price_making_id}`,
            );
            priceMakingDetails = await PriceMaking.findById(
              costItem.price_making_id,
            );
            console.log("Found by ID:", priceMakingDetails);
          }
          // If no ID or not found by ID, search by cost_type
          else if (costItem.cost_type) {
            console.log(`Looking for cost_type: "${costItem.cost_type}"`);

            // Check what's in the database
            const allCostTypes = await PriceMaking.find(
              {},
              "cost_type stage_name sub_stage_name unit_name",
            );
            console.log("All cost types in DB:", allCostTypes);

            // Try exact match
            priceMakingDetails = await PriceMaking.findOne({
              cost_type: costItem.cost_type,
              is_active: true,
            });

            console.log("Found by cost_type (exact):", priceMakingDetails);

            // If not found, try case-insensitive search
            if (!priceMakingDetails) {
              const regex = new RegExp(`^${costItem.cost_type}$`, "i");
              priceMakingDetails = await PriceMaking.findOne({
                cost_type: { $regex: regex },
                is_active: true,
              });
              console.log(
                "Found by cost_type (case-insensitive):",
                priceMakingDetails,
              );
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
              source: "manual_input",
            };
          }

          console.log("Database record found:", {
            stage_name: priceMakingDetails.stage_name,
            sub_stage_name: priceMakingDetails.sub_stage_name,
            cost_type: priceMakingDetails.cost_type,
            unit_name: priceMakingDetails.unit_name,
            cost_amount: priceMakingDetails.cost_amount,
          });

          // Return with details from database
          return {
            price_making_id: priceMakingDetails._id,
            stage_name: priceMakingDetails.stage_name || "",
            sub_stage_name: priceMakingDetails.sub_stage_name || "",
            cost_type: priceMakingDetails.cost_type || "",
            unit_name: priceMakingDetails.unit_name || "",
            cost_amount:
              parseFloat(costItem.cost_amount) ||
              parseFloat(priceMakingDetails.cost_amount) ||
              0,
            is_active: priceMakingDetails.is_active !== false,
            source: "database",
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
            source: "error_fallback",
          };
        }
      }),
    );

    console.log("\n=== FINAL CALCULATED PRICE MAKING COSTS ===");
    console.log(JSON.stringify(calculatedPriceMakingCosts, null, 2));
    // CALCULATE TOTALS
    const total_metals_cost = calculatedMetals.reduce(
      (sum, metal) => sum + (metal.subtotal || 0),
      0,
    );
    const total_stones_cost = calculatedStones.reduce(
      (sum, stone) => sum + (stone.subtotal || 0),
      0,
    );
    const total_materials_cost = calculatedMaterials.reduce(
      (sum, material) => sum + (material.cost || 0),
      0,
    );
    const total_price_making_costs = calculatedPriceMakingCosts.reduce(
      (sum, cost) => sum + (cost.cost_amount || 0),
      0,
    );

    const base_total =
      total_metals_cost + total_stones_cost + total_materials_cost;
    const grand_total = base_total + total_price_making_costs;

    console.log("Base Total (metals+stones+materials):", base_total);
    console.log("Price Making Costs Total:", total_price_making_costs);
    console.log("Grand Total (with price making):", grand_total);

    const markup = parseFloat(markup_percentage) || 0;

    const selling_price_before_tax = round3(grand_total * (1 + markup / 100));
    // const selling_price_before_tax = grand_total * (1 + markup / 100);

    const gstRateValueNum = extractPercentage(gst_rate);
    const cgstRateValueNum = extractPercentage(cgst_rate);
    const sgstRateValueNum = extractPercentage(sgst_rate);
    const igstRateValueNum = extractPercentage(igst_rate);
    const utgstRateValueNum = extractPercentage(utgst_rate);

    // const gst_amount = (selling_price_before_tax * gstRateValueNum) / 100;
    // const cgst_amount = (selling_price_before_tax * cgstRateValueNum) / 100;
    // const sgst_amount = (selling_price_before_tax * sgstRateValueNum) / 100;
    // const igst_amount = (selling_price_before_tax * igstRateValueNum) / 100;
    // const utgst_amount = (selling_price_before_tax * utgstRateValueNum) / 100;

    // const selling_price_with_gst = selling_price_before_tax + cgst_amount + sgst_amount + igst_amount + utgst_amount;

    const cgst_amount = round3(
      (selling_price_before_tax * cgstRateValueNum) / 100,
    );

    const sgst_amount = round3(
      (selling_price_before_tax * sgstRateValueNum) / 100,
    );

    const igst_amount = round3(
      (selling_price_before_tax * igstRateValueNum) / 100,
    );

    const utgst_amount = round3(
      (selling_price_before_tax * utgstRateValueNum) / 100,
    );

    const gst_amount = round3(
      cgst_amount + sgst_amount + igst_amount + utgst_amount,
    );

    // ---- FINAL SELLING PRICE
    const selling_price_with_gst = round3(
      selling_price_before_tax + gst_amount,
    );

    console.log("Selling Price with GST:", selling_price_with_gst);

    // Handle images
    let imagePaths = [];
    if (req.files && req.files.length > 0) {
      imagePaths = req.files.map(
        (file) => `/uploads/products/${file.filename}`,
      );
    }
    console.log("Image Paths:", imagePaths);

    // Create product
    const product = await Product.create({
      product_name,
      article_no: finalProductCode,
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

      image: imagePaths,
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
      .populate(
        "metals.hallmark_id",
        "name metal_type metal_type_name description image",
      )
      .populate("stones.stone_id", "stone_type name")
      .populate("materials.wastage_id", "wastage_type")
      .populate("materials.material_id", "material_type");

    console.log("Product created successfully:", populatedProduct._id);

    const baseUrl = process.env.APP_URL;
    const productWithFullImages = {
      ...populatedProduct._doc,
      fullImageUrls: populatedProduct.image
        ? populatedProduct.image.map((img) => `${baseUrl}${img}`)
        : [],
    };
    return res.status(200).json({
      success: true,
      message: "Product created successfully",
      data: productWithFullImages,
    });
  } catch (err) {
    console.error("Error creating product:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }
};

// export const getProducts = async (req, res) => {
//   try {
//     const {
//       status,
//       search,
//       page = 1,
//       limit = 10,
//       brand_id,
//       category_id,
//       subcategory_id,
//       min_price,
//       max_price,
//     } = req.query;

//     const BASE_URL = process.env.APP_URL;

//     const filter = {};

//     // STATUS
//     if (
//       status &&
//       ["active", "inactive", "draft", "out_of_stock", "discontinued"].includes(
//         status,
//       )
//     ) {
//       filter.status = status;
//     }

//     // SEARCH
//     if (search) {
//       filter.$or = [
//         { product_name: { $regex: search, $options: "i" } },
//         { article_no: { $regex: search, $options: "i" } },
//         { product_brand: { $regex: search, $options: "i" } },
//         { product_category: { $regex: search, $options: "i" } },
//         { product_subcategory: { $regex: search, $options: "i" } },
//       ];
//     }

//     if (brand_id && mongoose.Types.ObjectId.isValid(brand_id)) {
//       filter.product_brand_id = brand_id;
//     }

//     if (category_id && mongoose.Types.ObjectId.isValid(category_id)) {
//       filter.product_category_id = category_id;
//     }

//     if (subcategory_id && mongoose.Types.ObjectId.isValid(subcategory_id)) {
//       filter.product_subcategory_id = subcategory_id;
//     }

//     // PRICE RANGE
//     if (min_price || max_price) {
//       filter.selling_price_with_gst = {};
//       if (min_price) filter.selling_price_with_gst.$gte = Number(min_price);
//       if (max_price) filter.selling_price_with_gst.$lte = Number(max_price);
//     }

//     const skip = (parseInt(page) - 1) * parseInt(limit);

//     const [products, totalProducts] = await Promise.all([
//       Product.find(filter)

//         // 🔹 BASIC POPULATES
//         .populate("product_brand_id", "brand_name name")
//         .populate("product_category_id", "category_name name")
//         .populate("product_subcategory_id", "sub_category_name name")

//         // 🔹 PRICE MAKING COST POPULATE (MAIN FIX)
//         .populate({
//           path: "price_making_costs.price_making_id",
//           model: "PriceMaking",

//           populate: [
//             {
//               path: "making_stage_id",
//               model: "MakingStage",
//               select: "stage_name name",
//             },
//             {
//               path: "making_sub_stage_id",
//               model: "MakingSubStage",
//               select: "sub_stage_name name",
//             },
//             {
//               path: "cost_type_id",
//               model: "CostMaster",
//               select: "cost_type name",
//             },
//             {
//               path: "unit_id",
//               model: "Unit",
//               select: "unit_name name",
//             },
//           ],
//         })

//         .sort({ createdAt: -1 })
//         .skip(skip)
//         .limit(parseInt(limit)),

//       Product.countDocuments(filter),
//     ]);

//     // 🔥 TRANSFORM RESPONSE
//     const transformedProducts = products.map((product) => {
//       const obj = product.toObject();

//       // image full url
//       obj.fullImageUrls = obj.image
//         ? obj.image.map((img) => `${BASE_URL}${img}`)
//         : [];

//       // 🔹 PRICE MAKING TRANSFORM
//       if (obj.price_making_costs?.length) {
//         obj.price_making_costs = obj.price_making_costs.map((cost) => {
//           const ref = cost.price_making_id;

//           return {
//             ...cost,

//             stage_name:
//               ref?.making_stage_id?.stage_name ||
//               ref?.making_stage_id?.name ||
//               cost.stage_name ||
//               "",

//             sub_stage_name:
//               ref?.making_sub_stage_id?.sub_stage_name ||
//               ref?.making_sub_stage_id?.name ||
//               cost.sub_stage_name ||
//               "",

//             cost_type:
//               ref?.cost_type_id?.cost_type ||
//               ref?.cost_type_id?.name ||
//               cost.cost_type ||
//               "",

//             unit_name:
//               ref?.unit_id?.unit_name ||
//               ref?.unit_id?.name ||
//               cost.unit_name ||
//               "",

//             cost_amount: cost.cost_amount || ref?.cost_amount || 0,
//           };
//         });
//       }

//       return obj;
//     });

//     return res.json({
//       success: true,
//       products: transformedProducts,
//       pagination: {
//         currentPage: parseInt(page),
//         totalPages: Math.ceil(totalProducts / parseInt(limit)),
//         totalProducts,
//         limit: parseInt(limit),
//       },
//     });
//   } catch (err) {
//     console.error("Error in getProducts:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: err.message,
//     });
//   }
// };

export const getDashboardStats = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments({ status: "active" });

    const saleAgg = await SalesOrder.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: null,
          totalQty: { $sum: "$items.quantity" },
        },
      },
    ]);

    const totalSoldProducts = saleAgg[0]?.totalQty || 0;

    const totalPurchaseOrders = await PurchaseOrder.countDocuments({
      status: { $in: ["approved", "received", "partially_received"] },
    });

    const latestGoldRates = await GoldRate.findOne()
      .sort({ createdAt: -1 })
      // .lean();
      .limit(4);
    return res.json({
      success: true,
      data: {
        totalProducts,
        totalSoldProducts,
        totalPurchaseOrders,
        goldRates: latestGoldRates,
        // goldRate: latestGoldRates
        //   ? latestGoldRates.rate
        //   : null,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

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
      max_price,
    } = req.query;

    const BASE_URL = process.env.APP_URL;

    const filter = {};

    // STATUS
    if (
      status &&
      ["active", "inactive", "draft", "out_of_stock", "discontinued"].includes(
        status,
      )
    ) {
      filter.status = status;
    }

    // SEARCH
    if (search) {
      filter.$or = [
        { product_name: { $regex: search, $options: "i" } },
        { article_no: { $regex: search, $options: "i" } },
        { product_brand: { $regex: search, $options: "i" } },
        { product_category: { $regex: search, $options: "i" } },
        { product_subcategory: { $regex: search, $options: "i" } },
      ];
    }

    if (brand_id && mongoose.Types.ObjectId.isValid(brand_id)) {
      filter.product_brand_id = brand_id;
    }

    if (category_id && mongoose.Types.ObjectId.isValid(category_id)) {
      filter.product_category_id = category_id;
    }

    if (subcategory_id && mongoose.Types.ObjectId.isValid(subcategory_id)) {
      filter.product_subcategory_id = subcategory_id;
    }

    if (min_price || max_price) {
      filter.selling_price_with_gst = {};
      if (min_price) filter.selling_price_with_gst.$gte = Number(min_price);
      if (max_price) filter.selling_price_with_gst.$lte = Number(max_price);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [products, totalProducts] = await Promise.all([
      Product.find(filter)

        // 🔹 BASIC
        .populate("product_brand_id", "brand_name name")
        .populate("product_category_id", "category_name name")
        .populate("product_subcategory_id", "sub_category_name name")

        // 🔹 HALLMARK
        .populate(
          "hallmark_id",
          "name metal_type metal_type_name description image",
        )

        // 🔹 METALS
        .populate("metals.metal_id", "metal_name name")
        .populate("metals.purity_id", "purity_name name")
        .populate(
          "metals.hallmark_id",
          "name metal_type metal_type_name description image",
        )
        .populate("metals.making_charge_id", "cost_name cost_type")

        // 🔹 STONES
        .populate("stones.stone_id", "stone_type name")
        .populate("stones.stone_purity_id", "stone_purity purity_name name")

        // 🔹 MATERIALS
        .populate({
          path: "materials.material_id",
          model: "MaterialTypes",
          select: "material_type name",
        })
        .populate({
          path: "materials.wastage_id",
          model: "Wastage",
          select: "wastage_type",
        })

        // 🔹 PRICE MAKING (deep)
        .populate({
          path: "price_making_costs.price_making_id",
          model: "PriceMaking",
          populate: [
            {
              path: "making_stage_id",
              model: "MakingStage",
              select: "stage_name name",
            },
            {
              path: "making_sub_stage_id",
              model: "MakingSubStage",
              select: "sub_stage_name name",
            },
            {
              path: "cost_type_id",
              model: "CostMaster",
              select: "cost_type name",
            },
            { path: "unit_id", model: "Unit", select: "unit_name name" },
          ],
        })

        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),

      Product.countDocuments(filter),
    ]);

    // 🔥 TRANSFORM RESPONSE
    const transformedProducts = products.map((product) => {
      const obj = product.toObject();

      // ✅ FULL IMAGE URL
      obj.fullImageUrls = obj.image
        ? obj.image.map((img) => `${BASE_URL}${img}`)
        : [];

      // ✅ TOP LEVEL HALLMARK
      if (obj.hallmark_id && typeof obj.hallmark_id === "object") {
        obj.hallmark_name = obj.hallmark_id.name || "";
        obj.hallmark_purity = obj.hallmark_id.metal_type_name || "";
      }

      // ✅ METALS HALLMARK NAME
      if (obj.metals?.length) {
        obj.metals = obj.metals.map((m) => {
          if (m.hallmark_id && typeof m.hallmark_id === "object") {
            m.hallmark_name = m.hallmark_id.name || "";
          }
          return m;
        });
      }

      // ✅ STONE NAME FIX
      if (obj.stones?.length) {
        obj.stones = obj.stones.map((stone) => {
          if (stone.stone_id && typeof stone.stone_id === "object") {
            stone.stone_type =
              stone.stone_id.stone_type ||
              stone.stone_id.name ||
              stone.stone_type ||
              "";
          }

          if (
            stone.stone_purity_id &&
            typeof stone.stone_purity_id === "object"
          ) {
            stone.stone_purity =
              stone.stone_purity_id.stone_purity ||
              stone.stone_purity_id.purity_name ||
              stone.stone_purity_id.name ||
              stone.stone_purity ||
              "";
          }

          return stone;
        });
      }

      // ✅ MATERIAL NAME FIX
      if (obj.materials?.length) {
        obj.materials = obj.materials.map((mat) => {
          if (mat.material_id && typeof mat.material_id === "object") {
            mat.material_type =
              mat.material_id.material_type ||
              mat.material_id.name ||
              mat.material_type ||
              "";
          }

          if (mat.wastage_id && typeof mat.wastage_id === "object") {
            mat.wastage_type =
              mat.wastage_id.wastage_type || mat.wastage_type || "";
          }

          return mat;
        });
      }

      // ✅ PRICE MAKING TRANSFORM
      if (obj.price_making_costs?.length) {
        obj.price_making_costs = obj.price_making_costs.map((cost) => {
          const ref = cost.price_making_id;

          return {
            ...cost,
            stage_name:
              ref?.making_stage_id?.stage_name ||
              ref?.making_stage_id?.name ||
              cost.stage_name ||
              "",
            sub_stage_name:
              ref?.making_sub_stage_id?.sub_stage_name ||
              ref?.making_sub_stage_id?.name ||
              cost.sub_stage_name ||
              "",
            cost_type:
              ref?.cost_type_id?.cost_type ||
              ref?.cost_type_id?.name ||
              cost.cost_type ||
              "",
            unit_name:
              ref?.unit_id?.unit_name ||
              ref?.unit_id?.name ||
              cost.unit_name ||
              "",
            cost_amount: cost.cost_amount || ref?.cost_amount || 0,
          };
        });
      }

      return obj;
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

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    let payload = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product id",
      });
    }

    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // ---------------- PARSER ----------------
    const parseIfString = (val) => {
      if (typeof val === "string") {
        try {
          return JSON.parse(val);
        } catch {
          return val;
        }
      }
      return val;
    };

    const metalsData = payload.metals
      ? parseIfString(payload.metals)
      : existingProduct.metals;
    const stonesData = payload.stones
      ? parseIfString(payload.stones)
      : existingProduct.stones;
    const materialsData = payload.materials
      ? parseIfString(payload.materials)
      : existingProduct.materials;
    const priceMakingCostsData = payload.price_making_costs
      ? parseIfString(payload.price_making_costs)
      : existingProduct.price_making_costs;

    // ---------------- IDS FIRST (FIXED) ----------------
    const brandId =
      payload.product_brand_id ||
      payload.product_brand ||
      existingProduct.product_brand_id;

    const categoryId =
      payload.product_category_id ||
      payload.product_category ||
      existingProduct.product_category_id;

    const subcategoryId =
      payload.product_subcategory_id ||
      payload.product_subcategory ||
      existingProduct.product_subcategory_id;

    // ---------------- METALS ----------------
   const calculatedMetals = await Promise.all(
  (metalsData || []).map(async (metal) => {
    let metalId = null;
    let purityId = null;

    if (metal.metal_id && mongoose.Types.ObjectId.isValid(metal.metal_id)) {
      metalId = metal.metal_id;
    } else if (metal.metal_type && mongoose.Types.ObjectId.isValid(metal.metal_type)) {
      metalId = metal.metal_type;
    }

    if (metal.purity_id && mongoose.Types.ObjectId.isValid(metal.purity_id)) {
      purityId = metal.purity_id;
    } else if (metal.purity && mongoose.Types.ObjectId.isValid(metal.purity)) {
      purityId = metal.purity;
    }

    const metalDoc = metalId ? await Metal.findById(metalId) : null;
    const purityDoc = purityId ? await Purity.findById(purityId) : null;

    const subtotal = calculateMetalSubtotal(metal);

    return {
      metal_id: metalId,
      metal_type: metalDoc?.metal_name || metalDoc?.name || "",
      purity_id: purityId,
      purity: purityDoc?.purity_name || purityDoc?.name || "",
      weight: parseFloat(metal.weight) || 0,
      unit: metal.unit || "g",
      rate_per_gram: parseFloat(metal.rate_per_gram) || 0,
      making_charge_type: metal.making_charge_type || "Fixed",
      making_charge_value: parseFloat(metal.making_charge_value) || 0,
      hallmark_id: metal.hallmark_id || null,
      subtotal,
    };
  })
);

    // ---------------- STONES ----------------
    const calculatedStones = await Promise.all(
      (stonesData || []).map(async (stone) => {
        const stoneId = stone.stone_id || stone.stone_type;
        const purityId = stone.stone_purity_id || stone.stone_purity;

        const stoneDoc = mongoose.Types.ObjectId.isValid(stoneId)
          ? await StoneType.findById(stoneId)
          : null;

        const purityDoc = mongoose.Types.ObjectId.isValid(purityId)
          ? await stonePurityModel.findById(purityId)
          : null;

        const subtotal = calculateStoneSubtotal(stone);

        return {
          stone_id: stoneId || null,
          stone_type:
            stoneDoc?.stone_type || stoneDoc?.name || stone.stone_type || "",
          stone_purity_id: purityId || null,
          stone_purity:
            purityDoc?.stone_purity ||
            purityDoc?.purity_name ||
            purityDoc?.name ||
            stone.stone_purity ||
            "",
          size: parseFloat(stone.size) || 0,
          quantity: parseInt(stone.quantity) || 0,
          weight: parseFloat(stone.weight) || 0,
          price_per_carat: parseFloat(stone.price_per_carat) || 0,
          subtotal,
        };
      }),
    );

const calculatedMaterials = await Promise.all(
  (materialsData || []).map(async (mat) => {
    let materialId = null;
    let materialName = "";
    let wastageId = null;
    let wastageName = "";

    // -------- MATERIAL TYPE FIX --------
    if (mat.material_id && mongoose.Types.ObjectId.isValid(mat.material_id)) {
      materialId = mat.material_id;
      const materialDoc = await MaterialTypes.findById(materialId);
      materialName = materialDoc?.material_type || materialDoc?.name || "";
    } 
    else if (mat.material_type && mongoose.Types.ObjectId.isValid(mat.material_type)) {
      materialId = mat.material_type;
      const materialDoc = await MaterialTypes.findById(materialId);
      materialName = materialDoc?.material_type || materialDoc?.name || "";
    } 
    else {
      materialName = mat.material_type || "";
    }

    // -------- WASTAGE FIX --------
    if (mat.wastage_id && mongoose.Types.ObjectId.isValid(mat.wastage_id)) {
      wastageId = mat.wastage_id;
      const wastageDoc = await Wastage.findById(wastageId);
      wastageName = wastageDoc?.wastage_type || "";
    } 
    else if (mat.wastage_type && mongoose.Types.ObjectId.isValid(mat.wastage_type)) {
      wastageId = mat.wastage_type;
      const wastageDoc = await Wastage.findById(wastageId);
      wastageName = wastageDoc?.wastage_type || "";
    } 
    else {
      wastageName = mat.wastage_type || "";
    }

    const weight = parseFloat(mat.weight) || 0;
    const rate = parseFloat(mat.rate_per_unit) || 0;

    return {
      material_id: materialId,
      material_type: materialName,   // ✅ अब NAME save होगा
      wastage_id: wastageId,
      wastage_type: wastageName,
      weight,
      unit: mat.unit || "g",
      rate_per_unit: rate,
      cost: weight * rate,
    };
  })
);

    // ---------------- PRICE MAKING ----------------
    const calculatedPriceMakingCosts = await Promise.all(
      (priceMakingCostsData || []).map(async (c) => {
        return {
          stage_name: c.stage_name || "",
          sub_stage_name: c.sub_stage_name || "",
          cost_type: c.cost_type || "",
          unit_name: c.unit_name || "",
          cost_amount: parseFloat(c.cost_amount) || 0,
          is_active: true,
        };
      }),
    );

    // ---------------- TOTALS ----------------
    const total_metals_cost = calculatedMetals.reduce(
      (s, m) => s + (m.subtotal || 0),
      0,
    );
    const total_stones_cost = calculatedStones.reduce(
      (s, s2) => s + (s2.subtotal || 0),
      0,
    );
    const total_materials_cost = calculatedMaterials.reduce(
      (s, m) => s + (m.cost || 0),
      0,
    );
    const total_price_making_costs = calculatedPriceMakingCosts.reduce(
      (s, c) => s + (c.cost_amount || 0),
      0,
    );

    const base_total =
      total_metals_cost + total_stones_cost + total_materials_cost;
    const grand_total = base_total + total_price_making_costs;

    // ---------------- BRAND NAMES ----------------
    let brandName = existingProduct.product_brand;
    if (mongoose.Types.ObjectId.isValid(brandId)) {
      const b = await Brand.findById(brandId);
      brandName = b?.brand_name || b?.name || "";
    }

    let categoryName = existingProduct.product_category;
    if (mongoose.Types.ObjectId.isValid(categoryId)) {
      const c = await Category.findById(categoryId);
      categoryName = c?.category_name || c?.name || "";
    }

    let subcategoryName = existingProduct.product_subcategory;
    if (mongoose.Types.ObjectId.isValid(subcategoryId)) {
      const s = await Subcategory.findById(subcategoryId);
      subcategoryName = s?.sub_category_name || s?.name || "";
    }

    // ---------------- GST ----------------
    const markup =
      parseFloat(payload.markup_percentage) ||
      existingProduct.markup_percentage ||
      0;
    const selling_price_before_tax = round3(grand_total * (1 + markup / 100));

    const cgstRate = extractPercentage(
      payload.cgst_rate || existingProduct.cgst_rate,
    );
    const sgstRate = extractPercentage(
      payload.sgst_rate || existingProduct.sgst_rate,
    );

    const cgst_amount = round3((selling_price_before_tax * cgstRate) / 100);
    const sgst_amount = round3((selling_price_before_tax * sgstRate) / 100);

    const gst_amount = round3(cgst_amount + sgst_amount);
    const selling_price_with_gst = round3(
      selling_price_before_tax + gst_amount,
    );

    // ---------------- IMAGE HANDLE ----------------
    let imagePaths = existingProduct.image || [];

    if (req.files && req.files.length > 0) {
      imagePaths = req.files.map(
        (file) => `/uploads/products/${file.filename}`,
      );
    }
    // ---------------- UPDATE ----------------
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        product_name: payload.product_name || existingProduct.product_name,
        article_no: payload.article_no || existingProduct.article_no,
        product_brand_id: brandId,
        product_category_id: categoryId,
        product_subcategory_id: subcategoryId,
        product_brand: brandName,
        product_category: categoryName,
        product_subcategory: subcategoryName,
        metals: calculatedMetals,
        stones: calculatedStones,
        materials: calculatedMaterials,
        price_making_costs: calculatedPriceMakingCosts,
        total_metals_cost,
        total_stones_cost,
        total_materials_cost,
        total_price_making_costs,
        base_total,
        grand_total,
        gst_amount,
        cgst_amount,
        sgst_amount,
        selling_price_before_tax,
        selling_price_with_gst,
        image: imagePaths,
      },
      { new: true },
    );

    const BASE_URL = process.env.APP_URL;

    const productObj = updatedProduct.toObject();

    productObj.fullImageUrls = productObj.image
      ? productObj.image.map((img) => `${BASE_URL}${img}`)
      : [];

    return res.json({
      success: true,
      message: "Product updated successfully",
      data: productObj,
    });
  } catch (err) {
    console.error("Update Product Error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }
};

// export const updateProduct = async (req, res) => {
//   try {
//     const { id } = req.params;
//     let payload = req.body;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid product id",
//       });
//     }

//     const existingProduct = await Product.findById(id);
//     if (!existingProduct) {
//       return res.status(404).json({
//         success: false,
//         message: "Product not found",
//       });
//     }

//     const parseIfString = (val) =>
//       typeof val === "string" ? JSON.parse(val) : val;

//     // 🔹 Parse Arrays
//     const metalsData = payload.metals
//       ? parseIfString(payload.metals)
//       : existingProduct.metals;

//     const stonesData = payload.stones
//       ? parseIfString(payload.stones)
//       : existingProduct.stones;

//     const materialsData = payload.materials
//       ? parseIfString(payload.materials)
//       : existingProduct.materials;

//     const rawPriceMakingCosts = payload.price_making_costs
//       ? parseIfString(payload.price_making_costs)
//       : existingProduct.price_making_costs;

//     // 🔥 PROCESS PRICE MAKING COSTS (MAIN FIX)
//     const processedPriceMakingCosts = await Promise.all(
//       rawPriceMakingCosts.map(async (costItem) => {
//         try {
//           let priceMakingDetails = null;

//           // find by id
//           if (
//             costItem.price_making_id &&
//             mongoose.Types.ObjectId.isValid(costItem.price_making_id)
//           ) {
//             priceMakingDetails = await PriceMaking.findById(
//               costItem.price_making_id
//             );
//           }

//           // find by cost_type
//           else if (costItem.cost_type) {
//             priceMakingDetails = await PriceMaking.findOne({
//               cost_type: {
//                 $regex: new RegExp(`^${costItem.cost_type}$`, "i"),
//               },
//               is_active: true,
//             });
//           }

//           // fallback manual
//           if (!priceMakingDetails) {
//             return {
//               stage_name: costItem.stage_name || "",
//               sub_stage_name: costItem.sub_stage_name || "",
//               cost_type: costItem.cost_type || "",
//               unit_name: costItem.unit_name || "",
//               cost_amount: parseFloat(costItem.cost_amount) || 0,
//               is_active: true,
//               source: "manual_input",
//             };
//           }

//           return {
//             price_making_id: priceMakingDetails._id,
//             stage_name: priceMakingDetails.stage_name || "",
//             sub_stage_name: priceMakingDetails.sub_stage_name || "",
//             cost_type: priceMakingDetails.cost_type || "",
//             unit_name: priceMakingDetails.unit_name || "",
//             cost_amount:
//               parseFloat(costItem.cost_amount) ||
//               parseFloat(priceMakingDetails.cost_amount) ||
//               0,
//             is_active: priceMakingDetails.is_active !== false,
//             source: "database",
//           };
//         } catch (err) {
//           console.error("Error processing price making cost:", err);
//           return {
//             stage_name: costItem.stage_name || "",
//             sub_stage_name: costItem.sub_stage_name || "",
//             cost_type: costItem.cost_type || "",
//             unit_name: costItem.unit_name || "",
//             cost_amount: parseFloat(costItem.cost_amount) || 0,
//             is_active: true,
//             source: "error_fallback",
//           };
//         }
//       })
//     );

//     // 🔹 TOTALS
//     const total_metals_cost = metalsData.reduce(
//       (s, m) => s + (m.subtotal || 0),
//       0
//     );

//     const total_stones_cost = stonesData.reduce(
//       (s, st) => s + (st.subtotal || 0),
//       0
//     );

//     const total_materials_cost = materialsData.reduce(
//       (s, m) => s + (m.cost || 0),
//       0
//     );

//     const total_price_making_costs = processedPriceMakingCosts.reduce(
//       (s, c) => s + (c.cost_amount || 0),
//       0
//     );

//     const base_total =
//       total_metals_cost + total_stones_cost + total_materials_cost;

//     const grand_total = base_total + total_price_making_costs;

//     // 🔹 MARKUP + GST
//     const markup =
//       payload.markup_percentage ??
//       existingProduct.markup_percentage ??
//       0;

//     const selling_price_before_tax = round3(
//       grand_total * (1 + markup / 100)
//     );

//     const cgstRate = extractPercentage(
//       payload.cgst_rate || existingProduct.cgst_rate
//     );
//     const sgstRate = extractPercentage(
//       payload.sgst_rate || existingProduct.sgst_rate
//     );
//     const igstRate = extractPercentage(
//       payload.igst_rate || existingProduct.igst_rate
//     );
//     const utgstRate = extractPercentage(
//       payload.utgst_rate || existingProduct.utgst_rate
//     );

//     const cgst_amount = round3((selling_price_before_tax * cgstRate) / 100);
//     const sgst_amount = round3((selling_price_before_tax * sgstRate) / 100);
//     const igst_amount = round3((selling_price_before_tax * igstRate) / 100);
//     const utgst_amount = round3((selling_price_before_tax * utgstRate) / 100);

//     const gst_amount = round3(
//       cgst_amount + sgst_amount + igst_amount + utgst_amount
//     );

//     const selling_price_with_gst = round3(
//       selling_price_before_tax + gst_amount
//     );

//     // 🔹 IMAGES
//     let imagePaths = existingProduct.image || [];
//     if (req.files?.length) {
//       imagePaths = req.files.map(
//         (f) => `/uploads/products/${f.filename}`
//       );
//     }

//     // 🔹 UPDATE DB
//     const updatedProduct = await Product.findByIdAndUpdate(
//       id,
//       {
//         ...payload,

//         metals: metalsData,
//         stones: stonesData,
//         materials: materialsData,
//         price_making_costs: processedPriceMakingCosts,

//         total_metals_cost,
//         total_stones_cost,
//         total_materials_cost,
//         total_price_making_costs,
//         base_total,
//         grand_total,

//         gst_amount,
//         cgst_amount,
//         sgst_amount,
//         igst_amount,
//         utgst_amount,

//         selling_price_before_tax,
//         selling_price_with_gst,

//         image: imagePaths,
//       },
//       { new: true, runValidators: true }
//     );

//     // 🔹 FINAL RESPONSE
//     const BASE_URL = process.env.APP_URL;

//     const productWithFullImages = {
//       ...updatedProduct._doc,
//       fullImageUrls: updatedProduct.image
//         ? updatedProduct.image.map((img) => `${BASE_URL}${img}`)
//         : [],
//     };

//     return res.json({
//       success: true,
//       message: "Product updated successfully",
//       data: productWithFullImages,
//     });
//   } catch (err) {
//     console.error("Update Product Error:", err);
//     return res.status(500).json({
//       success: false,
//       message: err.message,
//     });
//   }
// };
