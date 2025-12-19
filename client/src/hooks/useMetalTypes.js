import { useState, useEffect } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "@/api/api";

export default function useMetalTypes() {
  const [metalTypes, setMetalTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchMetalTypes = async () => {
    try {
      setLoading(true);
      
      // Using API_ENDPOINTS instead of hardcoded URL
      const res = await axios.get(API_ENDPOINTS.getMetals());
      console.log("API Response:", res.data);
      
      let metals = [];
      
      // Handle different response structures
      if (Array.isArray(res.data)) {
        // Response is directly an array
        metals = res.data;
      } else if (res.data && Array.isArray(res.data.metals)) {
        // Response structure: {metals: [...]}
        metals = res.data.metals;
      } else if (res.data && Array.isArray(res.data.data)) {
        // Response structure: {data: [...]}
        metals = res.data.data;
      } else if (res.data && res.data.success && Array.isArray(res.data.metals)) {
        // Response structure: {success: true, metals: [...]}
        metals = res.data.metals;
      }
      
      // Map to ensure consistent structure
      const mappedMetals = metals.map((m) => ({
        _id: m._id || m.id,
        name: m.name || "",
        image: m.image || m.imageUrl || "",   // ensure `image` exists
      }));
      
      console.log("Fetched metals:", mappedMetals);
      setMetalTypes(mappedMetals);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to load metal types");
    } finally {
      setLoading(false);
    }
  };

  const addMetalType = async (name, imageFile) => {
    const formData = new FormData();
    formData.append("name", name);
    if (imageFile) formData.append("image", imageFile);

    try {
      setLoading(true);
      
      // Using API_ENDPOINTS instead of hardcoded URL
      const res = await axios.post(API_ENDPOINTS.createMetal(), formData);
      console.log("Add response:", res.data);
      
      let newMetal = {};
      
      // Check for different response structures
      if (res.data && res.data.success && res.data.metal) {
        // Response structure: {success: true, message: '...', metal: {...}}
        newMetal = {
          _id: res.data.metal._id || res.data.metal.id,
          name: res.data.metal.name,
          imageUrl: res.data.metal.imageUrl || res.data.metal.image || "",
        };
      } else if (res.data) {
        // Response structure: {_id: ..., name: ..., imageUrl: ...}
        newMetal = {
          _id: res.data._id || res.data.id,
          name: res.data.name,
          imageUrl: res.data.imageUrl || res.data.image || "",
        };
      } else {
        // Fallback - create a temporary object
        newMetal = {
          _id: `temp-${Date.now()}`,
          name: name,
          image: "",
        };
      }
      
      console.log("New metal to add:", newMetal);
      setMetalTypes(prev => [...prev, newMetal]);
      return newMetal;
    } catch (err) {
      console.error("Add error:", err);
      setError("Failed to add metal type");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateMetalType = async (id, data) => {
    const formData = new FormData();
    formData.append("name", data.name);
    if (data.imageFile) formData.append("image", data.imageFile);

    try {
      setLoading(true);
      console.log("Updating metal with ID:", id, "Data:", data);
      
      // Using API_ENDPOINTS instead of hardcoded URL
      const res = await axios.put(API_ENDPOINTS.updateMetal(id), formData);
      console.log("Update response:", res.data);
      
      // Based on your log: {success: true, message: 'Metal updated successfully', metal: {...}}
      let updatedData = {};
      if (res.data && res.data.success && res.data.metal) {
        // Response has the metal object
        updatedData = {
          _id: res.data.metal._id || res.data.metal.id || id,
          name: res.data.metal.name || data.name,
          image: res.data.metal.image || res.data.metal.imageUrl || "",
        };
      } else if (res.data) {
        // Response might have data directly
        updatedData = {
          _id: res.data._id || res.data.id || id,
          name: res.data.name || data.name,
          imageUrl: res.data.imageUrl || res.data.image || "",
        };
      } else {
        // Fallback
        updatedData = {
          _id: id,
          name: data.name,
          imageUrl: "", // This should come from the server
        };
      }
      
      setMetalTypes(prev => prev.map(m => (m._id === id ? updatedData : m)));
      
      console.log("Updated metal data:", updatedData);
      return updatedData;
    } catch (err) {
      console.error("Update error:", err);
      setError("Failed to update metal type");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteMetalType = async (id) => {
    try {
      setLoading(true);
      
      // Using API_ENDPOINTS instead of hardcoded URL
      await axios.delete(API_ENDPOINTS.deleteMetal(id));
      setMetalTypes(prev => prev.filter((m) => m._id !== id));
    } catch (err) {
      console.error("Delete error:", err);
      setError("Failed to delete");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetalTypes();
  }, []);

  return {
    metalTypes,
    loading,
    error,
    addMetalType,
    updateMetalType,
    deleteMetalType,
    fetchMetalTypes, // Add this to allow manual refresh
  };
}