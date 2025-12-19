import axios from "axios";
import { API_ENDPOINTS } from "@/api/api";
import { useEffect, useState } from "react";

const useMakingSubStages = () => {
  const [makingSubStages, setMakingSubStages] = useState([]);
  const [makingStages, setMakingStages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch parent making stages
  const fetchMakingStages = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_ENDPOINTS.getMakingStages());
      console.log("Parent Making Stages API Response:", res.data);
      
      let stagesData = [];
      
      if (res.data && res.data.success && Array.isArray(res.data.data)) {
        stagesData = res.data.data;
      } else if (Array.isArray(res.data)) {
        stagesData = res.data;
      } else {
        console.warn("Unexpected stages response structure:", res.data);
      }
      
      const mappedStages = stagesData.map((stage) => ({
        id: stage._id,
        _id: stage._id,
        name: stage.stage_name || stage.name || "",
        stage_name: stage.stage_name || "",
      }));
      
      console.log("Fetched parent making stages:", mappedStages);
      setMakingStages(mappedStages);
      return mappedStages;
    } catch (err) {
      console.error("Fetch parent making stages error:", err);
      setError("Failed to load making stages");
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Helper function to extract stage ID from different response structures
  const getStageId = (stageData) => {
    if (!stageData) return "";
    
    // If it's a string ID
    if (typeof stageData === "string") {
      return stageData;
    }
    
    // If it's an object with _id
    if (stageData._id) {
      return stageData._id;
    }
    
    return "";
  };

  // Helper function to get stage name from stage data
  const getStageName = (stageData, stagesMap = {}) => {
    if (!stageData) return "Unknown Stage";
    
    // If it's an object with stage_name (populated response)
    if (typeof stageData === "object" && stageData.stage_name) {
      return stageData.stage_name;
    }
    
    // If it's a string ID or object with _id, look up in stagesMap
    const stageId = getStageId(stageData);
    return stagesMap[stageId] || "Unknown Stage";
  };

  // Fetch making sub-stages
  const fetchMakingSubStages = async () => {
    try {
      setLoading(true);
      
      // Fetch stages first to have them available
      const stagesList = await fetchMakingStages();
      
      // Create a map of stage IDs to names for quick lookup
      const stagesMap = {};
      stagesList.forEach(stage => {
        stagesMap[stage.id] = stage.name;
      });
      
      const res = await axios.get(API_ENDPOINTS.getMakingSubStages());
      console.log("Making Sub-Stages API Response:", res.data);
      
      let subStagesData = [];
      
      if (res.data && res.data.success && Array.isArray(res.data.data)) {
        subStagesData = res.data.data;
      } else if (Array.isArray(res.data)) {
        subStagesData = res.data;
      } else {
        console.warn("Unexpected sub-stages response structure:", res.data);
      }
      
      // Map to ensure consistent structure
      const mappedSubStages = subStagesData.map((subStage) => {
        const stageId = getStageId(subStage.stage_id);
        const stageName = getStageName(subStage.stage_id, stagesMap);
        
        return {
          _id: subStage._id,
          name: subStage.sub_stage_name || subStage.name || "",
          making_stage_id: stageId,
          makingStageName: stageName,
          is_active: subStage.is_active !== undefined ? subStage.is_active : true,
          // Keep original data if needed
          originalStageData: subStage.stage_id,
        };
      });
      
      console.log("Fetched making sub-stages:", mappedSubStages);
      setMakingSubStages(mappedSubStages);
    } catch (err) {
      console.error("Fetch making sub-stages error:", err);
      setError("Failed to load making sub-stages");
    } finally {
      setLoading(false);
    }
  };

  // Add new making sub-stage
  const addMakingSubStage = async (subStageData) => {
    const data = {
      sub_stage_name: subStageData.name || subStageData.sub_stage_name,
      stage_id: subStageData.making_stage_id, // Note: using stage_id as per your API
      is_active: subStageData.is_active !== undefined ? subStageData.is_active : true,
    };

    try {
      setLoading(true);
      console.log("Sending add request:", data);
      
      const response = await axios.post(API_ENDPOINTS.createMakingSubStage(), data);
      console.log("Add making sub-stage response:", response.data);
      
      let newSubStage = {};
      
      if (response.data && response.data.success && response.data.data) {
        const responseData = response.data.data;
        
        // Find the stage name from makingStages
        let stageName = "Unknown Stage";
        const parentStage = makingStages.find(stage => 
          stage.id === responseData.stage_id || stage._id === responseData.stage_id
        );
        if (parentStage) {
          stageName = parentStage.name;
        }
        
        newSubStage = {
          _id: responseData._id,
          name: responseData.sub_stage_name || data.sub_stage_name,
          making_stage_id: responseData.stage_id, // Using stage_id from response
          makingStageName: stageName,
          is_active: responseData.is_active !== undefined ? responseData.is_active : true,
        };
      } else {
        throw new Error(response.data?.message || "Failed to create sub-stage");
      }
      
      console.log("New making sub-stage:", newSubStage);
      setMakingSubStages(prev => [...prev, newSubStage]);
      return newSubStage;
    } catch (err) {
      console.error("Add making sub-stage error:", err);
      const errorMsg = err.response?.data?.message || err.message || "Failed to add making sub-stage";
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Update making sub-stage
  const updateMakingSubStage = async (id, data) => {
    const requestData = {
      sub_stage_name: data.name || data.sub_stage_name,
      stage_id: data.making_stage_id, // Using stage_id as per your API
      is_active: data.is_active !== undefined ? data.is_active : true,
    };

    try {
      setLoading(true);
      console.log("Updating making sub-stage:", id, "Data:", requestData);
      
      const response = await axios.put(API_ENDPOINTS.updateMakingSubStage(id), requestData);
      console.log("Update making sub-stage response:", response.data);
      
      let updatedData = {};
      
      if (response.data && response.data.success && response.data.data) {
        const responseData = response.data.data;
        
        // Find the stage name
        let stageName = "Unknown Stage";
        const parentStage = makingStages.find(stage => 
          stage.id === responseData.stage_id || stage._id === responseData.stage_id
        );
        if (parentStage) {
          stageName = parentStage.name;
        }
        
        updatedData = {
          _id: responseData._id || id,
          name: responseData.sub_stage_name || requestData.sub_stage_name,
          making_stage_id: responseData.stage_id,
          makingStageName: stageName,
          is_active: responseData.is_active !== undefined ? responseData.is_active : true,
        };
      } else {
        throw new Error(response.data?.message || "Failed to update sub-stage");
      }
      
      setMakingSubStages(prev => 
        prev.map((subStage) => (subStage._id === id ? updatedData : subStage))
      );
      
      console.log("Updated making sub-stage:", updatedData);
      return updatedData;
    } catch (err) {
      console.error("Update making sub-stage error:", err);
      const errorMsg = err.response?.data?.message || err.message || "Failed to update making sub-stage";
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Delete making sub-stage
  const deleteMakingSubStage = async (id) => {
    try {
      setLoading(true);
      
      const response = await axios.delete(API_ENDPOINTS.deleteMakingSubStage(id));
      console.log("Delete making sub-stage response:", response.data);
      
      if (response.data && response.data.success) {
        setMakingSubStages(prev => prev.filter((subStage) => subStage._id !== id));
      } else {
        throw new Error(response.data?.message || "Failed to delete");
      }
    } catch (err) {
      console.error("Delete making sub-stage error:", err);
      const errorMsg = err.response?.data?.message || err.message || "Failed to delete making sub-stage";
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Get making stages for dropdown
  const getMakingStagesForDropdown = () => {
    return makingStages.map(stage => ({
      value: stage.id,
      label: stage.name,
    }));
  };

  // Refresh data
  const refreshData = async () => {
    await fetchMakingSubStages();
  };

  // Clear error
  const clearError = () => {
    setError("");
  };

  useEffect(() => {
    fetchMakingSubStages();
  }, []);

  return {
    makingSubStages,
    makingStages,
    loading,
    error,
    addMakingSubStage,
    updateMakingSubStage,
    deleteMakingSubStage,
    getMakingStagesForDropdown,
    fetchMakingSubStages,
    fetchMakingStages,
    refreshData,
    clearError,
  };
};

export default useMakingSubStages;