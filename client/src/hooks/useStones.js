import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "@/api/api";

export default function useStones() {
  const [stones, setStones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [stoneTypes, setStoneTypes] = useState([]);
  const [stonePurities, setStonePurities] = useState([]);

  // Helper function to normalize API response data
  const normalizeResponseData = useCallback((data, fieldName) => {
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
  }, []);

  // Fetch stone types for dropdown
  const fetchStoneTypes = useCallback(async () => {
    try {
      const url = API_ENDPOINTS.getAllStoneTypes();
      console.log("Fetching stone types from:", url);
      
      const res = await axios.get(url);
      console.log("Stone Types API Response:", res.data);
      
      const stonesData = normalizeResponseData(res.data, 'stones');
      
      const typeSet = new Set();
      stonesData.forEach(stone => {
        if (stone.stone_type && stone.stone_type.trim() !== "") {
          typeSet.add(stone.stone_type.trim());
        }
      });
      
      const uniqueTypes = Array.from(typeSet).map((type, index) => ({
        _id: `type-${index + 1}`,
        name: type,
      }));
      
      console.log("Unique stone types extracted:", uniqueTypes);
      setStoneTypes(uniqueTypes);
      return uniqueTypes;
      
    } catch (err) {
      console.error("Fetch stone types error:", err);
      setStoneTypes([]); // Set empty array on error
      return [];
    }
  }, [normalizeResponseData]);

  // Fetch stone purities for dropdown
  const fetchStonePurities = useCallback(async () => {
    try {
      const url = API_ENDPOINTS.getAllStonePurities();
      console.log("Fetching stone purities from:", url);
      
      const res = await axios.get(url);
      console.log("Stone Purities API Response:", res.data);
      
      // Check response structure
      let puritiesData = [];
      
      if (res.data && res.data.success) {
        if (Array.isArray(res.data.purity)) {
          puritiesData = res.data.purity;
        } else if (res.data.purity && typeof res.data.purity === 'object') {
          puritiesData = [res.data.purity];
        }
      } else if (Array.isArray(res.data)) {
        puritiesData = res.data;
      } else if (Array.isArray(res.data?.data)) {
        puritiesData = res.data.data;
      } else if (Array.isArray(res.data?.purities)) {
        puritiesData = res.data.purities;
      }
      
      console.log("Extracted puritiesData:", puritiesData);
      
      const puritySet = new Set();
      puritiesData.forEach(item => {
        if (item.stone_purity && item.stone_purity.trim() !== "") {
          puritySet.add(item.stone_purity.trim());
        }
      });
      
      const uniquePurities = Array.from(puritySet).map((purity, index) => ({
        _id: `purity-${index + 1}`,
        name: purity,
      }));
      
      console.log("Unique stone purities extracted:", uniquePurities);
      setStonePurities(uniquePurities);
      return uniquePurities;
      
    } catch (err) {
      console.error("Fetch stone purities error:", err);
      setStonePurities([]); // Set empty array on error
      return [];
    }
  }, []);

  // Fetch all stones
  const fetchStones = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      
      const url = API_ENDPOINTS.getAllStones();
      console.log("Fetching complete stones from:", url);
      
      const res = await axios.get(url);
      console.log("Stones API Response:", res.data);
      
      const stonesData = normalizeResponseData(res.data, 'stones');
      
      const mappedStones = stonesData.map((s) => ({
        _id: s._id || s.id,
        stone_name: s.stone_name || "",
        stone_type: s.stone_type || "",
        stone_purity: s.stone_purity || "",
        stone_price: s.stone_price || s.selling_price || s.cost_price || 0,
        stone_image: s.stone_image || s.image || "",
      }));
      
      console.log("Fetched stones:", mappedStones);
      setStones(mappedStones);
      return mappedStones;
    } catch (err) {
      console.error("Fetch stones error:", err);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || "Failed to load stones";
      setError(errorMsg);
      setStones([]); // Set empty array on error
      return [];
    } finally {
      setLoading(false);
    }
  }, [normalizeResponseData]);

  // Add new stone
  const addStone = useCallback(async (stoneData, imageFile) => {
    const formData = new FormData();
    formData.append("stone_name", stoneData.stone_name);
    formData.append("stone_type", stoneData.stone_type);
    formData.append("stone_purity", stoneData.stone_purity);
    formData.append("stone_price", stoneData.stone_price);
    
    if (imageFile) {
      formData.append("stone_image", imageFile);
    }

    try {
      setLoading(true);
      setError("");
      
      const url = API_ENDPOINTS.createStone();
      console.log("Adding stone to:", url);
      console.log("Stone data:", stoneData);
      
      const res = await axios.post(url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      console.log("Add response:", res.data);
      
      let newStone = {};
      if (res.data && res.data.success && res.data.stone) {
        const stoneFromApi = res.data.stone;
        newStone = {
          _id: stoneFromApi._id,
          stone_name: stoneFromApi.stone_name || stoneData.stone_name,
          stone_type: stoneFromApi.stone_type || stoneData.stone_type,
          stone_purity: stoneFromApi.stone_purity || stoneData.stone_purity,
          stone_price: stoneFromApi.stone_price || stoneData.stone_price,
          stone_image: stoneFromApi.stone_image || "",
        };
      } else if (res.data && res.data.success) {
        newStone = {
          _id: res.data._id || `temp-${Date.now()}`,
          stone_name: res.data.stone_name || stoneData.stone_name,
          stone_type: res.data.stone_type || stoneData.stone_type,
          stone_purity: res.data.stone_purity || stoneData.stone_purity,
          stone_price: res.data.stone_price || stoneData.stone_price,
          stone_image: res.data.stone_image || "",
        };
      } else {
        // Fallback
        newStone = {
          _id: `temp-${Date.now()}`,
          stone_name: stoneData.stone_name,
          stone_type: stoneData.stone_type,
          stone_purity: stoneData.stone_purity,
          stone_price: stoneData.stone_price,
          stone_image: "",
        };
      }
      
      console.log("New stone added:", newStone);
      setStones(prev => [...prev, newStone]);
      
      // Refresh dropdown data after adding
      await fetchStonePurities();
      await fetchStoneTypes();
      
      return newStone;
    } catch (err) {
      console.error("Add error:", err.response?.data || err.message);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || "Failed to add stone";
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [fetchStonePurities, fetchStoneTypes]);

  // Update stone
  const updateStone = useCallback(async (id, data) => {
    const formData = new FormData();
    formData.append("stone_name", data.stone_name);
    formData.append("stone_type", data.stone_type);
    formData.append("stone_purity", data.stone_purity);
    formData.append("stone_price", data.stone_price);
    
    if (data.imageFile) {
      formData.append("stone_image", data.imageFile);
    }

    try {
      setLoading(true);
      setError("");
      
      const url = API_ENDPOINTS.updateStone(id);
      console.log("Updating stone at:", url);
      console.log("Update data:", data);
      
      const res = await axios.put(url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      console.log("Update response:", res.data);
      
      let updatedData = {};
      if (res.data && res.data.success && res.data.stone) {
        const stoneFromApi = res.data.stone;
        updatedData = {
          _id: stoneFromApi._id || id,
          stone_name: stoneFromApi.stone_name || data.stone_name,
          stone_type: stoneFromApi.stone_type || data.stone_type,
          stone_purity: stoneFromApi.stone_purity || data.stone_purity,
          stone_price: stoneFromApi.stone_price || data.stone_price,
          stone_image: stoneFromApi.stone_image || "",
        };
      } else if (res.data && res.data.success) {
        updatedData = {
          _id: res.data._id || id,
          stone_name: res.data.stone_name || data.stone_name,
          stone_type: res.data.stone_type || data.stone_type,
          stone_purity: res.data.stone_purity || data.stone_purity,
          stone_price: res.data.stone_price || data.stone_price,
          stone_image: res.data.stone_image || "",
        };
      } else {
        // Fallback
        updatedData = {
          _id: id,
          stone_name: data.stone_name,
          stone_type: data.stone_type,
          stone_purity: data.stone_purity,
          stone_price: data.stone_price,
          stone_image: "",
        };
      }
      
      console.log("Updated stone:", updatedData);
      setStones(prev => prev.map(s => (s._id === id ? updatedData : s)));
      
      // Refresh dropdown data after updating
      await fetchStonePurities();
      await fetchStoneTypes();
      
      return updatedData;
    } catch (err) {
      console.error("Update error:", err);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || "Failed to update stone";
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [fetchStonePurities, fetchStoneTypes]);

  // Delete stone
  const deleteStone = useCallback(async (id) => {
    try {
      setLoading(true);
      setError("");
      
      const url = API_ENDPOINTS.deleteStone(id);
      console.log("Deleting stone at:", url);
      
      await axios.delete(url);
      setStones(prev => prev.filter((s) => s._id !== id));
      
      // Refresh dropdown data after deleting
      await fetchStonePurities();
      await fetchStoneTypes();
      
    } catch (err) {
      console.error("Delete error:", err);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || "Failed to delete stone";
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [fetchStonePurities, fetchStoneTypes]);

  // Refresh all data
  const refreshData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      console.log("Refreshing all data...");
      
      await Promise.all([
        fetchStoneTypes(),
        fetchStonePurities(),
        fetchStones()
      ]);
      
      console.log("Data refresh completed");
    } catch (err) {
      console.error("Refresh error:", err);
      setError("Failed to refresh data");
    } finally {
      setLoading(false);
    }
  }, [fetchStoneTypes, fetchStonePurities, fetchStones]);

  // Initial data fetch
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Debug state changes
  useEffect(() => {
    console.log("STATE UPDATE - stonePurities:", stonePurities);
    console.log("STATE UPDATE - stoneTypes:", stoneTypes);
    console.log("STATE UPDATE - stones count:", stones.length);
  }, [stonePurities, stoneTypes, stones]);

  return {
    stones,
    stoneTypes,
    stonePurities,
    loading,
    error,
    addStone,
    updateStone,
    deleteStone,
    refreshData,
    fetchStones,
    fetchStoneTypes,
    fetchStonePurities,
  };
}