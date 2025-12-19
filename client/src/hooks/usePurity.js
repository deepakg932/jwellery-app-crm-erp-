import { useState, useEffect } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "@/api/api";

export default function usePurity() {
  const [purities, setPurities] = useState([]);
  const [metalTypes, setMetalTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch metal types for dropdown from API
  const fetchMetalTypes = async () => {
    try {
      // Using API_ENDPOINTS instead of hardcoded URL
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
      return [];
    }
  };

  // Fetch all purities
  const fetchPurities = async () => {
    try {
      setLoading(true);
      
      // Using API_ENDPOINTS instead of hardcoded URL
      const res = await axios.get(API_ENDPOINTS.getPurities());
      console.log("Purities API Response:", res.data);
      
      let purityData = [];
      
      // Handle different response structures
      if (Array.isArray(res.data)) {
        purityData = res.data;
      } else if (Array.isArray(res.data.purity)) {
        purityData = res.data.purity;
      } else if (res.data && res.data.success && Array.isArray(res.data.purity)) {
        purityData = res.data.purity;
      } else if (res.data && Array.isArray(res.data.data)) {
        purityData = res.data.data;
      }
      
      // Map to ensure consistent structure
      const mappedPurities = purityData.map((purity) => ({
        _id: purity._id || purity.id,
        purity_name: purity.purity_name || "",
        metal_type: purity.metal_type || "",
        percentage: purity.percentage || 0,
        imageUrl: purity.fullImageUrl || purity.image || "",
      }));
      
      console.log("Fetched purities:", mappedPurities);
      setPurities(mappedPurities);
    } catch (err) {
      console.error("Fetch purities error:", err);
      setError("Failed to load purities");
    } finally {
      setLoading(false);
    }
  };

  // Add purity
  const addPurity = async (purityData) => {
    const formData = new FormData();
    formData.append("purity_name", purityData.purity_name);
    formData.append("metal_type", purityData.metal_type);
    formData.append("percentage", purityData.percentage);
    if (purityData.imageFile) formData.append("image", purityData.imageFile);

    try {
      setLoading(true);
      
      // Using API_ENDPOINTS instead of hardcoded URL
      const res = await axios.post(API_ENDPOINTS.createPurity(), formData);
      console.log("Add purity response:", res.data);
      
      let newPurity = {};
      
      if (res.data && res.data.success && res.data.purity) {
        newPurity = {
          _id: res.data.purity._id || res.data.purity.id,
          purity_name: res.data.purity.purity_name || purityData.purity_name,
          metal_type: res.data.purity.metal_type || purityData.metal_type,
          percentage: res.data.purity.percentage || purityData.percentage,
          imageUrl: res.data.purity.fullImageUrl || res.data.purity.image || "",
        };
      } else if (res.data) {
        newPurity = {
          _id: res.data._id || res.data.id,
          purity_name: res.data.purity_name || purityData.purity_name,
          metal_type: res.data.metal_type || purityData.metal_type,
          percentage: res.data.percentage || purityData.percentage,
          imageUrl: res.data.fullImageUrl || res.data.image || "",
        };
      } else {
        newPurity = {
          _id: `temp-${Date.now()}`,
          purity_name: purityData.purity_name,
          metal_type: purityData.metal_type,
          percentage: purityData.percentage,
          imageUrl: "",
        };
      }
      
      setPurities(prev => [...prev, newPurity]);
      return newPurity;
    } catch (err) {
      console.error("Add purity error:", err);
      setError("Failed to add purity");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update purity
  const updatePurity = async (id, data) => {
    const formData = new FormData();
    formData.append("purity_name", data.purity_name);
    formData.append("metal_type", data.metal_type);
    formData.append("percentage", data.percentage);
    if (data.imageFile) formData.append("image", data.imageFile);

    try {
      setLoading(true);
      console.log("Updating purity with ID:", id, "Data:", data);
      
      // Using API_ENDPOINTS instead of hardcoded URL
      const res = await axios.put(API_ENDPOINTS.updatePurity(id), formData);
      console.log("Update purity response:", res.data);
      
      let updatedData = {};
      if (res.data && res.data.success && res.data.purity) {
        updatedData = {
          _id: res.data.purity._id || res.data.purity.id || id,
          purity_name: res.data.purity.purity_name || data.purity_name,
          metal_type: res.data.purity.metal_type || data.metal_type,
          percentage: res.data.purity.percentage || data.percentage,
          imageUrl: res.data.purity.fullImageUrl || res.data.purity.image || "",
        };
      } else if (res.data) {
        updatedData = {
          _id: res.data._id || res.data.id || id,
          purity_name: res.data.purity_name || data.purity_name,
          metal_type: res.data.metal_type || data.metal_type,
          percentage: res.data.percentage || data.percentage,
          imageUrl: res.data.fullImageUrl || res.data.image || "",
        };
      } else {
        updatedData = {
          _id: id,
          purity_name: data.purity_name,
          metal_type: data.metal_type,
          percentage: data.percentage,
          imageUrl: "",
        };
      }
      
      setPurities(prev => 
        prev.map((purity) => (purity._id === id ? updatedData : purity))
      );
      
      return updatedData;
    } catch (err) {
      console.error("Update purity error:", err);
      setError("Failed to update purity");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete purity
  const deletePurity = async (id) => {
    try {
      setLoading(true);
      
      // Using API_ENDPOINTS instead of hardcoded URL
      await axios.delete(API_ENDPOINTS.deletePurity(id));
      setPurities(prev => prev.filter((purity) => purity._id !== id));
    } catch (err) {
      console.error("Delete purity error:", err);
      setError("Failed to delete");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Refresh purities (manual refresh)
  const refreshPurities = async () => {
    await fetchPurities();
  };

  // Refresh metal types (manual refresh)
  const refreshMetalTypes = async () => {
    await fetchMetalTypes();
  };

  // Fetch all data on initial load
  const fetchAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchMetalTypes(), fetchPurities()]);
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
    purities,
    metalTypes,
    loading,
    error,
    addPurity,
    updatePurity,
    deletePurity,
    refreshPurities,
    refreshMetalTypes,
    fetchPurities,
    fetchMetalTypes,
  };
}