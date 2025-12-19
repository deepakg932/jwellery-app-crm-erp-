import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '@/api/api';

const useUnits = () => {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUnits = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Replace hardcoded URL with API_ENDPOINTS
      const response = await axios.get(API_ENDPOINTS.getUnits());
      
      // Keep your existing response handling logic
      if (response.data && Array.isArray(response.data)) {
        setUnits(response.data);
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        setUnits(response.data.data);
      } else if (response.data && response.data.units && Array.isArray(response.data.units)) {
        setUnits(response.data.units);
      } else {
        console.warn('Unexpected response format:', response.data);
        setUnits([]);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch units');
      console.error('Error fetching units:', err);
      setUnits([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const addUnit = async (name) => {
    try {
      // Replace hardcoded URL with API_ENDPOINTS
      const response = await axios.post(API_ENDPOINTS.createUnit(), { name });
      const newUnit = response.data.data || response.data;
      setUnits(prev => [...prev, newUnit]);
      return newUnit;
    } catch (err) {
      throw err;
    }
  };

  const updateUnit = async (id, data) => {
    try {
      // Replace hardcoded URL with API_ENDPOINTS
      const response = await axios.put(API_ENDPOINTS.updateUnit(id), data);
      const updatedUnit = response.data.data || response.data;
      setUnits(prev => prev.map(unit => 
        unit._id === id ? updatedUnit : unit
      ));
      return updatedUnit;
    } catch (err) {
      throw err;
    }
  };

  const deleteUnit = async (id) => {
    try {
      // Replace hardcoded URL with API_ENDPOINTS
      await axios.delete(API_ENDPOINTS.deleteUnit(id));
      setUnits(prev => prev.filter(unit => unit._id !== id));
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    fetchUnits();
  }, [fetchUnits]);

  return {
    units: Array.isArray(units) ? units : [],
    loading,
    error,
    addUnit,
    updateUnit,
    deleteUnit,
    refetch: fetchUnits,
  };
};

export default useUnits;