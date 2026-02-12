import mongoose from "mongoose";
import InventoryItem from "../Models/models/InventoryModel.js";
import InventoryCategory from "../Models/models/InventoryCategory.js";
import InventorySubCategory from "../Models/models/inventorySubCategory.js";
import Supplier from "../Models/models/SuppliersModel.js";
import Branch from "../Models/models/Branch.js";
import { generateBarcodeBuffer } from "../utils/barcode.js";
import fs from "fs";
import path from "path";



export const generateItemCode = async () => {
  
  const lastItem = await InventoryItem.findOne(
    { item_code: { $exists: true } },
    { item_code: 1 }
  ).sort({ createdAt: -1 });

  let nextNumber = 1;

  if (lastItem && lastItem.item_code) {
    
    const lastNumber = parseInt(lastItem.item_code.split("-")[1], 10);
    nextNumber = lastNumber + 1;
  }

  
  const newCode = `ITM-${String(nextNumber).padStart(4, "0")}`;

  return newCode;
};

export const createInventoryItem = async (req, res) => {
  try {
    const {
      name,
      category,
      branch,
      sub_category,
      purity,
      description,
      purchase_price,
      profit_margin = 25,
      discount = 0,
      tax = 0,
      supplier,
      status = "active",
    } = req.body;

    const BASE_URL = process.env.APP_URL;

    if (!name || !category || !purchase_price) {
      return res.status(400).json({
        success: false,
        message: "Name, category and purchase price are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    const categoryExists = await InventoryCategory.findById(category);
    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    if (supplier) {
      const supplierExists = await Supplier.findById(supplier);
      if (!supplierExists) {
        return res.status(404).json({
          success: false,
          message: "Supplier not found",
        });
      }
    }

    const item_code = await generateItemCode();

  let imageUrls = [];

if (req.files && req.files.length > 0) {
  imageUrls = req.files.map(
    (file) => `${BASE_URL}/uploads/inventory/${file.filename}`
  );
}

    // ================= PRICE CALCULATION =================
    const basePrice = Number(purchase_price);
    const profitAmount = basePrice * (profit_margin / 100);
    const priceAfterProfit = basePrice + profitAmount;
    const discount_amount = priceAfterProfit * (discount / 100);
    const priceAfterDiscount = priceAfterProfit - discount_amount;
    const tax_amount = priceAfterDiscount * (tax / 100);
    const final_price = priceAfterDiscount + tax_amount;

    // ================= BARCODE =================
    const barcodeBuffer = await generateBarcodeBuffer(item_code);

    const barcodeDir = "uploads/barcodes";
    if (!fs.existsSync(barcodeDir)) {
      fs.mkdirSync(barcodeDir, { recursive: true });
    }

    const barcodeFileName = `${item_code}.png`;
    const barcodePath = path.join(barcodeDir, barcodeFileName);
    fs.writeFileSync(barcodePath, barcodeBuffer);

    const barcodeUrl = `${BASE_URL}/uploads/barcodes/${barcodeFileName}`;

    // ================= SAVE ITEM =================
    const item = await InventoryItem.create({
      item_code,
      name: name.trim(),
      branch,
      category,
      sub_category: sub_category || null,
      purity,
      description,
      purchase_price: basePrice,
      profit_margin,
      discount,
      tax,
      discount_amount,
      tax_amount,
      final_price,
      supplier: supplier || null,
       images: imageUrls, // ✅ FIXED
      barcode: barcodeUrl,
      status,
      created_by: req.user?._id || null,
    });

    const populatedItem = await InventoryItem.findById(item._id)
      .populate("supplier", "supplier_name phone email address")
      .populate("category", "name")
      .populate("sub_category", "name")
      .populate("branch", "branch_name");

    return res.status(201).json({
      success: true,
      message: "Inventory item created successfully",
      data: {
        ...populatedItem._doc,
        fullImageUrls: populatedItem.images || [],
      },
    });

  } catch (err) {
    console.error("Create Inventory Error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }
};







export const getInventoryItems = async (req, res) => {
  try {
    const { search, status } = req.query;

    const query = {};

  
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    
    if (status) {
      query.status = status;
    }

    const items = await InventoryItem.find(query)
      .populate({
        path: "supplier",
        select: "name address mobile email"
      })
      .populate({
        path: "category",
        select: "name"
      })
      .populate({
        path: "sub_category",
        select: "name"
      })
      .populate({
        path:"branch",
        select:"branch_name"
      })
  //       .populate({
  //   path:"created_by",
  //   select:"full_name"
  // })
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, message: "Inventory items fetched successfully", data: items});

  } catch (err) {
    console.error("Get Inventory Error:", err);return res.status(500).json({success: false,message: err.message || "Internal server error"});
  }
};



export const getInventoryPagination = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      category,
      supplier
    } = req.query;

    const query = {};
    console.log(query,"query")

   
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    if (status) {
      query.status = status;
    }

    if (category) {
      query.category = category;
    }

    if (supplier) {
      query.supplier = supplier;
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const total = await InventoryItem.countDocuments(query);
    console.log(total,"total")

    const items = await InventoryItem.find(query)
      .populate({
        path: "supplier",
      select: "supplier_name phone email address " 
      })
      .populate({
        path: "category",
        select: "name"
      })
      .populate({
        path: "sub_category",
        select: "name"
      })
      .populate({
        path:"branch",
        select:"branch_name"
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    return res.status(200).json({ success: true,message: "Inventory items fetched successfully",data: {  data: items, totalDocs: total,
        limit: limitNum,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum),
        hasPrevPage: pageNum > 1,
        hasNextPage: pageNum < Math.ceil(total / limitNum)
      }
    });

  } catch (err) {
    console.error("Get Inventory Pagination Error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Internal server error"
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



// export const updateInventoryItem = async (req, res) => {
//   try {
//     const { id } = req.params;
//     console.log(id,"id")

//     const {
//       name,
//       category,
//       sub_category,
//       branch,
//       purity,
//       description,
//       purchase_price,
//       profit_margin = 25,
//       discount = 0,
//       tax = 0,
//       supplier,
//       status = "active"
//     } = req.body;
//     console.log(req.body,"req.body")

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ success: false,message: "Invalid inventory item ID"});
//     }

//     const itemExists = await InventoryItem.findById(id);
//     if (!itemExists) {
//       return res.status(404).json({success: false,message: "Inventory item not found"});
//     }



// let barcodeUrl = itemExists.barcode;


// const regenerateBarcode = req.body.regenerate_barcode === "true";

// if (!barcodeUrl || regenerateBarcode) {
//   const barcodeBuffer = await generateBarcodeBuffer(itemExists.item_code);

//   const barcodeDir = "uploads/barcodes";
//   if (!fs.existsSync(barcodeDir)) {
//     fs.mkdirSync(barcodeDir, { recursive: true });
//   }

//   const barcodeFileName = `${itemExists.item_code}.png`;
//   const barcodePath = path.join(barcodeDir, barcodeFileName);

//   fs.writeFileSync(barcodePath, barcodeBuffer);

//   // barcodeUrl = `${req.protocol}://${req.get("host")}/uploads/barcodes/${barcodeFileName}`;
//   const barcodeUrl = `${BASE_URL}/uploads/barcodes/${barcodeFileName}`;
// }









//     if (category && !mongoose.Types.ObjectId.isValid(category)) {
//       return res.status(400).json({success: false,message: "Invalid category ID"});
//     }

//     if (sub_category && !mongoose.Types.ObjectId.isValid(sub_category)) {
//       return res.status(400).json({success: false,message: "Invalid sub category ID"});
//     }


//     if (branch && !mongoose.Types.ObjectId.isValid(branch)) {
//   return res.status(400).json({
//     success: false,
//     message: "Invalid branch ID"
//   });
// }


// if (branch) {
//   const branchExists = await Branch.findById(branch);
//   if (!branchExists) {
//     return res.status(404).json({
//       success: false,
//       message: "Branch not found"
//     });
//   }
// }


//     if (category) {
//       const categoryExists = await InventoryCategory.findById(category);
//       if (!categoryExists) {
//         return res.status(404).json({success: false,message: "Category not found"});
//       }
//     }

//     if (sub_category) {
//       const subCatExists = await InventorySubCategory.findById(sub_category);
//       if (!subCatExists) {
//         return res.status(404).json({ success: false, message: "SubCategory not found"});
//       }
//     }

//     if (supplier) {
//       const supplierExists = await Supplier.findById(supplier);
//       if (!supplierExists) {
//         return res.status(404).json({success: false,message: "Supplier not found"  });
//       }
//     }

 
//     let imageUrl = null;
//     console.log(imageUrl,"imageUrl")
//     if (req.file) {
//       // imageUrl = `${req.protocol}://${req.get("host")}/uploads/inventory/${req.file.filename}`;
//       imageUrl = `${BASE_URL}/uploads/inventory/${req.file.filename}`;
//     }

 
//     let selling_price,
//       discount_amount,
//       tax_amount,
//       final_price;

//     if (purchase_price !== undefined) {
//       const basePrice = Number(purchase_price);
//       selling_price = basePrice * (1 + profit_margin / 100);
//       discount_amount = selling_price * (discount / 100);
//       const priceAfterDiscount = selling_price - discount_amount;
//       tax_amount = priceAfterDiscount * (tax / 100);
//       final_price = priceAfterDiscount + tax_amount;
//     }

 
//     const updateData = {
//       ...(name && { name: name.trim() }),
//       ...(category && { category }),
//       ...(sub_category !== undefined && { sub_category: sub_category || null }),

      
//   ...(branch !== undefined && { branch: branch || null }),
//       ...(purity !== undefined && { purity }),
//       ...(description !== undefined && { description }),
//       ...(purchase_price !== undefined && { purchase_price: Number(purchase_price) }),
//       ...(profit_margin !== undefined && { profit_margin }),
//       ...(discount !== undefined && { discount }),
//       ...(tax !== undefined && { tax }),
//       ...(selling_price !== undefined && { selling_price }),
//       ...(discount_amount !== undefined && { discount_amount }),
//       ...(tax_amount !== undefined && { tax_amount }),
//       ...(final_price !== undefined && { final_price }),
//       ...(supplier !== undefined && { supplier: supplier || null }),
//       ...(status && { status }),
//       ...(barcodeUrl && { barcode: barcodeUrl }),
//     };

   

//     if (imageUrl) {
//       updateData.images = [imageUrl];
//     }

//     const updatedItem = await InventoryItem.findByIdAndUpdate(
//       id,
//       updateData,
//       { new: true, runValidators: true }
//     )
//       .populate({
//         path: "supplier",
//         select: "supplier_name supplier_code phone email address"
//       })
//       .populate({
//         path: "category",
//         select: "name"
//       })
//       .populate({
//         path: "sub_category",
//         select: "name"
//       })
//       .populate({
//         path:"branch",
//         select:"branc_name"
//       })

//     return res.status(200).json({success: true,message: "Inventory item updated successfully",data: updatedItem});

//   } catch (err) {
//     console.error("Update Inventory Error:", err);
//     return res.status(500).json({success: false,message: err.message || "Internal server error"});
//   }
// };
export const updateInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid inventory item ID",
      });
    }

    const existingItem = await InventoryItem.findById(id);
    if (!existingItem) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found",
      });
    }

    const BASE_URL = process.env.APP_URL;

    const {
      name,
      category,
      branch,
      sub_category,
      purity,
      description,
      purchase_price,
      profit_margin,
      discount,
      tax,
      supplier,
      status,
    } = req.body;

    /* ================= IMAGE HANDLE ================= */
    let imageUrls = existingItem.images || [];

    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map(
        (file) => `${BASE_URL}/uploads/inventory/${file.filename}`
      );
    }

    /* ================= PRICE RECALC ================= */
    let updateData = {
      ...(name && { name: name.trim() }),
      ...(category && { category }),
      ...(branch !== undefined && { branch: branch || null }),
      ...(sub_category !== undefined && { sub_category: sub_category || null }),
      ...(purity !== undefined && { purity }),
      ...(description !== undefined && { description }),
      ...(supplier !== undefined && { supplier: supplier || null }),
      ...(status && { status }),
      images: imageUrls,
    };

    if (purchase_price !== undefined) {
      const basePrice = Number(purchase_price);
      const profit = basePrice * ((profit_margin ?? existingItem.profit_margin) / 100);
      const afterProfit = basePrice + profit;
      const discountAmt = afterProfit * ((discount ?? existingItem.discount) / 100);
      const afterDiscount = afterProfit - discountAmt;
      const taxAmt = afterDiscount * ((tax ?? existingItem.tax) / 100);
      const finalPrice = afterDiscount + taxAmt;

      updateData = {
        ...updateData,
        purchase_price: basePrice,
        profit_margin: profit_margin ?? existingItem.profit_margin,
        discount: discount ?? existingItem.discount,
        tax: tax ?? existingItem.tax,
        discount_amount: discountAmt,
        tax_amount: taxAmt,
        final_price: finalPrice,
      };
    }

    const updatedItem = await InventoryItem.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate("supplier", "supplier_name phone email address")
      .populate("category", "name")
      .populate("sub_category", "name")
      .populate("branch", "branch_name");

    return res.status(200).json({
      success: true,
      message: "Inventory item updated successfully",
      data: {
        ...updatedItem._doc,
        fullImageUrls: updatedItem.images || [],
      },
    });

  } catch (err) {
    console.error("Update Inventory Error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }
};
