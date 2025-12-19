import { useState, useEffect } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "@/api/api";

export default function useItemCategories() {
  const [categories, setCategories] = useState([]);
  const [metalTypes, setMetalTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch metal types for dropdown
  const fetchMetalTypes = async () => {
    try {
      setLoading(true);
      
      const res = await axios.get(API_ENDPOINTS.getMetals());
      console.log("Metal Types API Response:", res.data);
      
      let metalsData = [];
      
      // Handle different response structures
      if (Array.isArray(res.data)) {
        metalsData = res.data;
      } else if (Array.isArray(res.data.metals)) {
        metalsData = res.data.metals;
      } else if (res.data && res.data.success && Array.isArray(res.data.metals)) {
        metalsData = res.data.metals;
      } else if (res.data && Array.isArray(res.data.data)) {
        metalsData = res.data.data;
      }
      
      // Map to ensure consistent structure
      const mappedMetals = metalsData.map((metal) => ({
        id: metal._id || metal.id,
        name: metal.name || "",
        imageUrl: metal.fullImageUrl || metal.image || "",
      }));
      
      console.log("Fetched metal types:", mappedMetals);
      setMetalTypes(mappedMetals);
      return mappedMetals;
    } catch (err) {
      console.error("Fetch metal types error:", err);
      setError("Failed to load metal types");
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      
      const res = await axios.get(API_ENDPOINTS.getCategories());
      console.log("Categories GET API Response:", res.data);
      
      let categoriesData = [];
      
      // Handle different response structures based on your API response
      if (res.data && res.data.success && Array.isArray(res.data.categories)) {
        categoriesData = res.data.categories;
      } else if (Array.isArray(res.data)) {
        categoriesData = res.data;
      } else if (Array.isArray(res.data.categories)) {
        categoriesData = res.data.categories;
      } else if (res.data && Array.isArray(res.data.data)) {
        categoriesData = res.data.data;
      }
      
      // Map to ensure consistent structure
      const mappedCategories = categoriesData.map((cat) => ({
        _id: cat._id || cat.id,
        name: cat.name || "",
        metal_type: cat.metal_type || "", // This is the string "gold" from your API
        imageUrl: cat.fullImageUrl || cat.imageUrl || cat.image || "",
        // Add any other fields you need
        ...cat
      }));
      
      console.log("Mapped categories for state:", mappedCategories);
      setCategories(mappedCategories);
      return mappedCategories;
    } catch (err) {
      console.error("Fetch categories error:", err);
      setError("Failed to load categories");
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get metal name by ID
  const getMetalNameById = (metalId) => {
    if (!metalId) return "No Metal Assigned";
    const metal = metalTypes.find(m => m.id === metalId);
    return metal ? metal.name : metalId;
  };

  // Helper function to get metal ID by name (since your API returns metal name string)
  const getMetalIdByName = (metalName) => {
    if (!metalName) return null;
    const metal = metalTypes.find(m => m.name.toLowerCase() === metalName.toLowerCase());
    return metal ? metal.id : metalName;
  };

  // Add category
  const addCategory = async (categoryData) => {
    const formData = new FormData();
    formData.append("name", categoryData.name);
    
    // If metal_type is a metal ID, send it as is
    // If it's a metal name, we should ideally send the ID, but your API seems to accept name
    formData.append("metal_type", categoryData.metal_type);
    
    if (categoryData.imageFile) formData.append("image", categoryData.imageFile);

    try {
      setLoading(true);
      
      const res = await axios.post(API_ENDPOINTS.createCategory(), formData);
      console.log("Add category response:", res.data);
      
      let newCategory = {};
      
      // Use the response structure from your API
      if (res.data && res.data.success && res.data.category) {
        newCategory = {
          _id: res.data.category._id || res.data.category.id,
          name: res.data.category.name || "",
          metal_type: res.data.category.metal_type || categoryData.metal_type || "",
          imageUrl: res.data.category.fullImageUrl || res.data.category.image || "",
        };
      } else if (res.data) {
        newCategory = {
          _id: res.data._id || res.data.id,
          name: res.data.name || "",
          metal_type: res.data.metal_type || categoryData.metal_type || "",
          imageUrl: res.data.fullImageUrl || res.data.image || "",
        };
      } else {
        newCategory = {
          _id: `temp-${Date.now()}`,
          name: categoryData.name,
          metal_type: categoryData.metal_type || "",
          imageUrl: "",
        };
      }
      
      // Update state with new category
      setCategories(prev => [...prev, newCategory]);
      
      // Immediately refetch to get the complete data from server
      await fetchCategories();
      
      return newCategory;
    } catch (err) {
      console.error("Add category error:", err);
      setError("Failed to add category");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update category
  const updateCategory = async (id, data) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("metal_type", data.metal_type);
    if (data.imageFile) formData.append("image", data.imageFile);

    try {
      setLoading(true);
      console.log("Updating category with ID:", id, "Data:", data);
      
      const res = await axios.put(API_ENDPOINTS.updateCategory(id), formData);
      console.log("Update category response:", res.data);
      
      let updatedData = {};
      if (res.data && res.data.success && res.data.category) {
        updatedData = {
          _id: res.data.category._id || res.data.category.id || id,
          name: res.data.category.name || data.name,
          metal_type: res.data.category.metal_type || data.metal_type || "",
          imageUrl: res.data.category.fullImageUrl || res.data.category.image || "",
        };
      } else if (res.data) {
        updatedData = {
          _id: res.data._id || res.data.id || id,
          name: res.data.name || data.name,
          metal_type: res.data.metal_type || data.metal_type || "",
          imageUrl: res.data.fullImageUrl || res.data.image || "",
        };
      } else {
        updatedData = {
          _id: id,
          name: data.name,
          metal_type: data.metal_type || "",
          imageUrl: "",
        };
      }
      
      // Update local state temporarily
      setCategories(prev => 
        prev.map((cat) => (cat._id === id ? updatedData : cat))
      );
      
      // Refetch to ensure we have the latest data from server
      await fetchCategories();
      
      return updatedData;
    } catch (err) {
      console.error("Update category error:", err);
      setError("Failed to update category");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete category
  const deleteCategory = async (id) => {
    try {
      setLoading(true);
      
      await axios.delete(API_ENDPOINTS.deleteCategory(id));
      
      // Remove from local state
      setCategories(prev => prev.filter((cat) => cat._id !== id));
      
      // Refetch to ensure data consistency
      await fetchCategories();
      
    } catch (err) {
      console.error("Delete category error:", err);
      setError("Failed to delete");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Fetch all data on initial load
  const fetchAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchMetalTypes(), fetchCategories()]);
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
    categories,
    metalTypes,
    loading,
    error,
    addCategory,
    updateCategory,
    deleteCategory,
    fetchCategories,
    fetchMetalTypes,
    getMetalNameById,
    getMetalIdByName, // Added this helper
  };
}