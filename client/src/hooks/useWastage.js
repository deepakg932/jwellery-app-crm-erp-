// hooks/useWastage.js
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '@/api/api';

export const useWastage = () => {
  const [wastages, setWastages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch all wastages
  const fetchWastages = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const url = API_ENDPOINTS.getAllWastages();
      console.log("Fetching wastages from:", url);
      
      const res = await axios.get(url);
      console.log("Wastages API Response:", res.data);
      
      // Extract data from API response
      let wastageData = [];
      
      if (res.data?.success && Array.isArray(res.data.data)) {
        wastageData = res.data.data;
      } else if (Array.isArray(res.data)) {
        wastageData = res.data;
      }
      
      // Map the data to ensure consistent structure
      const mappedWastages = wastageData.map((item) => ({
        _id: item._id || item.id,
        material_name: item.material_name || '',
        wastage_type: item.wastage_type || '',
        wastage_percentage: item.wastage_percentage || 0,
        unit: item.unit || '',
        description: item.description || '',
        is_active: item.is_active !== undefined ? item.is_active : true,
        created_at: item.createdAt || item.created_at || new Date().toISOString(),
        updated_at: item.updatedAt || item.updated_at || new Date().toISOString(),
      }));
      
      console.log("Fetched wastages:", mappedWastages);
      setWastages(mappedWastages);
      return mappedWastages;
    } catch (err) {
      console.error("Fetch wastages error:", err);
      setError("Failed to load wastages");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Add a new wastage
  const addWastage = async (wastageData) => {
    try {
      setLoading(true);
      setError('');
      
      const url = API_ENDPOINTS.createWastage();
      console.log("Adding wastage at:", url, "Data:", wastageData);
      
      const payload = {
        material_name: wastageData.material_name || '',
        wastage_type: wastageData.wastage_type || '',
        wastage_percentage: parseFloat(wastageData.wastage_percentage) || 0,
        unit: wastageData.unit || '',
        description: wastageData.description || '',
      };
      
      const res = await axios.post(url, payload);
      console.log("Add wastage response:", res.data);
      
      // Refresh the list from API
      await fetchWastages();
      
      return res.data;
    } catch (err) {
      console.error("Add wastage error:", err);
      setError("Failed to add wastage");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update an existing wastage
  const updateWastage = async (id, wastageData) => {
    try {
      setLoading(true);
      setError('');
      
      const url = API_ENDPOINTS.updateWastage(id);
      console.log("Updating wastage at:", url, "Data:", wastageData);
      
      const payload = {
        material_name: wastageData.material_name || '',
        wastage_type: wastageData.wastage_type || '',
        wastage_percentage: parseFloat(wastageData.wastage_percentage) || 0,
        unit: wastageData.unit || '',
        description: wastageData.description || '',
      };
      
      const res = await axios.put(url, payload);
      console.log("Update wastage response:", res.data);
      
      // Refresh the list from API
      await fetchWastages();
      
      return res.data;
    } catch (err) {
      console.error("Update wastage error:", err);
      setError("Failed to update wastage");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete a wastage
  const deleteWastage = async (id) => {
    try {
      setLoading(true);
      setError('');
      
      const url = API_ENDPOINTS.deleteWastage(id);
      console.log("Deleting wastage at:", url);
      
      const res = await axios.delete(url);
      console.log("Delete wastage response:", res.data);
      
      // Refresh the list from API
      await fetchWastages();
      
      return res.data;
    } catch (err) {
      console.error("Delete wastage error:", err);
      setError("Failed to delete wastage");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Toggle wastage status
  const toggleWastageStatus = async (id) => {
    try {
      setLoading(true);
      setError('');
      
      const url = API_ENDPOINTS.toggleWastageStatus(id);
      console.log("Toggling wastage status at:", url);
      
      const res = await axios.patch(url);
      console.log("Toggle status response:", res.data);
      
      // Refresh the list from API
      await fetchWastages();
      
      return res.data;
    } catch (err) {
      console.error("Toggle wastage status error:", err);
      setError("Failed to toggle wastage status");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get wastage by ID
  const getWastageById = useCallback((id) => {
    return wastages.find(item => item._id === id);
  }, [wastages]);

  // Get active wastages
  const getActiveWastages = useCallback(() => {
    return wastages.filter(item => item.is_active);
  }, [wastages]);

  // Calculate total wastage percentage (if needed)
  const calculateTotalWastage = useCallback(() => {
    return wastages.reduce((total, item) => total + (item.wastage_percentage || 0), 0);
  }, [wastages]);

  // Initialize with data
  useEffect(() => {
    fetchWastages();
  }, [fetchWastages]);

  return {
    wastages,
    loading,
    error,
    addWastage,
    updateWastage,
    deleteWastage,
    toggleWastageStatus,
    fetchWastages,
    getWastageById,
    getActiveWastages,
    calculateTotalWastage,
  };
};