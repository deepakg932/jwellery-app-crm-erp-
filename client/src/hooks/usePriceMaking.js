// hooks/usePriceMaking.js
import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '@/api/api';

export const usePriceMaking = () => {
  const [priceMakings, setPriceMakings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dropdownData, setDropdownData] = useState({
    makingStages: [],
    makingSubStages: [],
    costTypes: [],
    units: []
  });

  // Fetch making stages
  const fetchMakingStages = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.getMakingStages());
      
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        const mappedStages = response.data.data.map((stage) => ({
          _id: stage._id,
          id: stage._id,
          stage_name: stage.stage_name || '',
          name: stage.stage_name || '',
          value: stage.stage_name || '', // Use TEXT as value
          label: stage.stage_name || '',
        }));
        return mappedStages;
      }
      return [];
    } catch (err) {
      console.error('Error fetching making stages:', err);
      return [];
    }
  };

  // Fetch making sub-stages
  const fetchMakingSubStages = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.getMakingSubStages());
      
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        const mappedSubStages = response.data.data.map((subStage) => {
          const stageId = subStage.stage_id?._id || '';
          const stageName = subStage.stage_id?.stage_name || '';
          
          return {
            _id: subStage._id,
            id: subStage._id,
            sub_stage_name: subStage.sub_stage_name || '',
            name: subStage.sub_stage_name || '',
            stage_id: stageId,
            stage_name: stageName,
            making_stage_id: stageId,
            makingStageName: stageName,
            value: subStage.sub_stage_name || '', // Use TEXT as value
            label: subStage.sub_stage_name || '',
            is_active: subStage.is_active !== undefined ? subStage.is_active : true,
          };
        });
        return mappedSubStages;
      }
      return [];
    } catch (err) {
      console.error('Error fetching making sub-stages:', err);
      return [];
    }
  };

  // Fetch cost types
  const fetchCostTypes = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.getCostTypes());
      
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        const mappedCostTypes = response.data.data.map((costType) => ({
          _id: costType._id,
          id: costType._id,
          cost_type: costType.cost_type || '',
          cost_name: costType.cost_name || '',
          sub_stage_name: costType.sub_stage_name || '',
          name: costType.cost_type || '',
          value: costType.cost_type || '', // Use TEXT as value
          label: costType.cost_type || '',
          is_active: costType.is_active !== undefined ? costType.is_active : true,
        }));
        return mappedCostTypes;
      }
      return [];
    } catch (err) {
      console.error('Error fetching cost types:', err);
      return [];
    }
  };

  // Fetch units
  const fetchUnits = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.getUnits());
      
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        const mappedUnits = response.data.data.map((unit) => ({
          _id: unit._id,
          id: unit._id,
          unit_name: unit.name || '', // Your API returns 'name' field
          name: unit.name || '',
          value: unit.name || '', // Use TEXT as value
          label: unit.name || '',
        }));
        return mappedUnits;
      }
      return [];
    } catch (err) {
      console.error('Error fetching units:', err);
      return [];
    }
  };

  // Fetch all dropdown data
  const fetchDropdownData = async () => {
    try {
      setLoading(true);
      
      const [makingStages, makingSubStages, costTypes, units] = await Promise.all([
        fetchMakingStages(),
        fetchMakingSubStages(),
        fetchCostTypes(),
        fetchUnits()
      ]);
      
      console.log('Fetched dropdown data:', {
        makingStages,
        makingSubStages,
        costTypes,
        units
      });
      
      setDropdownData({
        makingStages,
        makingSubStages,
        costTypes,
        units
      });
      
      return { makingStages, makingSubStages, costTypes, units };
      
    } catch (err) {
      console.error('Error fetching dropdown data:', err);
      setError('Failed to load dropdown data');
      return { makingStages: [], makingSubStages: [], costTypes: [], units: [] };
    } finally {
      setLoading(false);
    }
  };

  // Fetch all price makings
  const fetchPriceMakings = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch dropdown data first for reference
      const dropdown = await fetchDropdownData();
      
      // Fetch price makings
      const response = await axios.get(API_ENDPOINTS.getPriceMakings());
      console.log('Price Makings API Response:', response.data);
      
      let priceMakingsData = [];
      
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        priceMakingsData = response.data.data;
      } else if (Array.isArray(response.data)) {
        priceMakingsData = response.data;
      } else {
        console.warn('Unexpected price makings response structure:', response.data);
      }
      
      // Map data to consistent structure - your API stores TEXT values
      const mappedPriceMakings = priceMakingsData.map((priceMaking) => {
        // Find related data by TEXT values for additional info if needed
        const makingStage = dropdown.makingStages.find(
          stage => stage.stage_name === priceMaking.stage_name
        );
        
        const makingSubStage = dropdown.makingSubStages.find(
          subStage => subStage.sub_stage_name === priceMaking.sub_stage_name
        );
        
        const costType = dropdown.costTypes.find(
          cost => cost.cost_type === priceMaking.cost_type
        );
        
        const unit = dropdown.units.find(
          u => u.unit_name === priceMaking.unit_name || u.name === priceMaking.unit_name
        );
        
        return {
          _id: priceMaking._id,
          stage_name: priceMaking.stage_name || '',
          sub_stage_name: priceMaking.sub_stage_name || '',
          cost_type: priceMaking.cost_type || '',
          cost_amount: priceMaking.cost_amount || 0,
          unit_name: priceMaking.unit_name || '',
          is_active: priceMaking.is_active !== undefined ? priceMaking.is_active : true,
          // Additional info from dropdowns
          making_stage_id: makingStage?._id || '',
          making_sub_stage_id: makingSubStage?._id || '',
          cost_type_id: costType?._id || '',
          unit_id: unit?._id || '',
          createdAt: priceMaking.createdAt,
          updatedAt: priceMaking.updatedAt,
        };
      });
      
      console.log('Fetched price makings:', mappedPriceMakings);
      setPriceMakings(mappedPriceMakings);
      
    } catch (err) {
      console.error('Error fetching price makings:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to load price makings';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Add new price making - your API expects TEXT values
  const addPriceMaking = async (priceMakingData) => {
    // Your API expects TEXT values, not IDs
    const data = {
      stage_name: priceMakingData.stage_name || '', // TEXT
      sub_stage_name: priceMakingData.sub_stage_name || '', // TEXT
      cost_type: priceMakingData.cost_type || '', // TEXT
      cost_amount: priceMakingData.cost_amount || 0, // Note: your API uses 'cost_amount'
      unit_name: priceMakingData.unit_name || '', // TEXT
      is_active: priceMakingData.is_active !== undefined ? priceMakingData.is_active : true,
    };

    try {
      setLoading(true);
      setError('');
      console.log('Sending add price making request:', data);
      
      const response = await axios.post(API_ENDPOINTS.createPriceMaking(), data);
      console.log('Add price making response:', response.data);
      
      if (response.data && response.data.success && response.data.data) {
        const responseData = response.data.data;
        
        // Find related data by TEXT values
        const makingStage = dropdownData.makingStages.find(
          stage => stage.stage_name === data.stage_name
        );
        
        const makingSubStage = dropdownData.makingSubStages.find(
          subStage => subStage.sub_stage_name === data.sub_stage_name
        );
        
        const costType = dropdownData.costTypes.find(
          cost => cost.cost_type === data.cost_type
        );
        
        const unit = dropdownData.units.find(
          u => u.unit_name === data.unit_name || u.name === data.unit_name
        );
        
        const newPriceMaking = {
          _id: responseData._id,
          stage_name: responseData.stage_name || data.stage_name,
          sub_stage_name: responseData.sub_stage_name || data.sub_stage_name,
          cost_type: responseData.cost_type || data.cost_type,
          cost_amount: responseData.cost_amount || data.cost_amount,
          unit_name: responseData.unit_name || data.unit_name,
          is_active: responseData.is_active !== undefined ? responseData.is_active : true,
          // Additional info
          making_stage_id: makingStage?._id || '',
          making_sub_stage_id: makingSubStage?._id || '',
          cost_type_id: costType?._id || '',
          unit_id: unit?._id || '',
          createdAt: responseData.createdAt,
          updatedAt: responseData.updatedAt,
        };
        
        console.log('New price making:', newPriceMaking);
        setPriceMakings(prev => [...prev, newPriceMaking]);
        return newPriceMaking;
      } else {
        throw new Error(response.data?.message || 'Failed to create price making');
      }
      
    } catch (err) {
      console.error('Error adding price making:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to add price making';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Update price making
  const updatePriceMaking = async (id, priceMakingData) => {
    // Your API expects TEXT values
    const requestData = {
      stage_name: priceMakingData.stage_name || '', // TEXT
      sub_stage_name: priceMakingData.sub_stage_name || '', // TEXT
      cost_type: priceMakingData.cost_type || '', // TEXT
      cost_amount: priceMakingData.cost_amount || 0, // Note: 'cost_amount' not 'amount'
      unit_name: priceMakingData.unit_name || '', // TEXT
      is_active: priceMakingData.is_active !== undefined ? priceMakingData.is_active : true,
    };

    try {
      setLoading(true);
      setError('');
      console.log('Updating price making:', id, 'Data:', requestData);
      
      const response = await axios.put(API_ENDPOINTS.updatePriceMaking(id), requestData);
      console.log('Update price making response:', response.data);
      
      if (response.data && response.data.success && response.data.data) {
        const responseData = response.data.data;
        
        // Find related data by TEXT values
        const makingStage = dropdownData.makingStages.find(
          stage => stage.stage_name === requestData.stage_name
        );
        
        const makingSubStage = dropdownData.makingSubStages.find(
          subStage => subStage.sub_stage_name === requestData.sub_stage_name
        );
        
        const costType = dropdownData.costTypes.find(
          cost => cost.cost_type === requestData.cost_type
        );
        
        const unit = dropdownData.units.find(
          u => u.unit_name === requestData.unit_name || u.name === requestData.unit_name
        );
        
        const updatedData = {
          _id: responseData._id || id,
          stage_name: responseData.stage_name || requestData.stage_name,
          sub_stage_name: responseData.sub_stage_name || requestData.sub_stage_name,
          cost_type: responseData.cost_type || requestData.cost_type,
          cost_amount: responseData.cost_amount || requestData.cost_amount,
          unit_name: responseData.unit_name || requestData.unit_name,
          is_active: responseData.is_active !== undefined ? responseData.is_active : true,
          // Additional info
          making_stage_id: makingStage?._id || '',
          making_sub_stage_id: makingSubStage?._id || '',
          cost_type_id: costType?._id || '',
          unit_id: unit?._id || '',
          createdAt: responseData.createdAt,
          updatedAt: responseData.updatedAt,
        };
        
        console.log('Updated price making:', updatedData);
        setPriceMakings(prev => 
          prev.map((item) => (item._id === id ? updatedData : item))
        );
        
        return updatedData;
      } else {
        throw new Error(response.data?.message || 'Failed to update price making');
      }
      
    } catch (err) {
      console.error('Error updating price making:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to update price making';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Delete price making
  const deletePriceMaking = async (id) => {
    try {
      setLoading(true);
      setError('');
      console.log('Deleting price making:', id);
      
      const response = await axios.delete(API_ENDPOINTS.deletePriceMaking(id));
      console.log('Delete price making response:', response.data);
      
      if (response.data && response.data.success) {
        setPriceMakings(prev => prev.filter((item) => item._id !== id));
      } else {
        throw new Error(response.data?.message || 'Failed to delete price making');
      }
      
    } catch (err) {
      console.error('Error deleting price making:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to delete price making';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Get making stages for dropdown - TEXT values
  const getMakingStagesForDropdown = () => {
    return dropdownData.makingStages.map(stage => ({
      value: stage.stage_name, // Use TEXT as value
      label: stage.stage_name,
    }));
  };

  // Get making sub-stages for dropdown - TEXT values
  const getMakingSubStagesForDropdown = (stageName = null) => {
    let filteredSubStages = dropdownData.makingSubStages;
    
    if (stageName) {
      // Filter by stage name (TEXT)
      filteredSubStages = dropdownData.makingSubStages.filter(
        subStage => subStage.stage_name === stageName
      );
    }
    
    return filteredSubStages.map(subStage => ({
      value: subStage.sub_stage_name, // Use TEXT as value
      label: subStage.sub_stage_name,
    }));
  };

  // Get cost types for dropdown - TEXT values
  const getCostTypesForDropdown = () => {
    return dropdownData.costTypes.map(costType => ({
      value: costType.cost_type, // Use TEXT as value
      label: costType.cost_type,
    }));
  };

  // Get units for dropdown - TEXT values
  const getUnitsForDropdown = () => {
    return dropdownData.units.map(unit => ({
      value: unit.unit_name || unit.name || '', // Use TEXT as value
      label: unit.unit_name || unit.name || '',
    }));
  };

  // Refresh all data
  const refreshAllData = async () => {
    await fetchPriceMakings();
  };

  // Clear error
  const clearError = () => {
    setError('');
  };

  useEffect(() => {
    fetchPriceMakings();
  }, []);

  return {
    priceMakings,
    loading,
    error,
    dropdownData,
    addPriceMaking,
    updatePriceMaking,
    deletePriceMaking,
    getMakingStagesForDropdown,
    getMakingSubStagesForDropdown,
    getCostTypesForDropdown,
    getUnitsForDropdown,
    refreshPriceMakings: refreshAllData,
    clearError,
  };
};