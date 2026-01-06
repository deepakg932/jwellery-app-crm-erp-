// import { useState, useEffect } from "react";
// import axios from "axios";
// import { API_ENDPOINTS } from "@/api/api";

// export default function useInventoryCategories() {
//   const [categories, setCategories] = useState([]);
//   const [metals, setMetals] = useState([]);
//   const [materialTypes, setMaterialTypes] = useState([]);
//   const [stoneTypes, setStoneTypes] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   // Helper function to get ID
//   const getId = (item) => item._id || item.id;

//   // Fetch metals
//   const fetchMetals = async () => {
//     try {
//       setLoading(true);
//       const res = await axios.get(API_ENDPOINTS.getMetals());
      
//       let metalsData = [];
      
//       if (res.data && res.data.success && Array.isArray(res.data.data)) {
//         metalsData = res.data.data;
//       } else if (Array.isArray(res.data)) {
//         metalsData = res.data;
//       } else if (res.data && Array.isArray(res.data.metals)) {
//         metalsData = res.data.metals;
//       }
      
//       const mappedMetals = metalsData.map((metal) => ({
//         id: getId(metal._id || metal),
//         name: metal.name || "",
//         type: "metal",
//         ...metal
//       }));
      
//       setMetals(mappedMetals);
//       return mappedMetals;
//     } catch (err) {
//       console.error("Fetch metals error:", err);
//       setError("Failed to load metals");
//       return [];
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fetch material types
//   const fetchMaterialTypes = async () => {
//     try {
//       setLoading(true);
//       const res = await axios.get(API_ENDPOINTS.getMaterialTypes());
      
//       let materialsData = [];
      
//       if (res.data && res.data.success && Array.isArray(res.data.data)) {
//         materialsData = res.data.data;
//       } else if (Array.isArray(res.data)) {
//         materialsData = res.data;
//       }
      
//       const mappedMaterials = materialsData.map((material) => ({
//         id: getId(material._id || material),
//         material_type: material.material_type || material.name || "",
//         metal_name: material.metal_id?.name || "",
//         name: material.material_type || material.name || "",
//         type: "material",
//         ...material
//       }));
      
//       setMaterialTypes(mappedMaterials);
//       return mappedMaterials;
//     } catch (err) {
//       console.error("Fetch material types error:", err);
//       setError("Failed to load material types");
//       return [];
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fetch stone types
//   const fetchStoneTypes = async () => {
//     try {
//       setLoading(true);
//       const res = await axios.get(API_ENDPOINTS.getAllStoneTypes());
      
//       let stonesData = [];
      
//       if (res.data && res.data.success && Array.isArray(res.data.data)) {
//         stonesData = res.data.data;
//       } else if (Array.isArray(res.data)) {
//         stonesData = res.data;
//       } else if (res.data && Array.isArray(res.data.stones)) {
//         stonesData = res.data.stones;
//       }
      
//       const mappedStones = stonesData.map((stone) => ({
//         id: getId(stone._id || stone),
//         name: stone.name || stone.stone_type || "",
//         stone_type: stone.stone_type || stone.name || "",
//         type: "stone",
//         ...stone
//       }));
      
//       setStoneTypes(mappedStones);
//       return mappedStones;
//     } catch (err) {
//       console.error("Fetch stone types error:", err);
//       setError("Failed to load stone types");
//       return [];
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fetch inventory categories
//   const fetchInventoryCategories = async () => {
//     try {
//       setLoading(true);
//       const res = await axios.get(API_ENDPOINTS.getInventoryCategories());
      
//       let categoriesData = [];
      
//       if (res.data && res.data.success && Array.isArray(res.data.data)) {
//         categoriesData = res.data.data;
//       } else if (Array.isArray(res.data)) {
//         categoriesData = res.data;
//       } else if (res.data && Array.isArray(res.data.categories)) {
//         categoriesData = res.data.categories;
//       }
      
//       const mappedCategories = categoriesData.map((cat) => {
//         // Find what type of material is selected
//         let materialName = "";
//         let materialType = "";
        
//         if (cat.metals && cat.metals.length > 0) {
//           materialName = cat.metals[0]?.metal_id?.name || "Metal";
//           materialType = "metal";
//         } else if (cat.materials && cat.materials.length > 0) {
//           materialName = cat.materials[0]?.material_id?.material_type || "Material";
//           materialType = "material";
//         } else if (cat.stones && cat.stones.length > 0) {
//           materialName = cat.stones[0]?.stone_id?.stone_type || "Stone";
//           materialType = "stone";
//         }
        
//         return {
//           _id: getId(cat),
//           name: cat.name || "",
//           metals: cat.metals || [],
//           stones: cat.stones || [],
//           materials: cat.materials || [],
//           material_name: materialName,
//           material_type: materialType,
//           status: cat.status || true,
//           createdAt: cat.createdAt || "",
//           updatedAt: cat.updatedAt || "",
//           ...cat
//         };
//       });
      
//       setCategories(mappedCategories);
//       return mappedCategories;
//     } catch (err) {
//       console.error("Fetch inventory categories error:", err);
//       setError("Failed to load inventory categories");
//       return [];
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Helper function to get material name for display
//   const getMaterialName = (category) => {
//     if (!category) return "No Material Assigned";
    
//     if (category.metals && category.metals.length > 0) {
//       return category.metals[0]?.metal_id?.name || "Metal";
//     }
    
//     if (category.materials && category.materials.length > 0) {
//       return category.materials[0]?.material_id?.material_type || "Material";
//     }
    
//     if (category.stones && category.stones.length > 0) {
//       return category.stones[0]?.stone_id?.stone_type || "Stone";
//     }
    
//     return "No Material Assigned";
//   };

//   // Helper to get the material ID from category
//   const getMaterialIdFromCategory = (category) => {
//     if (category.metals && category.metals.length > 0) {
//       return category.metals[0]?.metal_id?._id || "";
//     }
    
//     if (category.materials && category.materials.length > 0) {
//       return category.materials[0]?.material_id?._id || "";
//     }
    
//     if (category.stones && category.stones.length > 0) {
//       return category.stones[0]?.stone_id?._id || "";
//     }
    
//     return "";
//   };

//   // Add inventory category
//   const addInventoryCategory = async (categoryData) => {
//     try {
//       setLoading(true);
      
//       // Your backend expects just the ID in material_type field
//       const payload = {
//         name: categoryData.name,
//         material_type: categoryData.material_type // Just send the ID string
//       };
      
//       console.log("Sending payload to backend:", payload);
      
//       const res = await axios.post(API_ENDPOINTS.createInventoryCategory(), payload);
//       console.log("Add inventory category response:", res.data);
      
//       let newCategory = {};
      
//       if (res.data && res.data.success && res.data.data) {
//         const category = res.data.data;
//         const materialName = getMaterialName(category);
        
//         newCategory = {
//           _id: getId(category),
//           name: category.name || "",
//           metals: category.metals || [],
//           stones: category.stones || [],
//           materials: category.materials || [],
//           material_name: materialName,
//           status: category.status || true,
//         };
//       } else if (res.data && res.data.data) {
//         const category = res.data.data;
//         newCategory = {
//           _id: getId(category),
//           name: category.name || "",
//           metals: category.metals || [],
//           stones: category.stones || [],
//           materials: category.materials || [],
//         };
//       } else {
//         newCategory = {
//           _id: `temp-${Date.now()}`,
//           name: categoryData.name,
//           metals: [],
//           stones: [],
//           materials: []
//         };
//       }
      
//       setCategories(prev => [...prev, newCategory]);
//       await fetchInventoryCategories();
      
//       return newCategory;
//     } catch (err) {
//       console.error("Add inventory category error:", err);
//       setError("Failed to add inventory category");
//       throw err;
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Update inventory category
//   const updateInventoryCategory = async (id, data) => {
//     try {
//       setLoading(true);
      
//       // Your backend expects just the ID in material_type field
//       const payload = {
//         name: data.name,
//         material_type: data.material_type // Just send the ID string
//       };
      
//       console.log("Update payload to backend:", payload);
      
//       const res = await axios.put(API_ENDPOINTS.updateInventoryCategory(id), payload);
//       console.log("Update inventory category response:", res.data);
      
//       let updatedData = {};
//       if (res.data && res.data.success && res.data.data) {
//         const category = res.data.data;
//         const materialName = getMaterialName(category);
        
//         updatedData = {
//           _id: getId(category) || id,
//           name: category.name || data.name,
//           metals: category.metals || [],
//           stones: category.stones || [],
//           materials: category.materials || [],
//           material_name: materialName,
//           status: category.status || true,
//         };
//       } else if (res.data && res.data.data) {
//         const category = res.data.data;
//         updatedData = {
//           _id: getId(category) || id,
//           name: category.name || data.name,
//           metals: category.metals || [],
//           stones: category.stones || [],
//           materials: category.materials || [],
//         };
//       } else {
//         updatedData = {
//           _id: id,
//           name: data.name,
//           metals: [],
//           stones: [],
//           materials: []
//         };
//       }
      
//       setCategories(prev => 
//         prev.map((cat) => (cat._id === id ? updatedData : cat))
//       );
      
//       await fetchInventoryCategories();
      
//       return updatedData;
//     } catch (err) {
//       console.error("Update inventory category error:", err);
//       setError("Failed to update inventory category");
//       throw err;
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Delete inventory category
//   const deleteInventoryCategory = async (id) => {
//     try {
//       setLoading(true);
      
//       await axios.delete(API_ENDPOINTS.deleteInventoryCategory(id));
      
//       setCategories(prev => prev.filter((cat) => cat._id !== id));
//       await fetchInventoryCategories();
      
//     } catch (err) {
//       console.error("Delete inventory category error:", err);
//       setError("Failed to delete inventory category");
//       throw err;
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fetch all data on initial load
//   const fetchAllData = async () => {
//     try {
//       setLoading(true);
//       await Promise.all([
//         fetchMetals(), 
//         fetchMaterialTypes(),
//         fetchStoneTypes(),
//         fetchInventoryCategories()
//       ]);
//     } catch (err) {
//       console.error("Error fetching data:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchAllData();
//   }, []);

//   return {
//     categories,
//     metals,
//     materialTypes,
//     stoneTypes,
//     loading,
//     error,
//     addInventoryCategory,
//     updateInventoryCategory,
//     deleteInventoryCategory,
//     getMaterialName,
//     getMaterialIdFromCategory,
//     getId,
//   };
// }


import { useState, useEffect } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "@/api/api";

export default function useInventoryCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Helper function to get ID
  const getId = (item) => item._id || item.id;

  // Fetch inventory categories
  const fetchInventoryCategories = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_ENDPOINTS.getInventoryCategories());
      
      let categoriesData = [];
      
      // Multiple response format handling
      if (res.data && res.data.success && Array.isArray(res.data.data)) {
        categoriesData = res.data.data;
      } else if (Array.isArray(res.data)) {
        categoriesData = res.data;
      } else if (res.data && Array.isArray(res.data.categories)) {
        categoriesData = res.data.categories;
      } else if (res.data && Array.isArray(res.data.data)) {
        categoriesData = res.data.data;
      }
      
      const mappedCategories = categoriesData.map((cat) => ({
        _id: getId(cat),
        name: cat.name || "",
        description: cat.description || "",
        category_code: cat.category_code || "",
        status: cat.status !== undefined ? cat.status : true,
        createdAt: cat.createdAt || "",
        updatedAt: cat.updatedAt || "",
      }));
      
      setCategories(mappedCategories);
      return mappedCategories;
    } catch (err) {
      console.error("Fetch inventory categories error:", err);
      setError("Failed to load inventory categories");
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Add inventory category
  const addInventoryCategory = async (categoryData) => {
    try {
      setLoading(true);
      
      // Prepare payload based on your API
      const payload = {
        name: categoryData.name,
        ...(categoryData.description && { description: categoryData.description })
      };
      
      const res = await axios.post(API_ENDPOINTS.createInventoryCategory(), payload);
      
      let newCategory = {};
      
      if (res.data && res.data.success && res.data.data) {
        const category = res.data.data;
        
        newCategory = {
          _id: getId(category),
          name: category.name || categoryData.name,
          description: category.description || categoryData.description || "",
          category_code: category.category_code || "",
          status: category.status !== undefined ? category.status : true,
          createdAt: category.createdAt || new Date().toISOString(),
          updatedAt: category.updatedAt || new Date().toISOString(),
        };
      } else if (res.data && res.data.data) {
        const category = res.data.data;
        newCategory = {
          _id: getId(category),
          name: category.name || categoryData.name,
          description: category.description || categoryData.description || "",
          category_code: category.category_code || "",
          status: true,
        };
      } else {
        // Fallback for API that doesn't return data
        newCategory = {
          _id: `temp-${Date.now()}`,
          name: categoryData.name,
          description: categoryData.description || "",
          status: true,
        };
      }
      
      // Update local state
      setCategories(prev => [...prev, newCategory]);
      
      // Refresh from server
      await fetchInventoryCategories();
      
      return newCategory;
    } catch (err) {
      console.error("Add inventory category error:", err);
      setError(err.response?.data?.message || "Failed to add inventory category");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update inventory category
  const updateInventoryCategory = async (id, data) => {
    try {
      setLoading(true);
      
      const payload = {
        name: data.name,
        ...(data.description && { description: data.description })
      };
      
      const res = await axios.put(API_ENDPOINTS.updateInventoryCategory(id), payload);
      
      let updatedData = {};
      if (res.data && res.data.success && res.data.data) {
        const category = res.data.data;
        
        updatedData = {
          _id: getId(category) || id,
          name: category.name || data.name,
          description: category.description || data.description || "",
          category_code: category.category_code || "",
          status: category.status !== undefined ? category.status : true,
          updatedAt: category.updatedAt || new Date().toISOString(),
        };
      } else {
        updatedData = {
          _id: id,
          name: data.name,
          description: data.description || "",
        };
      }
      
      // Update local state
      setCategories(prev => 
        prev.map((cat) => (cat._id === id ? { ...cat, ...updatedData } : cat))
      );
      
      // Refresh from server
      await fetchInventoryCategories();
      
      return updatedData;
    } catch (err) {
      console.error("Update inventory category error:", err);
      setError(err.response?.data?.message || "Failed to update inventory category");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete inventory category
  const deleteInventoryCategory = async (id) => {
    try {
      setLoading(true);
      
      await axios.delete(API_ENDPOINTS.deleteInventoryCategory(id));
      
      // Update local state
      setCategories(prev => prev.filter((cat) => cat._id !== id));
      
      // Refresh from server
      await fetchInventoryCategories();
      
    } catch (err) {
      console.error("Delete inventory category error:", err);
      setError(err.response?.data?.message || "Failed to delete inventory category");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchInventoryCategories();
  }, []);

  return {
    categories,
    loading,
    error,
    addInventoryCategory,
    updateInventoryCategory,
    deleteInventoryCategory,
    fetchInventoryCategories, // For manual refresh
  };
}