import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "@/api/api";

export default function useStonePurity() {
  const [stonePurities, setStonePurities] = useState([]);
  const [stoneTypes, setStoneTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  // Fetch stone types (for dropdown)
  const fetchStoneTypes = useCallback(async () => {
    try {
      const url = API_ENDPOINTS.getAllStoneTypes();
      console.log("Fetching stone types from:", url);
      
      const res = await axios.get(url);
      console.log("Stone Types API Response:", res.data);
      
      const stonesData = normalizeResponseData(res.data, 'stones');
      
      const uniqueTypes = [...new Set(
        stonesData
          .map(stone => stone.stone_name || stone.stone_type)
          .filter(Boolean)
      )];
      
      const mappedTypes = uniqueTypes.map((type, index) => ({
        id: index,
        name: type,
      }));
      
      setStoneTypes(mappedTypes);
      return mappedTypes;
    } catch (err) {
      console.error("Fetch stone types error:", err);
      return [];
    }
  }, [normalizeResponseData]);

  // Fetch all purities
  const fetchPurities = useCallback(async () => {
    try {
      setLoading(true);
      
      const url = API_ENDPOINTS.getAllStonePurities();
      console.log("Fetching purities from:", url);
      
      const res = await axios.get(url);
      console.log("Purities API Response:", res.data);
      
      // Check if purity is an array or object
      let purityData = [];
      if (res.data && res.data.success) {
        if (Array.isArray(res.data.purity)) {
          purityData = res.data.purity;
        } else if (res.data.purity && typeof res.data.purity === 'object') {
          purityData = [res.data.purity];
        }
      }
      
      console.log("Extracted purityData:", purityData);
      
      const validPurities = purityData.filter(p => 
        (p.stone_purity || p.purity_name) && 
        p.stone_type && 
        p.percentage !== undefined
      );
      
      const mappedPurities = validPurities.map((p) => ({
        _id: p._id || p.id,
        stone_purity: p.stone_purity || p.purity_name || "",
        stone_type: p.stone_type || "",
        percentage: p.percentage || 0,
      }));
      
      console.log("Mapped purities:", mappedPurities);
      setStonePurities(mappedPurities);
      return mappedPurities;
    } catch (err) {
      console.error("Fetch purities error:", err);
      setError("Failed to load purities");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Combined fetch function
  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      await Promise.all([fetchStoneTypes(), fetchPurities()]);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }, [fetchStoneTypes, fetchPurities]);

  // Add stone purity - FIXED VERSION
  const addStonePurity = useCallback(async (purityData) => {
    try {
      setLoading(true);
      setError("");
      
      const payload = {
        stone_purity: purityData.stone_purity.trim(),
        stone_type: purityData.stone_type,
        percentage: Number(purityData.percentage),
      };
      
      const url = API_ENDPOINTS.createStonePurity();
      console.log("Sending POST to:", url);
      console.log("Payload:", payload);
      
      const res = await axios.post(url, payload, {
        headers: { 'Content-Type': 'application/json' },
      });
      
      console.log("Add response:", res.data);
      
      let newPurity = {};
      
      // Handle both array and object responses
      if (res.data && res.data.success && res.data.purity) {
        const purityFromApi = res.data.purity;
        
        // Check if it's an array or object
        if (Array.isArray(purityFromApi) && purityFromApi.length > 0) {
          // It's an array - take the first item
          newPurity = {
            _id: purityFromApi[0]._id,
            stone_purity: purityFromApi[0].stone_purity,
            stone_type: purityFromApi[0].stone_type,
            percentage: purityFromApi[0].percentage,
          };
        } else if (typeof purityFromApi === 'object' && purityFromApi !== null) {
          // It's a single object
          newPurity = {
            _id: purityFromApi._id,
            stone_purity: purityFromApi.stone_purity,
            stone_type: purityFromApi.stone_type,
            percentage: purityFromApi.percentage,
          };
        }
      }
      
      // If we couldn't extract from response, create fallback
      if (!newPurity._id) {
        newPurity = {
          _id: `temp-${Date.now()}`,
          stone_purity: purityData.stone_purity.trim(),
          stone_type: purityData.stone_type,
          percentage: purityData.percentage,
        };
      }
      
      console.log("New purity to add:", newPurity);
      
      // Add to state
      setStonePurities(prev => {
        const updated = [...prev, newPurity];
        console.log("Updated state:", updated);
        return updated;
      });
      
      // Also refetch to get the complete updated list from server
      await fetchPurities();
      
      console.log("Updated state with new purity:", newPurity);
      return newPurity;
    } catch (err) {
      console.error("Add error:", err);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || "Failed to add stone purity";
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [fetchPurities]);

  // Update stone purity
  const updateStonePurity = useCallback(async (id, data) => {
    try {
      setLoading(true);
      setError("");
      
      const payload = {
        stone_purity: data.stone_purity.trim(),
        stone_type: data.stone_type,
        percentage: Number(data.percentage),
      };
      
      const url = API_ENDPOINTS.updateStonePurity(id);
      console.log("Updating purity at:", url);
      console.log("Data:", payload);
      
      const res = await axios.put(url, payload, {
        headers: { 'Content-Type': 'application/json' },
      });
      
      console.log("Update response:", res.data);
      
      let updatedData = {};
      if (res.data && res.data.success && res.data.purity) {
        const purityFromApi = res.data.purity;
        
        if (Array.isArray(purityFromApi) && purityFromApi.length > 0) {
          updatedData = {
            _id: purityFromApi[0]._id || id,
            stone_purity: purityFromApi[0].stone_purity || data.stone_purity.trim(),
            stone_type: purityFromApi[0].stone_type || data.stone_type,
            percentage: purityFromApi[0].percentage || data.percentage,
          };
        } else if (typeof purityFromApi === 'object' && purityFromApi !== null) {
          updatedData = {
            _id: purityFromApi._id || id,
            stone_purity: purityFromApi.stone_purity || data.stone_purity.trim(),
            stone_type: purityFromApi.stone_type || data.stone_type,
            percentage: purityFromApi.percentage || data.percentage,
          };
        }
      }
      
      if (!updatedData._id) {
        updatedData = {
          _id: id,
          stone_purity: data.stone_purity.trim(),
          stone_type: data.stone_type,
          percentage: data.percentage,
        };
      }
      
      console.log("Updated data:", updatedData);
      
      // Update state
      setStonePurities(prev => prev.map(p => (p._id === id ? updatedData : p)));
      
      // Also refetch to get the complete updated list from server
      await fetchPurities();
      
      return updatedData;
    } catch (err) {
      console.error("Update error:", err);
      setError("Failed to update stone purity");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchPurities]);

  // Delete stone purity
  const deleteStonePurity = useCallback(async (id) => {
    try {
      setLoading(true);
      setError("");
      
      const url = API_ENDPOINTS.deleteStonePurity(id);
      console.log("Deleting purity at:", url);
      
      await axios.delete(url);
      
      console.log("Deleting purity with id:", id);
      console.log("Current purities before delete:", stonePurities);
      
      // Remove from state
      setStonePurities(prev => {
        const updated = prev.filter((p) => p._id !== id);
        console.log("Purities after delete:", updated);
        return updated;
      });
      
      // Also refetch to get the complete updated list from server
      await fetchPurities();
    } catch (err) {
      console.error("Delete error:", err);
      setError("Failed to delete");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchPurities, stonePurities]);

  // Initial data fetch
  useEffect(() => {
    console.log("Initial fetch...");
    fetchAllData();
  }, [fetchAllData]);

  return {
    stonePurities,
    stoneTypes,
    loading,
    error,
    addStonePurity,
    updateStonePurity,
    deleteStonePurity,
    fetchPurities,
    fetchStoneTypes,
    refetch: fetchAllData,
  };
}