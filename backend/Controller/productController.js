import Product from "../Models/models/Product.js";
import ProductImage from "../models/models/ProductImage.js";
import Unit from "../Models/models/unitModel.js";
import GstRate from "../Models/models/GstRate.js";
import MaterialTypes from "../Models/models/MaterialTypes.js";
import stonePurityModel from "../Models/models/stonePurityModel.js";
import {
  calculateMaterialCost,
  calculateMetalSubtotal,
  calculateStoneSubtotal,
  generateProductCode,
} from "../helper/generateProductCode.js";
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

export const createProduct = async (req, res) => {
  try {
    let {
      product_name,
      product_code,
      product_brand, // Brand ID from UI
      product_category, // Category ID from UI
      product_subcategory, // Subcategory ID from UI
      markup_percentage,
      gst_rate, // GST rate string like "18%"
      cgst_rate,
      sgst_rate,
      igst_rate,
      utgst_rate,
      metals, // Array with metal_type (ID) and purity (ID)
      stones, // Array with stone_name (ID)
      materials, // Array with wastage_type (ID)
    } = req.body;
    console.log(req.body, "req.body");

    let finalProductCode = product_code;
    if (!finalProductCode || finalProductCode.trim() === "") {
      finalProductCode = await generateProductCode();
    }
    // const check = await Product.findOne({ product_name: product_name });
    // if (check) {
    //   return res
    //     .status(400)
    //     .json({ status: false, message: "Product already exit" });
    // }

    const metalsData =
      typeof metals === "string" ? JSON.parse(metals) : metals || [];
    const stonesData =
      typeof stones === "string" ? JSON.parse(stones) : stones || [];
    const materialsData =
      typeof materials === "string" ? JSON.parse(materials) : materials || [];

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

    // const calculatedMetals = await Promise.all(metalsData.map(async (metal) => {

    //   let metalName = "";
    //   if (metal.metal_type && mongoose.Types.ObjectId.isValid(metal.metal_type)) {
    //     const metalDoc = await Metal.findById(metal.metal_type);
    //     metalName = metalDoc?.metal_name || metalDoc?.name || "";
    //   }

    const calculatedMetals = await Promise.all(
      metalsData.map(async (metal) => {
        const metalDoc = await Metal.findById(metal.metal_type);
        const purityDoc = await Purity.findById(metal.purity);
        const costDoc = metal.making_charge_id
          ? await CostName.findById(metal.making_charge_id)
          : null;

        let purityName = "";
        if (metal.purity && mongoose.Types.ObjectId.isValid(metal.purity)) {
          const purityDoc = await Purity.findById(metal.purity);
          purityName = purityDoc?.purity_name || purityDoc?.name || "";
        }

        const subtotal = calculateMetalSubtotal(metal);

        // return {
        //   metal_id: metal.metal_type,
        //   metal_type: metalName,
        //   purity_id: metal.purity,
        //   purity: purityName,
        //   weight: parseFloat(metal.weight) || 0,
        //   unit: metal.unit || "g",
        //   rate_per_gram: parseFloat(metal.rate_per_gram) || 0,
        //   making_charge_type: metal.making_charge_type || "Fixed",
        //   making_charge_value: parseFloat(metal.making_charge_value) || 0,
        //   subtotal
        // };

        return {
          metal_id: metal.metal_type,
          metal_type: metalDoc?.metal_name || metalDoc?.name || "",
          purity_id: metal.purity,
          purity: purityDoc?.purity_name || purityDoc?.name || "",
          weight: parseFloat(metal.weight) || 0,
          unit: metal.unit || "g",
          rate_per_gram: parseFloat(metal.rate_per_gram) || 0,
          // making_charge_id: metal.making_charge_id || null,
          // making_charge_type:
          // costDoc?.cost_type || metal.making_charge_type || "Fixed",
          // making_charge_value: parseFloat(metal.making_charge_value) || 0,
          subtotal,
        };
       
      })
    );

  const calculatedStones = await Promise.all(
  stonesData.map(async (stone) => {
    console.log("Processing stone:", stone); // Debug के लिए

    // Initialize variables
    let stoneId = stone.stone_type || null;
    let stoneName = "";
    let stonePurityId = stone.stone_purity || null;
    let stonePurityName = "";
    
    // 1. Fetch Stone Type details - FIXED CONDITION
    if (stoneId && mongoose.Types.ObjectId.isValid(stoneId)) {
      try {
        const stoneDoc = await StoneType.findById(stoneId);
        console.log("Stone Document found:", stoneDoc);
        
        if (stoneDoc) {
          stoneName = stoneDoc.stone_type || stoneDoc.name || "";
        }
      } catch(err) {
        console.error("Error fetching stone type:", err);
      }
    } else {
      console.log("Invalid or missing stoneId:", stoneId);
    }
    
    // 2. Fetch Stone Purity details
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

    // Calculate subtotal
    const subtotal = calculateStoneSubtotal(stone);
    
    console.log("Final stone data:", {
      stone_id: stoneId,
      stone_type: stoneName,
      stone_purity: stonePurityName
    });

    return {
      stone_id: stoneId, 
      stone_type: stoneName,
      stone_purity: stonePurityName, // ✅ एक ही बार में
      stone_purity_id: stonePurityId, // ✅ अगर ID भी store करना है
      size: parseFloat(stone.size) || 0,
      quantity: parseInt(stone.quantity) || 0,
      weight: parseFloat(stone.weight) || 0,
      price_per_carat: parseFloat(stone.price_per_carat) || 0,
      subtotal,
    };
  })
);










const calculatedMaterials = await Promise.all(
  materialsData.map(async (material) => {
    console.log("Processing material:", material);

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



    //CALCULATE TOTALS //
    const total_metals_cost = calculatedMetals.reduce(
      (sum, metal) => sum + (metal.subtotal || 0),
      0
    );
    const total_stones_cost = calculatedStones.reduce(
      (sum, stone) => sum + (stone.subtotal || 0),
      0
    );
    const total_materials_cost = calculatedMaterials.reduce(
      (sum, material) => sum + (material.cost || 0),
      0
    );

    const grand_total =
      total_metals_cost + total_stones_cost + total_materials_cost;
    console.log(grand_total, "grand_total");

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

   const selling_price_with_gst =
  selling_price_before_tax +
  cgst_amount +
  sgst_amount +
  igst_amount +
  utgst_amount;
    console.log(selling_price_with_gst, "selling_price_with_gst");

    const imagePaths =
     req.files?.images
      ? req.files.images.map(f => `/uploads/products/images/${f.filename}`)
      : [];
      // req.files?.map((f) => `/uploads/products/${f.filename}`) || [];
    console.log(imagePaths, "imagePaths");


    // const videoPaths = req.files?.video
    //   ? `/uploads/products/videos/${req.files.video[0].filename}`
    //   : null;
    //   console.log("videoPaths",videoPaths)

    const product = await Product.create({
      product_name,
      product_code: finalProductCode,

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

      total_metals_cost,
      total_stones_cost,
      total_materials_cost,

      gst_amount,
      cgst_amount,
      sgst_amount,
      igst_amount,
      utgst_amount,

      grand_total,
      selling_price_before_tax,
      selling_price_with_gst,

      images: imagePaths,
      // video: videoPaths,

      status: "active",
    });



 


    const populatedProduct = await Product.findById(product._id)

      .populate("product_brand_id", "brand_name name")
      .populate("product_category_id", "category_name name")
      .populate("product_subcategory_id", "sub_category_name name")
      .populate("metals.metal_id", "metal_name name")
      .populate("metals.purity_id", "purity_name")
      .populate("metals.making_charge_id", "cost_type cost_name")
      .populate("stones.stone_type", "stone_type")
      .populate("materials.wastage_id", "wastage_type")
        .populate("materials.material_id", "material_type");
    console.log(populatedProduct, "populatedProduct");

    return res.status(200).json({  success: true,  message: "Product created successfully",  data: populatedProduct,});
  } catch (err) {
    console.error("Error creating product:", err);
    return res .status(500) .json({   success: false,   message: err.message || "Internal server error", });
  }
};

// export const getProducts = async (req, res) => {
//   try {
//     const products = await Product.find();
//     // .populate(
//     //   "category_id subcategory_id purity_id branch_id"
//     // );
//     console.log("Products fetched:", products);
//     return res.json({ success: true, products });
//   } catch (err) {
//     console.error(err);
//     return res
//       .status(500)
//       .json({ success: false, message: "Server error", error: err.message });
//   }
// };









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

export const unitCreate = async (req, res) => {
  try {
    let { name } = req.body;
    let a = await Unit.create({ name });
    console.log(name, "unit name");

    console.log(a, "create unit");

    return res
      .status(200)
      .json({ success: true, message: "Unit created successfully", data: a });
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

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product id",
      });
    }

    let {
      product_name,
      product_code,
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
    } = req.body;

    console.log(req.body, "UPDATE req.body");

    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    /* ---------------- SAFE PARSE ---------------- */
    const safeParse = (val) => {
      if (!val) return [];
      if (typeof val === "object") return val;
      try {
        return JSON.parse(val);
      } catch (err) {
        throw new Error("Invalid JSON format received");
      }
    };

    const metalsData = safeParse(metals);
    const stonesData = safeParse(stones);
    const materialsData = safeParse(materials);

    /* ---------------- BRAND / CATEGORY / SUBCATEGORY ---------------- */
    let brandName = existingProduct.product_brand;
    if (product_brand && mongoose.Types.ObjectId.isValid(product_brand)) {
      const brandDoc = await Brand.findById(product_brand);
      brandName = brandDoc?.brand_name || brandDoc?.name || "";
    }

    let categoryName = existingProduct.product_category;
    if (product_category && mongoose.Types.ObjectId.isValid(product_category)) {
      const categoryDoc = await Category.findById(product_category);
      categoryName = categoryDoc?.category_name || categoryDoc?.name || "";
    }

    let subcategoryName = existingProduct.product_subcategory;
    if (
      product_subcategory &&
      mongoose.Types.ObjectId.isValid(product_subcategory)
    ) {
      const subDoc = await Subcategory.findById(product_subcategory);
      subcategoryName = subDoc?.sub_category_name || subDoc?.name || "";
    }

    /* ---------------- METALS ---------------- */
    const calculatedMetals = await Promise.all(
      metalsData.map(async (metal) => {
        const metalDoc = await Metal.findById(metal.metal_type);
        const purityDoc = await Purity.findById(metal.purity);

        const subtotal = calculateMetalSubtotal(metal);

        return {
          metal_id: metal.metal_type,
          metal_type: metalDoc?.metal_name || metalDoc?.name || "",
          purity_id: metal.purity,
          purity: purityDoc?.purity_name || purityDoc?.name || "",
          weight: parseFloat(metal.weight) || 0,
          unit: metal.unit || "g",
          rate_per_gram: parseFloat(metal.rate_per_gram) || 0,
          subtotal,
        };
      })
    );

    /* ---------------- STONES ---------------- */
    const calculatedStones = await Promise.all(
      stonesData.map(async (stone) => {
        let stoneName = "";
        let stonePurityName = "";

        if (stone.stone_type && mongoose.Types.ObjectId.isValid(stone.stone_type)) {
          const stoneDoc = await StoneType.findById(stone.stone_type);
          stoneName = stoneDoc?.stone_type || stoneDoc?.name || "";
        }

        if (
          stone.stone_purity &&
          mongoose.Types.ObjectId.isValid(stone.stone_purity)
        ) {
          const purityDoc = await stonePurityModel.findById(stone.stone_purity);
          stonePurityName =
            purityDoc?.stone_purity ||
            purityDoc?.purity_name ||
            purityDoc?.name ||
            "";
        }

        const subtotal = calculateStoneSubtotal(stone);

        return {
          stone_id: stone.stone_type,
          stone_type: stoneName,
          stone_purity_id: stone.stone_purity,
          stone_purity: stonePurityName,
          size: parseFloat(stone.size) || 0,
          quantity: parseInt(stone.quantity) || 0,
          weight: parseFloat(stone.weight) || 0,
          price_per_carat: parseFloat(stone.price_per_carat) || 0,
          subtotal,
        };
      })
    );

    /* ---------------- MATERIALS ---------------- */
    const calculatedMaterials = await Promise.all(
      materialsData.map(async (material) => {
        let wastageId = null;
        let wastageName = "";
        let materialId = null;
        let materialName = "";

        if (mongoose.Types.ObjectId.isValid(material.wastage_type)) {
          const wastageDoc = await Wastage.findById(material.wastage_type);
          wastageId = wastageDoc?._id;
          wastageName = wastageDoc?.wastage_type || "";
        } else {
          wastageName = material.wastage_type;
        }

        if (mongoose.Types.ObjectId.isValid(material.material_type)) {
          const materialDoc = await MaterialTypes.findById(material.material_type);
          materialId = materialDoc?._id;
          materialName = materialDoc?.material_type || "";
        } else {
          materialName = material.material_type;
        }

        const weight = parseFloat(material.weight) || 0;
        const rate = parseFloat(material.rate_per_unit) || 0;
        const cost = weight * rate;

        return {
          wastage_id: wastageId,
          wastage_type: wastageName,
          material_id: materialId,
          material_type: materialName,
          weight,
          unit: material.unit || "g",
          rate_per_unit: rate,
          cost,
        };
      })
    );

    /* ---------------- TOTALS ---------------- */
    const total_metals_cost = calculatedMetals.reduce(
      (s, i) => s + (i.subtotal || 0),
      0
    );
    const total_stones_cost = calculatedStones.reduce(
      (s, i) => s + (i.subtotal || 0),
      0
    );
    const total_materials_cost = calculatedMaterials.reduce(
      (s, i) => s + (i.cost || 0),
      0
    );

    const grand_total =
      total_metals_cost + total_stones_cost + total_materials_cost;

    const markup = parseFloat(markup_percentage) || 0;
    const selling_price_before_tax = grand_total * (1 + markup / 100);

    const gst_amount =
      (selling_price_before_tax * extractPercentage(gst_rate)) / 100;
    const selling_price_with_gst =
      selling_price_before_tax + gst_amount;

    /* ---------------- IMAGES ---------------- */
    const imagePaths =
      req.files?.images?.length > 0
        ? req.files.images.map(
            (f) => `/uploads/products/images/${f.filename}`
          )
        : existingProduct.images;

    /* ---------------- UPDATE ---------------- */
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        product_name,
        product_code: product_code || existingProduct.product_code,

        product_brand_id: product_brand,
        product_category_id: product_category,
        product_subcategory_id: product_subcategory,

        product_brand: brandName,
        product_category: categoryName,
        product_subcategory: subcategoryName,

        markup_percentage: markup,
        gst_rate,
        cgst_rate,
        sgst_rate,
        igst_rate,
        utgst_rate,

        metals: calculatedMetals,
        stones: calculatedStones,
        materials: calculatedMaterials,

        total_metals_cost,
        total_stones_cost,
        total_materials_cost,

        gst_amount,
        grand_total,
        selling_price_before_tax,
        selling_price_with_gst,

        images: imagePaths,
      },
      { new: true }
    )
      .populate("product_brand_id", "brand_name name")
      .populate("product_category_id", "category_name name")
      .populate("product_subcategory_id", "sub_category_name name")
      .populate("metals.metal_id", "metal_name name")
      .populate("metals.purity_id", "purity_name")
      .populate("materials.wastage_id", "wastage_type")
      .populate("materials.material_id", "material_type");

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (err) {
    console.error("Update product error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }
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

export const getProducts = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;

    // Build filter object
    const filter = {};

    // Status filter
    if (status && (status === "active" || status === "inactive")) {
      filter.status = status;
    }

    // Search filter (product name or code)
    if (search) {
      filter.$or = [
        { product_name: { $regex: search, $options: "i" } },
        { product_code: { $regex: search, $options: "i" } },
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Fetch products with filters and pagination
    const [products, totalProducts] = await Promise.all([
      Product.find(filter)
        .populate("product_brand_id", "brand_name")
        .populate("product_category_id", "category_name")
        .populate("product_subcategory_id", "sub_category_name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Product.countDocuments(filter),
    ]);

    console.log("Products fetched:", products.length);

    return res.json({
      success: true,
      products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalProducts / parseInt(limit)),
        totalProducts,
        limit: parseInt(limit),
      },
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
