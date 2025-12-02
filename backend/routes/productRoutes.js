
import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductImages,
  deleteProductImage
} from "../Controller/productController.js"

import { authenticate } from '../middleware/auth.js';
import { upload } from "../middleware/upload.js";
import { requirePermission } from "../middleware/authorize.js";

const router = express.Router();

router.get('/', authenticate, requirePermission("products:view"), getProducts);


router.post(
  '/createProduct',
  authenticate,
  requirePermission("products:create"),
  upload.array("images", 5), // "images" = key in Postman, max 5 files
  createProduct
);

router.get('/:id', authenticate, requirePermission("products:view"), getProductById);

router.put('/:id',
  authenticate,
  requirePermission("products:update"),
  updateProduct
);

router.delete('/:id',
  authenticate,
  requirePermission("products:delete"),
  deleteProduct
);

router.get('/:productId/images',
  authenticate,
  requirePermission("products:view"),
  getProductImages
);

router.delete('/images/:imageId',
  authenticate,
  requirePermission("products:delete"),
  deleteProductImage
);

export default router;
