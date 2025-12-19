import { useState, useEffect } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "@/api/api";

export default function useStonesType() {
  const [stones, setStones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Helper function to normalize API response data
  const normalizeResponseData = (data, fieldName) => {
    if (!data) return [];
    
    if (Array.isArray(data)) {
      return data;
    } else if (Array.isArray(data?.[fieldName])) {
      return data[fieldName];
    } else if (data?.success && Array.isArray(data[fieldName])) {
      return data[fieldName];
    } else if (Array.isArray(data?.data)) {
      return data.data;
    }
    return [];
  };

  const fetchStones = async () => {
    try {
      setLoading(true);
      
      const url = API_ENDPOINTS.getAllStoneTypes();
      console.log("Fetching stone types from:", url);
      
      const res = await axios.get(url);
      console.log("API Response:", res.data);
      
      const stonesData = normalizeResponseData(res.data, 'stones');
      
      const mappedStones = stonesData.map((s) => ({
        _id: s._id || s.id,
        stone_type: s.stone_type || s.name || "",
        stone_image: s.stone_image || s.image || s.imageUrl || "",
      }));
      
      console.log("Fetched stone types:", mappedStones);
      setStones(mappedStones);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to load stone types");
    } finally {
      setLoading(false);
    }
  };

  const addStone = async (stoneData, imageFile) => {
    const formData = new FormData();
    formData.append("stone_type", stoneData.stone_type);
    if (imageFile) formData.append("stone_image", imageFile);

    try {
      setLoading(true);
      
      const url = API_ENDPOINTS.createStoneType();
      console.log("Creating stone type at:", url);
      
      const res = await axios.post(url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      console.log("Add response:", res.data);
      
      let newStone = {};
      if (res.data && res.data.success && res.data.stone) {
        newStone = {
          _id: res.data.stone._id,
          stone_type: res.data.stone.stone_type || stoneData.stone_type,
          stone_image: res.data.stone.stone_image || "",
        };
      } else if (res.data) {
        newStone = {
          _id: res.data._id,
          stone_type: res.data.stone_type || stoneData.stone_type,
          stone_image: res.data.stone_image || "",
        };
      } else {
        // Fallback
        newStone = {
          _id: `temp-${Date.now()}`,
          stone_type: stoneData.stone_type,
          stone_image: "",
        };
      }
      
      console.log("New stone type added:", newStone);
      setStones(prev => [...prev, newStone]);
      return newStone;
    } catch (err) {
      console.error("Add error:", err);
      setError("Failed to add stone type");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateStone = async (id, data) => {
    const formData = new FormData();
    formData.append("stone_type", data.stone_type);
    if (data.imageFile) formData.append("stone_image", data.imageFile);

    try {
      setLoading(true);
      
      const url = API_ENDPOINTS.updateStoneType(id);
      console.log("Updating stone type at:", url);
      
      const res = await axios.put(url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      console.log("Update response:", res.data);
      
      let updatedData = {};
      if (res.data && res.data.success && res.data.stone) {
        updatedData = {
          _id: res.data.stone._id || id,
          stone_type: res.data.stone.stone_type || data.stone_type,
          stone_image: res.data.stone.stone_image || "",
        };
      } else if (res.data) {
        updatedData = {
          _id: res.data._id || id,
          stone_type: res.data.stone_type || data.stone_type,
          stone_image: res.data.stone_image || "",
        };
      } else {
        // Fallback
        updatedData = {
          _id: id,
          stone_type: data.stone_type,
          stone_image: "",
        };
      }
      
      setStones(prev => prev.map(s => (s._id === id ? updatedData : s)));
      console.log("Updated stone type:", updatedData);
      return updatedData;
    } catch (err) {
      console.error("Update error:", err);
      setError("Failed to update stone type");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteStone = async (id) => {
    try {
      setLoading(true);
      
      const url = API_ENDPOINTS.deleteStoneType(id);
      console.log("Deleting stone type at:", url);
      
      await axios.delete(url);
      setStones(prev => prev.filter((s) => s._id !== id));
    } catch (err) {
      console.error("Delete error:", err);
      setError("Failed to delete stone type");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStones();
  }, []);

  return {
    stones,
    loading,
    error,
    addStone,
    updateStone,
    deleteStone,
    fetchStones,
    refetch: fetchStones,
  };
}