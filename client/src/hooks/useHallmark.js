import { useState, useEffect } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "@/api/api";

export default function useHallmark() {
  const [hallmarks, setHallmarks] = useState([]);
  const [metalTypes, setMetalTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch metal types for dropdown
  const fetchMetalTypes = async () => {
    try {
      const res = await axios.get(API_ENDPOINTS.getMetals());
      console.log("Metal Types API Response:", res.data);
      
      let metalsData = [];
      
      if (Array.isArray(res.data)) {
        metalsData = res.data;
      } else if (Array.isArray(res.data.metals)) {
        metalsData = res.data.metals;
      } else if (res.data && res.data.success && Array.isArray(res.data.metals)) {
        metalsData = res.data.metals;
      } else if (res.data && Array.isArray(res.data.data)) {
        metalsData = res.data.data;
      }
      
      const mappedMetals = metalsData.map((metal) => ({
        id: metal._id || metal.id,
        name: metal.name || "",
      }));
      
      console.log("Fetched metal types:", mappedMetals);
      setMetalTypes(mappedMetals);
      return mappedMetals;
    } catch (err) {
      console.error("Fetch metal types error:", err);
      return [];
    }
  };

  // Fetch all hallmarks
  const fetchHallmarks = async (availableMetalTypes = []) => {
    try {
      setLoading(true);
      const res = await axios.get(API_ENDPOINTS.getHallmarks());
      console.log("Hallmarks API Response:", res.data);
      
      let hallmarkData = [];
      
      if (Array.isArray(res.data)) {
        hallmarkData = res.data;
      } else if (Array.isArray(res.data.hallmarks)) {
        hallmarkData = res.data.hallmarks;
      } else if (res.data && res.data.success && Array.isArray(res.data.hallmarks)) {
        hallmarkData = res.data.hallmarks;
      } else if (res.data && Array.isArray(res.data.data)) {
        hallmarkData = res.data.data;
      }
      
      // Enrich data with metal names using the provided metalTypes
      const enrichedHallmarks = enrichHallmarkData(hallmarkData, availableMetalTypes);
      
      console.log("Fetched hallmarks:", enrichedHallmarks);
      setHallmarks(enrichedHallmarks);
    } catch (err) {
      console.error("Fetch hallmarks error:", err);
      setError("Failed to load hallmarks");
    } finally {
      setLoading(false);
    }
  };

  // Helper to enrich hallmark data with names
  const enrichHallmarkData = (hallmarkData, metals = []) => {
    // Create map for quick lookup
    const metalMap = {};
    metals.forEach(metal => {
      metalMap[metal.id] = metal.name;
    });
    
    console.log("Metal map for enrichment:", metalMap);
    
    return hallmarkData.map((hallmark) => {
      const metalName = metalMap[hallmark.metal_type] || "Unknown Metal";
      
      return {
        _id: hallmark._id || hallmark.id,
        name: hallmark.name || "",
        metal_type: hallmark.metal_type || "",
        metal_type_name: metalName,
        description: hallmark.description || "",
        imageUrl: hallmark.fullImageUrl || hallmark.image || "",
      };
    });
  };

  // Add hallmark
  const addHallmark = async (hallmarkData) => {
    const formData = new FormData();
    formData.append("name", hallmarkData.name);
    formData.append("metal_type", hallmarkData.metal_type);
    formData.append("description", hallmarkData.description || "");
    if (hallmarkData.imageFile) formData.append("image", hallmarkData.imageFile);

    try {
      setLoading(true);
      const res = await axios.post(API_ENDPOINTS.createHallmark(), formData);
      console.log("Add hallmark response:", res.data);
      
      let newHallmark = {};
      
      // Find the metal name from current metalTypes state
      const metalName = metalTypes.find(m => m.id === hallmarkData.metal_type)?.name || "Unknown Metal";
      
      if (res.data && res.data.success && res.data.hallmark) {
        newHallmark = {
          _id: res.data.hallmark._id || res.data.hallmark.id,
          name: res.data.hallmark.name || hallmarkData.name,
          metal_type: res.data.hallmark.metal_type || hallmarkData.metal_type,
          metal_type_name: metalName,
          description: res.data.hallmark.description || hallmarkData.description || "",
          imageUrl: res.data.hallmark.fullImageUrl || res.data.hallmark.image || "",
        };
      } else if (res.data) {
        newHallmark = {
          _id: res.data._id || res.data.id,
          name: res.data.name || hallmarkData.name,
          metal_type: res.data.metal_type || hallmarkData.metal_type,
          metal_type_name: metalName,
          description: res.data.description || hallmarkData.description || "",
          imageUrl: res.data.fullImageUrl || res.data.image || "",
        };
      } else {
        newHallmark = {
          _id: `temp-${Date.now()}`,
          name: hallmarkData.name,
          metal_type: hallmarkData.metal_type,
          metal_type_name: metalName,
          description: hallmarkData.description || "",
          imageUrl: "",
        };
      }
      
      // Update state
      setHallmarks(prev => [...prev, newHallmark]);
      return newHallmark;
    } catch (err) {
      console.error("Add hallmark error:", err);
      setError("Failed to add hallmark");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update hallmark
  const updateHallmark = async (id, data) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("metal_type", data.metal_type);
    formData.append("description", data.description || "");
    if (data.imageFile) formData.append("image", data.imageFile);

    try {
      setLoading(true);
      console.log("Updating hallmark with ID:", id, "Data:", data);
      
      const res = await axios.put(API_ENDPOINTS.updateHallmark(id), formData);
      console.log("Update hallmark response:", res.data);
      
      // Find the metal name from current metalTypes state
      const metalName = metalTypes.find(m => m.id === data.metal_type)?.name || "Unknown Metal";
      
      let updatedData = {};
      if (res.data && res.data.success && res.data.hallmark) {
        updatedData = {
          _id: res.data.hallmark._id || res.data.hallmark.id || id,
          name: res.data.hallmark.name || data.name,
          metal_type: res.data.hallmark.metal_type || data.metal_type,
          metal_type_name: metalName,
          description: res.data.hallmark.description || data.description || "",
          imageUrl: res.data.hallmark.fullImageUrl || res.data.hallmark.image || "",
        };
      } else if (res.data) {
        updatedData = {
          _id: res.data._id || res.data.id || id,
          name: res.data.name || data.name,
          metal_type: res.data.metal_type || data.metal_type,
          metal_type_name: metalName,
          description: res.data.description || data.description || "",
          imageUrl: res.data.fullImageUrl || res.data.image || "",
        };
      } else {
        updatedData = {
          _id: id,
          name: data.name,
          metal_type: data.metal_type,
          metal_type_name: metalName,
          description: data.description || "",
          imageUrl: "",
        };
      }
      
      setHallmarks(prev => 
        prev.map((hallmark) => (hallmark._id === id ? updatedData : hallmark))
      );
      
      return updatedData;
    } catch (err) {
      console.error("Update hallmark error:", err);
      setError("Failed to update hallmark");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete hallmark
  const deleteHallmark = async (id) => {
    try {
      setLoading(true);
      await axios.delete(API_ENDPOINTS.deleteHallmark(id));
      setHallmarks(prev => prev.filter((hallmark) => hallmark._id !== id));
    } catch (err) {
      console.error("Delete hallmark error:", err);
      setError("Failed to delete");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Refresh all data
  const refreshHallmarks = async () => {
    const metals = await fetchMetalTypes();
    await fetchHallmarks(metals);
  };

  // Fetch all data on initial load
  const fetchAllData = async () => {
    try {
      setLoading(true);
      // Fetch metal types first, then use them to fetch and enrich hallmarks
      const metals = await fetchMetalTypes();
      await fetchHallmarks(metals);
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
    hallmarks,
    metalTypes,
    loading,
    error,
    addHallmark,
    updateHallmark,
    deleteHallmark,
    refreshHallmarks,
    fetchHallmarks,
    fetchMetalTypes,
  };
}