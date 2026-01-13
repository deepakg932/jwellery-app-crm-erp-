import express from "express";
import {
  createSubCategory,
  getAllSubCategories,
  getSubCategoryById,
  updateSubCategory,
  deleteSubCategory,
  getSubCategoriesByCategory,
  toggleSubCategoryStatus
} from "../Controller/inventorySubController.js"

const router = express.Router();


router.post("/create-inventory-sub-category", createSubCategory);
router.get("/get-inventory-sub-categories", getAllSubCategories);
router.get("/:id", getSubCategoryById);
router.put("/update-inventory-sub-category/:id", updateSubCategory);
router.delete("/delete-inventory-sub-category/:id", deleteSubCategory);
router.get("/category/:categoryId", getSubCategoriesByCategory);
router.patch("/:id/toggle-status", toggleSubCategoryStatus);

export default router;