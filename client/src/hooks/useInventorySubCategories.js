// hooks/useInventorySubCategories.js
import { useState, useEffect } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "@/api/api";

export default function useInventorySubCategories() {
  const [subCategories, setSubCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Helper function to get ID
  const getId = (item) => item._id || item.id;

  // Fetch all categories for dropdown
  const fetchCategories = async () => {
    try {
      const res = await axios.get(API_ENDPOINTS.getInventoryCategories());
      
      let categoriesData = [];
      
      // Handle different response formats
      if (res.data && res.data.success && Array.isArray(res.data.data)) {
        categoriesData = res.data.data;
      } else if (Array.isArray(res.data)) {
        categoriesData = res.data;
      } else if (res.data && Array.isArray(res.data.categories)) {
        categoriesData = res.data.categories;
      } else if (res.data && res.data.data && Array.isArray(res.data.data.data)) {
        // Handle paginated response format
        categoriesData = res.data.data.data;
      }
      
      const mappedCategories = categoriesData.map((cat) => ({
        _id: getId(cat),
        name: cat.name || "",
        description: cat.description || "",
        category_code: cat.category_code || "",
      }));
      
      setCategories(mappedCategories);
      return mappedCategories;
    } catch (err) {
      console.error("Fetch categories error:", err);
      setError("Failed to load categories");
      return [];
    }
  };

  // Fetch all sub-categories
  const fetchSubCategories = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_ENDPOINTS.getInventorySubCategories());
      
      let subCategoriesData = [];
      
      console.log("API Response:", res.data); // Debug log
      
      // Handle the nested response structure
      if (res.data && res.data.success && res.data.data && Array.isArray(res.data.data.data)) {
        subCategoriesData = res.data.data.data;
      } else if (res.data && res.data.success && Array.isArray(res.data.data)) {
        subCategoriesData = res.data.data;
      } else if (Array.isArray(res.data)) {
        subCategoriesData = res.data;
      } else if (res.data && Array.isArray(res.data.subCategories)) {
        subCategoriesData = res.data.subCategories;
      } else if (res.data && Array.isArray(res.data.data)) {
        subCategoriesData = res.data.data;
      }
      
      console.log("Processed sub-categories data:", subCategoriesData); // Debug log
      
      const mappedSubCategories = subCategoriesData.map((subCat) => ({
        _id: getId(subCat),
        name: subCat.name || "",
        description: subCat.description || "",
        category: subCat.category || null,
        category_name: subCat.category?.name || "Uncategorized",
        category_id: subCat.category?._id || "",
        status: subCat.status !== undefined ? subCat.status : true,
      }));
      
      setSubCategories(mappedSubCategories);
      return mappedSubCategories;
    } catch (err) {
      console.error("Fetch sub-categories error:", err);
      setError("Failed to load sub-categories");
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Add new sub-category
  const addSubCategory = async (subCategoryData) => {
    try {
      setLoading(true);
      
      const payload = {
        name: subCategoryData.name,
        description: subCategoryData.description || "",
        category: subCategoryData.category,
      };
      
      console.log("Adding sub-category with payload:", payload);
      
      const res = await axios.post(API_ENDPOINTS.createInventorySubCategory(), payload);
      
      console.log("Add sub-category response:", res.data);
      
      let newSubCategory = {};
      
      if (res.data && res.data.success && res.data.data) {
        const subCat = res.data.data;
        newSubCategory = {
          _id: getId(subCat),
          name: subCat.name || subCategoryData.name,
          description: subCat.description || subCategoryData.description || "",
          category: subCat.category || subCategoryData.category,
          category_name: categories.find(c => c._id === subCategoryData.category)?.name || "",
        };
      } else {
        // Fallback if response structure is different
        newSubCategory = {
          _id: `temp-${Date.now()}`,
          name: subCategoryData.name,
          description: subCategoryData.description || "",
          category: subCategoryData.category,
          category_name: categories.find(c => c._id === subCategoryData.category)?.name || "",
        };
      }
      
      // Update local state immediately
      setSubCategories(prev => [...prev, newSubCategory]);
      
      // Refresh from server
      await fetchSubCategories();
      
      return newSubCategory;
    } catch (err) {
      console.error("Add sub-category error:", err);
      setError(err.response?.data?.message || "Failed to add sub-category");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update sub-category
  const updateSubCategory = async (id, data) => {
    try {
      setLoading(true);
      
      const payload = {
        name: data.name,
        description: data.description || "",
        category: data.category,
      };
      
      console.log("Updating sub-category with payload:", payload);
      
      const res = await axios.put(API_ENDPOINTS.updateInventorySubCategory(id), payload);
      
      console.log("Update sub-category response:", res.data);
      
      let updatedData = {};
      if (res.data && res.data.success && res.data.data) {
        const subCat = res.data.data;
        updatedData = {
          _id: getId(subCat) || id,
          name: subCat.name || data.name,
          description: subCat.description || data.description || "",
          category: subCat.category || data.category,
          category_name: categories.find(c => c._id === data.category)?.name || "",
          status: subCat.status !== undefined ? subCat.status : true,
        };
      } else {
        updatedData = {
          _id: id,
          name: data.name,
          description: data.description || "",
          category: data.category,
          category_name: categories.find(c => c._id === data.category)?.name || "",
        };
      }
      
      // Update local state
      setSubCategories(prev => 
        prev.map((subCat) => (subCat._id === id ? { ...subCat, ...updatedData } : subCat))
      );
      
      // Refresh from server
      await fetchSubCategories();
      
      return updatedData;
    } catch (err) {
      console.error("Update sub-category error:", err);
      setError(err.response?.data?.message || "Failed to update sub-category");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete sub-category
  const deleteSubCategory = async (id) => {
    try {
      setLoading(true);
      
      console.log("Deleting sub-category ID:", id);
      
      await axios.delete(API_ENDPOINTS.deleteInventorySubCategory(id));
      
      // Update local state
      setSubCategories(prev => prev.filter((subCat) => subCat._id !== id));
      
      // Refresh from server
      await fetchSubCategories();
      
      console.log("Sub-category deleted successfully");
      
    } catch (err) {
      console.error("Delete sub-category error:", err);
      setError(err.response?.data?.message || "Failed to delete sub-category");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Fetch all data
  const fetchAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchCategories(),
        fetchSubCategories()
      ]);
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
    categories,
    loading,
    error,
    addSubCategory,
    updateSubCategory,
    deleteSubCategory,
    fetchSubCategories,
  };
}