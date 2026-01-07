import Product from "../Models/models/ProductModel.js"
import Metal from "../Models/models/MetalTypeModel.js"
import Purity from "../Models/models/Purity.js"
import StoneType from "../Models/models/StoneType.js"
import Wastage from "../Models/models/wastageModel.js"
import GstRate from "../Models/models/GstRate.js"
import Brand from "../Models/models/brandModel.js"
import Category from '../Models/models/Category.js'
import Subcategory from "../Models/models/Subcategory.js"
import mongoose from "mongoose";

// Generate unique product code
export const generateProductCode = async () => {
  const prefix = "PROD";
  const year = new Date().getFullYear().toString().slice(-2);
 
  const lastProduct = await Product.findOne().sort({ createdAt: -1 });
  let sequence = 1;
 
  if (lastProduct && lastProduct.product_code) {
    const lastCode = lastProduct.product_code;
    const match = lastCode.match(/(\d+)$/);
    if (match) {
      sequence = parseInt(match[1]) + 1;
    }
  }
 
  return `${prefix}${year}${sequence.toString().padStart(4, '0')}`;
};

// Calculate metal subtotal
// export const calculateMetalSubtotal = (metal) => {
//   const weight = parseFloat(metal.weight) || 0;
//   const rate = parseFloat(metal.rate_per_gram) || 0;
//   const base = weight * rate;
//   const makingCharge = parseFloat(metal.making_charge_value) || 0;

//   if (metal.making_charge_type === "Percentage") {
//     return base + (base * makingCharge) / 100;
//   } else if (metal.making_charge_type === "Fixed") {
//     return base + makingCharge;
//   } else if (metal.making_charge_type === "Per Gram") {
//     return base + makingCharge * weight;
//   }
//   return base;
// };



export const calculateMetalSubtotal = (metal) => {
  const weight = Number(metal.weight) || 0;
  const rate = Number(metal.rate_per_gram) || 0;
  const base = weight * rate;
  const value = Number(metal.making_charge_value) || 0;

  switch (metal.making_charge_type) {
    case "Percentage":
      return base + (base * value) / 100;
    case "Fixed":
      return base + value;
    case "Per Gram":
      return base + value * weight;
    default:
      return base;
  }
};


// Calculate stone subtotal
export const calculateStoneSubtotal = (stone) => {
  const quantity = parseFloat(stone.quantity) || 0;
  const weight = parseFloat(stone.weight) || 0;
  const price = parseFloat(stone.price_per_carat) || 0;
  return quantity * weight * price;
};

// Calculate material cost
export const calculateMaterialCost = (material) => {
  const weight = parseFloat(material.weight) || 0;
  const rate = parseFloat(material.rate_per_unit) || 0;
  return weight * rate;
};

// Extract percentage from string like "18%"
export const extractPercentage = (rateString) => {
  if (!rateString) return 0;
  const match = rateString.match(/(\d+(\.\d+)?)/);
  return match ? parseFloat(match[1]) : 0;
};

// Find name by ID helper functions
export const findMetalNameById = async (metalId) => {
  if (!metalId || !mongoose.Types.ObjectId.isValid(metalId)) return "";
  const metal = await Metal.findById(metalId);
  return metal?.metal_name || metal?.name || "";
};console.log("test");

export const findPurityNameById = async (purityId) => {
  if (!purityId || !mongoose.Types.ObjectId.isValid(purityId)) return "";
  const purity = await Purity.findById(purityId);
  return purity?.purity_name || purity?.name || "";
};
console.log("test2");


export const findStoneNameById = async (stoneId) => {
  if (!stoneId || !mongoose.Types.ObjectId.isValid(stoneId)) return "";
  const stone = await StoneType.findById(stoneId);
  return stone?.stone_type || stone?.stone_type || "";
};
console.log("test3");

export const findWastageTypeById = async (wastageId) => {
  if (!wastageId || !mongoose.Types.ObjectId.isValid(wastageId)) return "";
  const wastage = await Wastage.findById(wastageId);
  return wastage?.wastage_type || "";
};
console.log("test4");

export const findCategoryNameById = async (categoryId) => {
  if (!categoryId || !mongoose.Types.ObjectId.isValid(categoryId)) return "";
  const category = await Category.findById(categoryId);
  return category?.category_name || category?.name || "";
};
console.log("test5");
export const findSubcategoryNameById = async (subcategoryId) => {
  if (!subcategoryId || !mongoose.Types.ObjectId.isValid(subcategoryId)) return "";
  const subcategory = await Subcategory.findById(subcategoryId);
  return subcategory?.sub_category_name || subcategory?.name || "";
};
console.log("test6");

export const findBrandNameById = async (brandId) => {
  if (!brandId || !mongoose.Types.ObjectId.isValid(brandId)) return "";
  const brand = await Brand.findById(brandId);
  return brand?.brand_name || brand?.name || "";
};
console.log("test7")


// import mongoose from "mongoose";
// import Product from "../Models/models/ProductModel.js";
// import Metal from "../Models/models/MetalTypeModel.js";
// import Purity from "../Models/models/Purity.js";
// import StoneType from "../Models/models/StoneType.js";
// import Wastage from "../Models/models/wastageModel.js";
// import Category from '../Models/models/Category.js';
// import Subcategory from "../Models/models/Subcategory.js";
// import Brand from "../Models/models/brandModel.js";

// // Generate unique product code - FIXED VERSION
// export const generateProductCode = async () => {
//   try {
//     const prefix = "PROD";
//     const year = new Date().getFullYear().toString().slice(-2);
//     const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
    
//     // Find the last product with similar pattern
//     const regex = new RegExp(`^${prefix}${year}${month}`);
//     const lastProduct = await Product.findOne({
//       product_code: { $regex: regex }
//     }).sort({ createdAt: -1 });
    
//     let sequence = 1;
    
//     if (lastProduct && lastProduct.product_code) {
//       const lastCode = lastProduct.product_code;
//       // Extract sequence number from code like PROD2501001
//       const match = lastCode.match(new RegExp(`${prefix}${year}${month}(\\d+)`));
//       if (match && match[1]) {
//         sequence = parseInt(match[1]) + 1;
//       }
//     }
    
//     return `${prefix}${year}${month}${sequence.toString().padStart(3, '0')}`;
//   } catch (error) {
//     console.error("Error generating product code:", error);
//     // Fallback code
//     return `PROD${new Date().getFullYear()}${Date.now().toString().slice(-6)}`;
//   }
// };

// // Calculate metal subtotal
// export const calculateMetalSubtotal = (metal) => {
//   const weight = parseFloat(metal.weight) || 0;
//   const rate = parseFloat(metal.rate_per_gram) || 0;
//   const base = weight * rate;
//   const makingChargeValue = parseFloat(metal.making_charge_value) || 0;

//   if (metal.making_charge_type === "Percentage") {
//     return base + (base * makingChargeValue) / 100;
//   } else if (metal.making_charge_type === "Fixed") {
//     return base + makingChargeValue;
//   } else if (metal.making_charge_type === "Per Gram") {
//     return base + makingChargeValue * weight;
//   }
//   return base;
// };

// // Calculate stone subtotal
// export const calculateStoneSubtotal = (stone) => {
//   const quantity = parseFloat(stone.quantity) || 0;
//   const weight = parseFloat(stone.weight) || 0;
//   const price = parseFloat(stone.price_per_carat) || 0;
//   return quantity * weight * price;
// };

// // Calculate material cost
// export const calculateMaterialCost = (material) => {
//   const weight = parseFloat(material.weight) || 0;
//   const rate = parseFloat(material.rate_per_unit) || 0;
//   return weight * rate;
// };

// // Extract percentage from string like "18%"
// export const extractPercentage = (rateString) => {
//   if (!rateString) return 0;
  
//   // If it's already a number
//   if (typeof rateString === 'number') {
//     return rateString;
//   }
  
//   // If it's a string, extract number
//   if (typeof rateString === 'string') {
//     // Remove % sign and any non-numeric characters except decimal point
//     const cleaned = rateString.replace(/[^0-9.]/g, '');
//     const numValue = parseFloat(cleaned);
//     return isNaN(numValue) ? 0 : numValue;
//   }
  
//   return 0;
// };

// // Find name by ID helper functions
// export const findMetalNameById = async (metalId) => {
//   if (!metalId || !mongoose.Types.ObjectId.isValid(metalId)) return "";
//   try {
//     const metal = await Metal.findById(metalId);
//     return metal?.metal_name || metal?.name || "";
//   } catch (error) {
//     console.error("Error finding metal name:", error);
//     return "";
//   }
// };

// export const findPurityNameById = async (purityId) => {
//   if (!purityId || !mongoose.Types.ObjectId.isValid(purityId)) return "";
//   try {
//     const purity = await Purity.findById(purityId);
//     return purity?.purity_name || purity?.name || "";
//   } catch (error) {
//     console.error("Error finding purity name:", error);
//     return "";
//   }
// };

// export const findStoneNameById = async (stoneId) => {
//   if (!stoneId || !mongoose.Types.ObjectId.isValid(stoneId)) return "";
//   try {
//     const stone = await StoneType.findById(stoneId);
//     return stone?.stone_type || stone?.name || "";
//   } catch (error) {
//     console.error("Error finding stone name:", error);
//     return "";
//   }
// };

// export const findWastageTypeById = async (wastageId) => {
//   if (!wastageId || !mongoose.Types.ObjectId.isValid(wastageId)) return "";
//   try {
//     const wastage = await Wastage.findById(wastageId);
//     return wastage?.wastage_type || wastage?.name || "";
//   } catch (error) {
//     console.error("Error finding wastage type:", error);
//     return "";
//   }
// };

// export const findCategoryNameById = async (categoryId) => {
//   if (!categoryId || !mongoose.Types.ObjectId.isValid(categoryId)) return "";
//   try {
//     const category = await Category.findById(categoryId);
//     return category?.category_name || category?.name || "";
//   } catch (error) {
//     console.error("Error finding category name:", error);
//     return "";
//   }
// };

// export const findSubcategoryNameById = async (subcategoryId) => {
//   if (!subcategoryId || !mongoose.Types.ObjectId.isValid(subcategoryId)) return "";
//   try {
//     const subcategory = await Subcategory.findById(subcategoryId);
//     return subcategory?.sub_category_name || subcategory?.name || "";
//   } catch (error) {
//     console.error("Error finding subcategory name:", error);
//     return "";
//   }
// };

// export const findBrandNameById = async (brandId) => {
//   if (!brandId || !mongoose.Types.ObjectId.isValid(brandId)) return "";
//   try {
//     const brand = await Brand.findById(brandId);
//     return brand?.brand_name || brand?.name || "";
//   } catch (error) {
//     console.error("Error finding brand name:", error);
//     return "";
//   }
// };