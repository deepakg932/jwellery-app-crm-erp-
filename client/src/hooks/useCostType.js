// hooks/useCostType.js
import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '@/api/api';

export const useCostType = () => {
  const [costTypes, setCostTypes] = useState([]);
  const [costNames, setCostNames] = useState([]);
  const [makingStages, setMakingStages] = useState([]);
  const [makingSubStages, setMakingSubStages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch cost names
  const fetchCostNames = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.getCosts());
      
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        const mappedCostNames = response.data.data.map((cost) => ({
          _id: cost._id,
          cost_name: cost.cost_name || '',
          value: cost.cost_name || '', // For dropdown value
          label: cost.cost_name || '', // For dropdown label
        }));
        setCostNames(mappedCostNames);
        return mappedCostNames;
      }
      return [];
    } catch (err) {
      console.error('Error fetching cost names:', err);
      return [];
    }
  };

  // Fetch making stages
  const fetchMakingStages = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.getMakingStages());
      
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        const mappedStages = response.data.data.map((stage) => ({
          id: stage._id,
          _id: stage._id,
          name: stage.stage_name || '',
          stage_name: stage.stage_name || '',
          value: stage._id, // For dropdown
          label: stage.stage_name || '', // For dropdown
        }));
        setMakingStages(mappedStages);
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
          // Handle stage_id (could be object or string)
          const stageId = subStage.stage_id?._id || subStage.stage_id || '';
          const stageName = subStage.stage_id?.stage_name || '';
          
          return {
            id: subStage._id,
            _id: subStage._id,
            name: subStage.sub_stage_name || '',
            sub_stage_name: subStage.sub_stage_name || '',
            stage_id: stageId,
            stage_name: stageName,
            value: subStage._id, // For dropdown
            label: subStage.sub_stage_name || '', // For dropdown
            is_active: subStage.is_active !== undefined ? subStage.is_active : true,
          };
        });
        setMakingSubStages(mappedSubStages);
        return mappedSubStages;
      }
      return [];
    } catch (err) {
      console.error('Error fetching making sub-stages:', err);
      return [];
    }
  };

  // Fetch all cost types
  const fetchCostTypes = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch all required data
      const [costNamesData, stagesData, subStagesData] = await Promise.all([
        fetchCostNames(),
        fetchMakingStages(),
        fetchMakingSubStages()
      ]);
      
      // Fetch cost types
      const response = await axios.get(API_ENDPOINTS.getCostTypes());
      console.log('Cost Types API Response:', response.data);
      
      let costTypesData = [];
      
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        costTypesData = response.data.data;
      } else if (Array.isArray(response.data)) {
        costTypesData = response.data;
      } else {
        console.warn('Unexpected cost types response structure:', response.data);
      }
      
      // Find sub-stage info for each cost type
      const mappedCostTypes = costTypesData.map((costType) => {
        // Find the sub-stage by sub_stage_name (text match)
        const subStage = subStagesData.find(
          sub => sub.sub_stage_name === costType.sub_stage_name
        );
        
        // Find the stage from sub-stage
        const stage = stagesData.find(
          stage => stage._id === subStage?.stage_id
        );
        
        return {
          _id: costType._id,
          cost_type: costType.cost_type || '',
          cost_name: costType.cost_name || '',
          sub_stage_name: costType.sub_stage_name || '',
          making_stage_id: stage?._id || '',
          making_stage_name: stage?.stage_name || '',
          making_sub_stage_id: subStage?._id || '',
          making_sub_stage_name: subStage?.sub_stage_name || '',
          is_active: costType.is_active !== undefined ? costType.is_active : true,
          createdAt: costType.createdAt,
          updatedAt: costType.updatedAt,
        };
      });
      
      console.log('Fetched cost types:', mappedCostTypes);
      setCostTypes(mappedCostTypes);
      
    } catch (err) {
      console.error('Error fetching cost types:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to load cost types';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Add new cost type
  const addCostType = async (costTypeData) => {
    // Prepare data as per API: send text values, not IDs
    const data = {
      cost_type: costTypeData.cost_type || '',
      cost_name: costTypeData.cost_name || '', // Send cost name TEXT
      sub_stage_name: costTypeData.sub_stage_name || '', // Send sub-stage name TEXT
      is_active: costTypeData.is_active !== undefined ? costTypeData.is_active : true,
    };

    try {
      setLoading(true);
      setError('');
      console.log('Sending add cost type request:', data);
      
      const response = await axios.post(API_ENDPOINTS.createCostType(), data);
      console.log('Add cost type response:', response.data);
      
      if (response.data && response.data.success && response.data.data) {
        const responseData = response.data.data;
        
        // Find the sub-stage by name
        const subStage = makingSubStages.find(
          sub => sub.sub_stage_name === data.sub_stage_name
        );
        
        // Find the stage from sub-stage
        const stage = makingStages.find(
          s => s._id === subStage?.stage_id
        );
        
        const newCostType = {
          _id: responseData._id,
          cost_type: responseData.cost_type || data.cost_type,
          cost_name: responseData.cost_name || data.cost_name,
          sub_stage_name: responseData.sub_stage_name || data.sub_stage_name,
          making_stage_id: stage?._id || '',
          making_stage_name: stage?.stage_name || '',
          making_sub_stage_id: subStage?._id || '',
          making_sub_stage_name: subStage?.sub_stage_name || '',
          is_active: responseData.is_active !== undefined ? responseData.is_active : true,
          createdAt: responseData.createdAt,
          updatedAt: responseData.updatedAt,
        };
        
        console.log('New cost type:', newCostType);
        setCostTypes(prev => [...prev, newCostType]);
        return newCostType;
      } else {
        throw new Error(response.data?.message || 'Failed to create cost type');
      }
      
    } catch (err) {
      console.error('Error adding cost type:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to add cost type';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Update cost type
  const updateCostType = async (id, costTypeData) => {
    // Prepare data as per API: send text values
    const requestData = {
      cost_type: costTypeData.cost_type || '',
      cost_name: costTypeData.cost_name || '', // Send cost name TEXT
      sub_stage_name: costTypeData.sub_stage_name || '', // Send sub-stage name TEXT
      is_active: costTypeData.is_active !== undefined ? costTypeData.is_active : true,
    };

    try {
      setLoading(true);
      setError('');
      console.log('Updating cost type:', id, 'Data:', requestData);
      
      const response = await axios.put(API_ENDPOINTS.updateCostType(id), requestData);
      console.log('Update cost type response:', response.data);
      
      if (response.data && response.data.success && response.data.data) {
        const responseData = response.data.data;
        
        // Find the sub-stage by name
        const subStage = makingSubStages.find(
          sub => sub.sub_stage_name === requestData.sub_stage_name
        );
        
        // Find the stage from sub-stage
        const stage = makingStages.find(
          s => s._id === subStage?.stage_id
        );
        
        const updatedData = {
          _id: responseData._id || id,
          cost_type: responseData.cost_type || requestData.cost_type,
          cost_name: responseData.cost_name || requestData.cost_name,
          sub_stage_name: responseData.sub_stage_name || requestData.sub_stage_name,
          making_stage_id: stage?._id || '',
          making_stage_name: stage?.stage_name || '',
          making_sub_stage_id: subStage?._id || '',
          making_sub_stage_name: subStage?.sub_stage_name || '',
          is_active: responseData.is_active !== undefined ? responseData.is_active : true,
          createdAt: responseData.createdAt,
          updatedAt: responseData.updatedAt,
        };
        
        console.log('Updated cost type:', updatedData);
        setCostTypes(prev => 
          prev.map((costType) => (costType._id === id ? updatedData : costType))
        );
        
        return updatedData;
      } else {
        throw new Error(response.data?.message || 'Failed to update cost type');
      }
      
    } catch (err) {
      console.error('Error updating cost type:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to update cost type';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Delete cost type
  const deleteCostType = async (id) => {
    try {
      setLoading(true);
      setError('');
      console.log('Deleting cost type:', id);
      
      const response = await axios.delete(API_ENDPOINTS.deleteCostType(id));
      console.log('Delete cost type response:', response.data);
      
      if (response.data && response.data.success) {
        setCostTypes(prev => prev.filter((costType) => costType._id !== id));
      } else {
        throw new Error(response.data?.message || 'Failed to delete cost type');
      }
      
    } catch (err) {
      console.error('Error deleting cost type:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to delete cost type';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Get cost names for dropdown (text values, not IDs)
  const getCostNamesForDropdown = () => {
    return costNames.map(cost => ({
      value: cost.cost_name, // Use TEXT as value
      label: cost.cost_name,
    }));
  };

  // Get making stages for dropdown
  const getMakingStagesForDropdown = () => {
    return makingStages.map(stage => ({
      value: stage._id,
      label: stage.stage_name,
    }));
  };

  // Get making sub-stages for dropdown (filtered by stage if provided)
  const getMakingSubStagesForDropdown = (stageId = null) => {
    let filteredSubStages = makingSubStages;
    
    if (stageId) {
      filteredSubStages = makingSubStages.filter(subStage => subStage.stage_id === stageId);
    }
    
    return filteredSubStages.map(subStage => ({
      value: subStage.sub_stage_name, // Use TEXT as value
      label: `${subStage.sub_stage_name} (${subStage.stage_name || 'No Stage'})`,
    }));
  };

  // Refresh all data
  const refreshAllData = async () => {
    await fetchCostTypes();
  };

  // Clear error
  const clearError = () => {
    setError('');
  };

  useEffect(() => {
    fetchCostTypes();
  }, []);

  return {
    costTypes,
    costNames,
    makingStages,
    makingSubStages,
    loading,
    error,
    addCostType,
    updateCostType,
    deleteCostType,
    getCostNamesForDropdown,
    getMakingStagesForDropdown,
    getMakingSubStagesForDropdown,
    refreshCostTypes: refreshAllData,
    clearError,
  };
};

export default useCostType;