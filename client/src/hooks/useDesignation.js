// hooks/useDesignation.js
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '@/api/api';

export const useDesignation = () => {
  const [designations, setDesignations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch all designations
  const fetchDesignations = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const url = API_ENDPOINTS.getDesignations();
      console.log("Fetching designations from:", url);
      
      const res = await axios.get(url);
      console.log("Designations API Response:", res.data);
      
      // Extract data from API response
      let designationData = [];
      
      if (res.data?.success && Array.isArray(res.data.data)) {
        designationData = res.data.data;
      } else if (Array.isArray(res.data)) {
        designationData = res.data;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        designationData = res.data.data;
      }
      
      // Map the data to ensure consistent structure
      const mappedDesignations = designationData.map((item) => ({
        _id: item._id || item.id,
        designation_name: item.designation_name || item.name || '',
        description: item.description || '',
        is_active: item.is_active !== undefined ? item.is_active : true,
        created_at: item.createdAt || item.created_at || new Date().toISOString(),
        updated_at: item.updatedAt || item.updated_at || new Date().toISOString(),
      }));
      
      console.log("Fetched designations:", mappedDesignations);
      setDesignations(mappedDesignations);
      return mappedDesignations;
    } catch (err) {
      console.error("Fetch designations error:", err);
      setError("Failed to load designations");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Add a new designation
  const addDesignation = async (designationData) => {
    try {
      setLoading(true);
      setError('');
      
      const url = API_ENDPOINTS.createDesignation();
      console.log("Adding designation at:", url, "Data:", designationData);
      
      const payload = {
        designation_name: designationData.designation_name || '',
        description: designationData.description || '',
        is_active: designationData.is_active !== undefined ? designationData.is_active : true,
      };
      
      const res = await axios.post(url, payload);
      console.log("Add designation response:", res.data);
      
      // Refresh the list from API
      await fetchDesignations();
      
      return res.data;
    } catch (err) {
      console.error("Add designation error:", err);
      setError("Failed to add designation");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update an existing designation
  const updateDesignation = async (id, designationData) => {
    try {
      setLoading(true);
      setError('');
      
      const url = API_ENDPOINTS.updateDesignation(id);
      console.log("Updating designation at:", url, "Data:", designationData);
      
      const payload = {
        designation_name: designationData.designation_name || '',
        description: designationData.description || '',
        is_active: designationData.is_active !== undefined ? designationData.is_active : true,
      };
      
      const res = await axios.put(url, payload);
      console.log("Update designation response:", res.data);
      
      // Refresh the list from API
      await fetchDesignations();
      
      return res.data;
    } catch (err) {
      console.error("Update designation error:", err);
      setError("Failed to update designation");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete a designation
  const deleteDesignation = async (id) => {
    try {
      setLoading(true);
      setError('');
      
      const url = API_ENDPOINTS.deleteDesignation(id);
      console.log("Deleting designation at:", url);
      
      const res = await axios.delete(url);
      console.log("Delete designation response:", res.data);
      
      // Refresh the list from API
      await fetchDesignations();
      
      return res.data;
    } catch (err) {
      console.error("Delete designation error:", err);
      setError("Failed to delete designation");
      throw err;
    } finally {
      setLoading(false);
    }
  };







  // Initialize with data
  useEffect(() => {
    fetchDesignations();
  }, [fetchDesignations]);

  return {
    designations,
    loading,
    error,
    addDesignation,
    updateDesignation,
    deleteDesignation,
    fetchDesignations,
  };
};