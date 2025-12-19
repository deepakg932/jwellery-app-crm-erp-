import { useState, useEffect } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "@/api/api";

export default function useSubCategories() {
  const [subCategories, setSubCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch parent categories for dropdown
  const fetchCategories = async () => {
    try {
      // Using API_ENDPOINTS instead of hardcoded URL
      const res = await axios.get(API_ENDPOINTS.getCategories());
      console.log("Parent Categories API Response:", res.data);
      
      let categoriesData = [];
      
      // Handle different response structures
      if (Array.isArray(res.data)) {
        categoriesData = res.data;
      } else if (Array.isArray(res.data.categories)) {
        categoriesData = res.data.categories;
      } else if (res.data && res.data.success && Array.isArray(res.data.categories)) {
        categoriesData = res.data.categories;
      } else if (res.data && Array.isArray(res.data.data)) {
        categoriesData = res.data.data;
      }
      
      // Map to ensure consistent structure
      const mappedCategories = categoriesData.map((cat) => ({
        id: cat._id || cat.id,
        name: cat.categoryName || cat.name || "",
      }));
      
      console.log("Fetched parent categories:", mappedCategories);
      setCategories(mappedCategories);
      return mappedCategories;
    } catch (err) {
      console.error("Fetch parent categories error:", err);
      return [];
    }
  };

  // Fetch sub-categories and enrich with category names
  const fetchSubCategories = async (categoriesList) => {
    try {
      setLoading(true);
      
      // Using API_ENDPOINTS instead of hardcoded URL
      const res = await axios.get(API_ENDPOINTS.getSubCategories());
      console.log("Sub-Categories API Response:", res.data);
      
      let subCategoriesData = [];
      
      // Handle different response structures
      if (Array.isArray(res.data)) {
        subCategoriesData = res.data;
      } else if (Array.isArray(res.data.subcategories)) {
        subCategoriesData = res.data.subcategories;
      } else if (res.data && res.data.success && Array.isArray(res.data.subcategories)) {
        subCategoriesData = res.data.subcategories;
      } else if (res.data && Array.isArray(res.data.data)) {
        subCategoriesData = res.data.data;
      }
      
      // Create a map of category IDs to names for quick lookup
      const categoryMap = {};
      if (categoriesList && categoriesList.length > 0) {
        categoriesList.forEach(cat => {
          categoryMap[cat.id] = cat.name;
        });
      }
      
      // Map to ensure consistent structure - match your API response
      const mappedSubCategories = subCategoriesData.map((subCat) => ({
        _id: subCat._id || subCat.id,
        name: subCat.name || "",
        category_id: subCat.category_id || "",
        categoryName: categoryMap[subCat.category_id] || "Unknown Category",
        imageUrl: subCat.fullImageUrl || subCat.image || "", // Use fullImageUrl if available
      }));
      
      console.log("Fetched sub-categories with enriched data:", mappedSubCategories);
      setSubCategories(mappedSubCategories);
    } catch (err) {
      console.error("Fetch sub-categories error:", err);
      setError("Failed to load sub-categories");
    } finally {
      setLoading(false);
    }
  };

  // Add sub-category
  const addSubCategory = async (subCategoryData) => {
    const formData = new FormData();
    formData.append("name", subCategoryData.name);
    formData.append("category_id", subCategoryData.category_id);
    if (subCategoryData.imageFile) formData.append("image", subCategoryData.imageFile);

    try {
      setLoading(true);
      
      // Using API_ENDPOINTS instead of hardcoded URL
      const res = await axios.post(API_ENDPOINTS.createSubCategory(), formData);
      console.log("Add sub-category response:", res.data);
      
      let newSubCategory = {};
      
      // Handle your API response structure: {success: true, subcategory: {...}}
      if (res.data && res.data.success && res.data.subcategory) {
        // Your API response structure
        newSubCategory = {
          _id: res.data.subcategory._id,
          name: res.data.subcategory.name,
          category_id: res.data.subcategory.category_id,
          categoryName: "", // Will be populated from categories list
          imageUrl: res.data.subcategory.fullImageUrl || res.data.subcategory.image || "",
        };
      } else if (res.data) {
        // Fallback structure
        newSubCategory = {
          _id: res.data._id || res.data.id,
          name: res.data.name,
          category_id: res.data.category_id,
          categoryName: "",
          imageUrl: res.data.fullImageUrl || res.data.image || "",
        };
      } else {
        // Fallback - create a temporary object
        newSubCategory = {
          _id: `temp-${Date.now()}`,
          name: subCategoryData.name,
          category_id: subCategoryData.category_id,
          categoryName: "",
          imageUrl: "",
        };
      }
      
      // Find category name for the new sub-category
      const parentCategory = categories.find(cat => cat.id === subCategoryData.category_id);
      if (parentCategory) {
        newSubCategory.categoryName = parentCategory.name;
      }
      
      console.log("New sub-category to add:", newSubCategory);
      setSubCategories(prev => [...prev, newSubCategory]);
      return newSubCategory;
    } catch (err) {
      console.error("Add sub-category error:", err);
      setError("Failed to add sub-category");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update sub-category
  const updateSubCategory = async (id, data) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("category_id", data.category_id);
    if (data.imageFile) formData.append("image", data.imageFile);

    try {
      setLoading(true);
      console.log("Updating sub-category with ID:", id, "Data:", data);
      
      // Using API_ENDPOINTS instead of hardcoded URL
      const res = await axios.put(API_ENDPOINTS.updateSubCategory(id), formData);
      console.log("Update sub-category response:", res.data);
      
      let updatedData = {};
      // Handle your API response structure
      if (res.data && res.data.success && res.data.subcategory) {
        // Your API response structure
        updatedData = {
          _id: res.data.subcategory._id || id,
          name: res.data.subcategory.name || data.name,
          category_id: res.data.subcategory.category_id || data.category_id,
          categoryName: "", // Will be populated from categories list
          imageUrl: res.data.subcategory.fullImageUrl || res.data.subcategory.image || "",
        };
      } else if (res.data) {
        // Fallback structure
        updatedData = {
          _id: res.data._id || res.data.id || id,
          name: res.data.name || data.name,
          category_id: res.data.category_id || data.category_id,
          categoryName: "",
          imageUrl: res.data.fullImageUrl || res.data.image || "",
        };
      } else {
        // Fallback
        updatedData = {
          _id: id,
          name: data.name,
          category_id: data.category_id,
          categoryName: "",
          imageUrl: "",
        };
      }
      
      // Find category name for the updated sub-category
      const parentCategory = categories.find(cat => cat.id === data.category_id);
      if (parentCategory) {
        updatedData.categoryName = parentCategory.name;
      }
      
      setSubCategories(prev => 
        prev.map((subCat) => (subCat._id === id ? updatedData : subCat))
      );
      
      console.log("Updated sub-category data:", updatedData);
      return updatedData;
    } catch (err) {
      console.error("Update sub-category error:", err);
      setError("Failed to update sub-category");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete sub-category
  const deleteSubCategory = async (id) => {
    try {
      setLoading(true);
      
      // Using API_ENDPOINTS instead of hardcoded URL
      await axios.delete(API_ENDPOINTS.deleteSubCategory(id));
      setSubCategories(prev => prev.filter((subCat) => subCat._id !== id));
    } catch (err) {
      console.error("Delete sub-category error:", err);
      setError("Failed to delete");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Fetch both sub-categories and parent categories on initial load
  const fetchAllData = async () => {
    try {
      setLoading(true);
      // First fetch categories
      const categoriesList = await fetchCategories();
      // Then fetch sub-categories with the categories list
      await fetchSubCategories(categoriesList);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  return {
    subCategories,
    categories, // Return parent categories for dropdown
    loading,
    error,
    addSubCategory,
    updateSubCategory,
    deleteSubCategory,
    fetchSubCategories: () => fetchSubCategories(categories), // Pass current categories
    fetchCategories,
  };
}