// hooks/useCostMaster.js
import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '@/api/api';

export const useCostMaster = () => {
  const [costs, setCosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch all costs
  const fetchCosts = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.get(API_ENDPOINTS.getCosts());
      console.log('Costs API Response:', response.data);
      
      let costsData = [];
      
      // Handle different API response structures
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        costsData = response.data.data;
      } else if (Array.isArray(response.data)) {
        costsData = response.data;
      } else if (response.data && Array.isArray(response.data.costs)) {
        costsData = response.data.costs;
      } else {
        console.warn('Unexpected costs response structure:', response.data);
      }
      
      // Map to ensure consistent structure
      const mappedCosts = costsData.map((cost) => ({
        _id: cost._id,
        cost_name: cost.cost_name || cost.name || '',
        // Include any other fields that might be present
        ...cost
      }));
      
      console.log('Fetched costs:', mappedCosts);
      setCosts(mappedCosts);
      
    } catch (err) {
      console.error('Error fetching costs:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to load costs';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Add new cost
  const addCost = async (costData) => {
    const data = {
      cost_name: costData.cost_name,
    };

    try {
      setLoading(true);
      setError('');
      console.log('Sending add cost request:', data);
      
      const response = await axios.post(API_ENDPOINTS.createCost(), data);
      console.log('Add cost response:', response.data);
      
      let newCost = {};
      
      if (response.data && response.data.success && response.data.data) {
        const responseData = response.data.data;
        newCost = {
          _id: responseData._id,
          cost_name: responseData.cost_name || data.cost_name,
        };
      } else {
        throw new Error(response.data?.message || 'Failed to create cost');
      }
      
      console.log('New cost:', newCost);
      setCosts(prev => [...prev, newCost]);
      return newCost;
      
    } catch (err) {
      console.error('Error adding cost:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to add cost';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Update cost
  const updateCost = async (id, costData) => {
    const requestData = {
      cost_name: costData.cost_name,
    };

    try {
      setLoading(true);
      setError('');
      console.log('Updating cost:', id, 'Data:', requestData);
      
      const response = await axios.put(API_ENDPOINTS.updateCost(id), requestData);
      console.log('Update cost response:', response.data);
      
      let updatedData = {};
      
      if (response.data && response.data.success && response.data.data) {
        const responseData = response.data.data;
        updatedData = {
          _id: responseData._id || id,
          cost_name: responseData.cost_name || requestData.cost_name,
        };
      } else {
        throw new Error(response.data?.message || 'Failed to update cost');
      }
      
      setCosts(prev => 
        prev.map((cost) => (cost._id === id ? updatedData : cost))
      );
      
      console.log('Updated cost:', updatedData);
      return updatedData;
      
    } catch (err) {
      console.error('Error updating cost:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to update cost';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Delete cost
  const deleteCost = async (id) => {
    try {
      setLoading(true);
      setError('');
      console.log('Deleting cost:', id);
      
      const response = await axios.delete(API_ENDPOINTS.deleteCost(id));
      console.log('Delete cost response:', response.data);
      
      if (response.data && response.data.success) {
        setCosts(prev => prev.filter((cost) => cost._id !== id));
      } else {
        throw new Error(response.data?.message || 'Failed to delete cost');
      }
      
    } catch (err) {
      console.error('Error deleting cost:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to delete cost';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Refresh costs data
  const refreshCosts = async () => {
    await fetchCosts();
  };

  // Clear error
  const clearError = () => {
    setError('');
  };

  // Fetch costs on component mount
  useEffect(() => {
    fetchCosts();
  }, []);

  return {
    costs,
    loading,
    error,
    addCost,
    updateCost,
    deleteCost,
    refreshCosts,
    clearError,
  };
};

export default useCostMaster;