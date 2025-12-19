
import express from 'express';
import {
  getProducts,

  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductImages,
  deleteProductImage,unitCreate,getUnits,unitUpdate,unitDelete,
bulkUpdateProductStatus,updateProductStatus
} from "../Controller/productController.js"


import Productupload from '../middleware/Productupload.js';
// import { authenticate } from '../middleware/auth.js';

import { requirePermission } from "../middleware/authorize.js";

const router = express.Router();

// router.get('/', authenticate, requirePermission("products:view"), getProducts);
router.get('/getProducts', getProducts);

router.post(
  '/createProduct',
  // authenticate,
  // requirePermission("products:create"),
Productupload.array("images", 5), // "images" = key in Postman, max 5 files
  createProduct
);




// router.get('/:id', authenticate, requirePermission("products:view"), getProductById);

// router.put('/:id',
//   authenticate,
//   requirePermission("products:update"),
//   updateProduct
// );

router.put(
  "/updateProduct/:id",
 Productupload.array("images", 5), 
  updateProduct
);


// router.delete('/:id',
//   authenticate,
//   requirePermission("products:delete"),
//   deleteProduct
// );


router.delete('/delete-product/:id',deleteProduct);

// router.put('/products/:id/toggle-status', toggleProductStatus); // Toggle single product status
// router.put('/products/bulk-status', bulkUpdateProductStatus); 

// router.get('/:productId/images',
//   authenticate,
//   requirePermission("products:view"),
//   getProductImages
// );

// router.delete('/images/:imageId',
//   authenticate,
//   requirePermission("products:delete"),
//   deleteProductImage
// );


// router.put('/toggle-product-status/:id',toggleProductStatus);
router.put('/updateProduct/:id/update-status', updateProductStatus);
router.put('/getProducts/bulk-status',bulkUpdateProductStatus);

router.post('/create-unit',unitCreate);
router.get('/get-units',getUnits);
router.put('/update-unit/:id',unitUpdate);
router.delete('/delete-unit/:id',unitDelete);
export default router;
