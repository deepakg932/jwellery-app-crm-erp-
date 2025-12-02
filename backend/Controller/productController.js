import Product from "../models/models/Product.js";
import ProductImage from "../models/models/ProductImage.js";

export const createProduct = async (req, res) => {
  try {
    const {
      sku,
      barcode,
      name,
      category_id,
      subcategory_id,
      purity_id,
      metaltype,
      grossweight,
      net_weight,
      stoneweight,
      wastage,
       stone_type,   
      makingcharge,
      stone_charge,
      certificationno,
      cost_price,
      mrp,
      branch_id,
      status
    } = req.body;

    
    const product = await Product.create({
      sku,
      barcode,
      name,
      category_id,
      subcategory_id,
      purity_id,
      metaltype,
      grossweight,
      net_weight,
      stoneweight,
      stone_type,
      wastage,
      makingcharge,
      stone_charge,
      certificationno,
      cost_price,
      mrp,
      branch_id,
      status
    });

    console.log("Product created:", product);

    if (req.files && req.files.length > 0) {
      const images = req.files.map((file) => ({
        product_id: product._id,
        imagepath: "/uploads/products/" + file.filename
      }));

      await ProductImage.insertMany(images);
    }

   return res.status(200).json({ success: true, message: "Product created successfully", product });

  } catch (err) {
    console.error(err);
   return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find().populate('category_id subcategory_id purity_id branch_id');
    console.log("Products fetched:", products);
   return res.json({ success: true, products });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id, "Product ID to fetch");
    const product = await Product.findById(id).populate('category_id subcategory_id purity_id branch_id');
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
   return res.json({ success: true, product });
  } catch (err) {
    console.error(err);
   return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id, "Product ID to update");
    const updateData = req.body;
    const product = await Product.findByIdAndUpdate(id, updateData, { new: true });
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
      return res.status(404).json({ success: false, message: "Product not found" });
    }
   return res.json({ success: true, message: "Product deleted successfully" });
  } catch (err) {
    console.error(err);
   return res.status(500).json({ success: false, message: "Server error", error: err.message });
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
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};
export const deleteProductImage = async (req, res) => {
  try {
    const { imageId } = req.params;
    console.log(imageId, "Image ID to delete");
    const image = await ProductImage.findByIdAndDelete(imageId);
    if (!image) {
      return res.status(404).json({ success: false, message: "Image not found" });
    }
    return res.json({ success: true, message: "Image deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};
