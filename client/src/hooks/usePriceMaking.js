// hooks/usePriceMaking.js
import { useState, useEffect } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "@/api/api";

export const usePriceMaking = () => {
  const [priceMakings, setPriceMakings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dropdownData, setDropdownData] = useState({
    makingStages: [],
    makingSubStages: [],
    costTypes: [],
    units: [],
  });

  console.log(dropdownData.costTypes);

  // Fetch making stages
  const fetchMakingStages = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.getMakingStages());

      if (
        response.data &&
        response.data.success &&
        Array.isArray(response.data.data)
      ) {
        const mappedStages = response.data.data.map((stage) => ({
          _id: stage._id,
          id: stage._id,
          stage_name: stage.stage_name || "",
          name: stage.stage_name || "",
          value: stage._id, // Use ID as value
          label: stage.stage_name || "",
        }));
        return mappedStages;
      }
      return [];
    } catch (err) {
      console.error("Error fetching making stages:", err);
      return [];
    }
  };

  // Fetch making sub-stages
  const fetchMakingSubStages = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.getMakingSubStages());

      if (
        response.data &&
        response.data.success &&
        Array.isArray(response.data.data)
      ) {
        const mappedSubStages = response.data.data.map((subStage) => {
          const stageId = subStage.stage_id?._id || "";
          const stageName = subStage.stage_id?.stage_name || "";

          return {
            _id: subStage._id,
            id: subStage._id,
            sub_stage_name: subStage.sub_stage_name || "",
            name: subStage.sub_stage_name || "",
            stage_id: stageId,
            stage_name: stageName,
            making_stage_id: stageId,
            makingStageName: stageName,
            value: subStage._id, // Use ID as value
            label: subStage.sub_stage_name || "",
            is_active:
              subStage.is_active !== undefined ? subStage.is_active : true,
          };
        });
        return mappedSubStages;
      }
      return [];
    } catch (err) {
      console.error("Error fetching making sub-stages:", err);
      return [];
    }
  };

  // Fetch cost types
  const fetchCostTypes = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.getCostTypes());

      if (
        response.data &&
        response.data.success &&
        Array.isArray(response.data.data)
      ) {
        const mappedCostTypes = response.data.data.map((costType) => ({
          _id: costType._id,
          cost_type: costType.cost_type || "",
          cost_name_id: costType.cost_name_id._id,
          cost_name: costType.cost_name_id.cost_name,
          is_active: costType.is_active,
        }));
        return mappedCostTypes;
      }
      return [];
    } catch (err) {
      console.error("Error fetching cost types:", err);
      return [];
    }
  };

  // Fetch units
  const fetchUnits = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.getUnits());

      if (
        response.data &&
        response.data.success &&
        Array.isArray(response.data.data)
      ) {
        const mappedUnits = response.data.data.map((unit) => ({
          _id: unit._id,
          id: unit._id,
          unit_name: unit.name || "", // Your API returns 'name' field
          name: unit.name || "",
          value: unit._id, // Use ID as value
          label: unit.name || "",
        }));
        return mappedUnits;
      }
      return [];
    } catch (err) {
      console.error("Error fetching units:", err);
      return [];
    }
  };

  // Fetch all dropdown data
  const fetchDropdownData = async () => {
    try {
      setLoading(true);

      const [makingStages, makingSubStages, costTypes, units] =
        await Promise.all([
          fetchMakingStages(),
          fetchMakingSubStages(),
          fetchCostTypes(),
          fetchUnits(),
        ]);

      console.log("Fetched dropdown data (IDs):", {
        makingStages,
        makingSubStages,
        costTypes,
        units,
      });

      setDropdownData({
        makingStages,
        makingSubStages,
        costTypes,
        units,
      });

      return { makingStages, makingSubStages, costTypes, units };
    } catch (err) {
      console.error("Error fetching dropdown data:", err);
      setError("Failed to load dropdown data");
      return {
        makingStages: [],
        makingSubStages: [],
        costTypes: [],
        units: [],
      };
    } finally {
      setLoading(false);
    }
  };

  // Fetch all price makings - Updated for nested API response
  const fetchPriceMakings = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch dropdown data first for reference
      const dropdown = await fetchDropdownData();

      // Fetch price makings
      const response = await axios.get(API_ENDPOINTS.getPriceMakings());
      console.log("Price Makings API Response (nested):", response.data);

      let priceMakingsData = [];

      if (
        response.data &&
        response.data.success &&
        Array.isArray(response.data.data)
      ) {
        priceMakingsData = response.data.data;
      } else if (Array.isArray(response.data)) {
        priceMakingsData = response.data;
      } else {
        console.warn(
          "Unexpected price makings response structure:",
          response.data,
        );
      }

      // Map data to consistent structure - Handle nested objects
      const mappedPriceMakings = priceMakingsData.map((priceMaking) => {
        // Extract data from nested objects
        const makingStageObj = priceMaking.making_stage_id || {};
        const makingStageId = makingStageObj._id || "";
        const makingStageName = makingStageObj.stage_name || "";

        const makingSubStageObj = priceMaking.making_sub_stage_id || {};
        const makingSubStageId = makingSubStageObj._id || "";
        const makingSubStageName = makingSubStageObj.sub_stage_name || "";

        const costTypeObj = priceMaking.cost_type_id || {};
        const costTypeId = costTypeObj._id || "";
        const costTypeName = costTypeObj.cost_type || "";

        // Extract cost name from nested structure
        const costNameObj = costTypeObj.cost_name_id || {};
        const costNameId = costNameObj._id || "";
        const costNameText = costNameObj.cost_name || "";

        const unitObj = priceMaking.unit_id || {};
        const unitId = unitObj._id || "";
        const unitName = unitObj.name || unitObj.unit_name || "";

        // Also try to find in dropdown for additional info
        const makingStageFromDropdown = dropdown.makingStages.find(
          (stage) => stage._id === makingStageId,
        );

        const makingSubStageFromDropdown = dropdown.makingSubStages.find(
          (subStage) => subStage._id === makingSubStageId,
        );

        const costTypeFromDropdown = dropdown.costTypes.find(
          (cost) => cost._id === costTypeId,
        );

        const unitFromDropdown = dropdown.units.find((u) => u._id === unitId);

        return {
          _id: priceMaking._id,

          // Store IDs from nested objects
          making_stage_id: makingStageId,
          making_sub_stage_id: makingSubStageId,
          cost_type_id: costTypeId,
          unit_id: unitId,

          // Store cost name info if available
          cost_name_id: costNameId,
          cost_name: costNameText,

          // For display only - prefer nested object values, fallback to dropdown
          stage_name:
            makingStageName || makingStageFromDropdown?.stage_name || "",
          sub_stage_name:
            makingSubStageName ||
            makingSubStageFromDropdown?.sub_stage_name ||
            "",
          cost_type: costTypeName || costTypeFromDropdown?.cost_type || "",
          unit_name:
            unitName ||
            unitFromDropdown?.unit_name ||
            unitFromDropdown?.name ||
            "",

          // Store the full nested objects for reference
          making_stage_obj: makingStageObj,
          making_sub_stage_obj: makingSubStageObj,
          cost_type_obj: costTypeObj,
          unit_obj: unitObj,

          cost_amount: priceMaking.cost_amount || 0,
          is_active:
            priceMaking.is_active !== undefined ? priceMaking.is_active : true,
          createdAt: priceMaking.createdAt,
          updatedAt: priceMaking.updatedAt,
        };
      });

      console.log(
        "Fetched price makings (extracted from nested):",
        mappedPriceMakings,
      );
      setPriceMakings(mappedPriceMakings);
    } catch (err) {
      console.error("Error fetching price makings:", err);
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Failed to load price makings";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Add new price making - Now using IDs
  const addPriceMaking = async (priceMakingData) => {
    // Now send IDs instead of text
    const data = {
      making_stage_id: priceMakingData.making_stage_id || "", // ID
      making_sub_stage_id: priceMakingData.making_sub_stage_id || "", // ID (optional)
      cost_type_id: priceMakingData.cost_type_id || "", // ID
      cost_amount: priceMakingData.cost_amount || 0,
      unit_id: priceMakingData.unit_id || "", // ID
      is_active:
        priceMakingData.is_active !== undefined
          ? priceMakingData.is_active
          : true,
    };

    try {
      setLoading(true);
      setError("");
      console.log("Sending add price making request (IDs):", data);

      const response = await axios.post(
        API_ENDPOINTS.createPriceMaking(),
        data,
      );
      console.log("Add price making response:", response.data);

      if (response.data && response.data.success && response.data.data) {
        const responseData = response.data.data;

        // Find related data by ID for display
        const makingStage = dropdownData.makingStages.find(
          (stage) => stage._id === data.making_stage_id,
        );

        const makingSubStage = dropdownData.makingSubStages.find(
          (subStage) => subStage._id === data.making_sub_stage_id,
        );

        const costType = dropdownData.costTypes.find(
          (cost) => cost._id === data.cost_type_id,
        );

        const unit = dropdownData.units.find((u) => u._id === data.unit_id);

        const newPriceMaking = {
          _id: responseData._id,
          // IDs
          making_stage_id: responseData.making_stage_id || data.making_stage_id,
          making_sub_stage_id:
            responseData.making_sub_stage_id || data.making_sub_stage_id,
          cost_type_id: responseData.cost_type_id || data.cost_type_id,
          unit_id: responseData.unit_id || data.unit_id,
          // For display
          stage_name: makingStage?.stage_name || "",
          sub_stage_name: makingSubStage?.sub_stage_name || "",
          cost_type: costType?.cost_type || "",
          unit_name: unit?.unit_name || unit?.name || "",
          cost_amount: responseData.cost_amount || data.cost_amount,
          is_active:
            responseData.is_active !== undefined
              ? responseData.is_active
              : true,
          createdAt: responseData.createdAt,
          updatedAt: responseData.updatedAt,
        };

        console.log("New price making (with IDs):", newPriceMaking);
        setPriceMakings((prev) => [...prev, newPriceMaking]);
        return newPriceMaking;
      } else {
        throw new Error(
          response.data?.message || "Failed to create price making",
        );
      }
    } catch (err) {
      console.error("Error adding price making:", err);
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Failed to add price making";
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Update price making - Now using IDs
  const updatePriceMaking = async (id, priceMakingData) => {
    // Now send IDs instead of text
    const requestData = {
      making_stage_id: priceMakingData.making_stage_id || "", // ID
      making_sub_stage_id: priceMakingData.making_sub_stage_id || "", // ID (optional)
      cost_type_id: priceMakingData.cost_type_id || "", // ID
      cost_amount: priceMakingData.cost_amount || 0,
      unit_id: priceMakingData.unit_id || "", // ID
      is_active:
        priceMakingData.is_active !== undefined
          ? priceMakingData.is_active
          : true,
    };

    try {
      setLoading(true);
      setError("");
      console.log("Updating price making (IDs):", id, "Data:", requestData);

      const response = await axios.put(
        API_ENDPOINTS.updatePriceMaking(id),
        requestData,
      );
      console.log("Update price making response:", response.data);

      if (response.data && response.data.success && response.data.data) {
        const responseData = response.data.data;

        // Find related data by ID for display
        const makingStage = dropdownData.makingStages.find(
          (stage) => stage._id === requestData.making_stage_id,
        );

        const makingSubStage = dropdownData.makingSubStages.find(
          (subStage) => subStage._id === requestData.making_sub_stage_id,
        );

        const costType = dropdownData.costTypes.find(
          (cost) => cost._id === requestData.cost_type_id,
        );

        const unit = dropdownData.units.find(
          (u) => u._id === requestData.unit_id,
        );

        const updatedData = {
          _id: responseData._id || id,
          // IDs
          making_stage_id:
            responseData.making_stage_id || requestData.making_stage_id,
          making_sub_stage_id:
            responseData.making_sub_stage_id || requestData.making_sub_stage_id,
          cost_type_id: responseData.cost_type_id || requestData.cost_type_id,
          unit_id: responseData.unit_id || requestData.unit_id,
          // For display
          stage_name: makingStage?.stage_name || "",
          sub_stage_name: makingSubStage?.sub_stage_name || "",
          cost_type: costType?.cost_type || "",
          unit_name: unit?.unit_name || unit?.name || "",
          cost_amount: responseData.cost_amount || requestData.cost_amount,
          is_active:
            responseData.is_active !== undefined
              ? responseData.is_active
              : true,
          createdAt: responseData.createdAt,
          updatedAt: responseData.updatedAt,
        };

        console.log("Updated price making (with IDs):", updatedData);
        setPriceMakings((prev) =>
          prev.map((item) => (item._id === id ? updatedData : item)),
        );

        return updatedData;
      } else {
        throw new Error(
          response.data?.message || "Failed to update price making",
        );
      }
    } catch (err) {
      console.error("Error updating price making:", err);
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Failed to update price making";
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
      setError("");
      console.log("Deleting price making:", id);

      const response = await axios.delete(API_ENDPOINTS.deletePriceMaking(id));
      console.log("Delete price making response:", response.data);

      if (response.data && response.data.success) {
        setPriceMakings((prev) => prev.filter((item) => item._id !== id));
      } else {
        throw new Error(
          response.data?.message || "Failed to delete price making",
        );
      }
    } catch (err) {
      console.error("Error deleting price making:", err);
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Failed to delete price making";
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Get making stages for dropdown - Using IDs
  const getMakingStagesForDropdown = () => {
    return dropdownData.makingStages.map((stage) => ({
      value: stage._id, // Use ID as value
      label: stage.stage_name,
    }));
  };

  // Get making sub-stages for dropdown - Using IDs, filter by stage ID
  const getMakingSubStagesForDropdown = (stageId = null) => {
    let filteredSubStages = dropdownData.makingSubStages;

    if (stageId) {
      // Filter by stage ID
      filteredSubStages = dropdownData.makingSubStages.filter(
        (subStage) => subStage.stage_id === stageId,
      );
    }

    return filteredSubStages.map((subStage) => ({
      value: subStage._id, // Use ID as value
      label: subStage.sub_stage_name,
    }));
  };

  // Get cost types for dropdown - Using IDs
  const getCostTypesForDropdown = () => {
    return dropdownData.costTypes.map((costType) => ({
      value: costType._id, // Use ID as value
      label: costType.cost_type,
    }));
  };

  // Get units for dropdown - Using IDs
  const getUnitsForDropdown = () => {
    return dropdownData.units.map((unit) => ({
      value: unit._id, // Use ID as value
      label: unit.unit_name || unit.name || "",
    }));
  };

  // Find making stage name by ID
  const getStageNameById = (id) => {
    const stage = dropdownData.makingStages.find((stage) => stage._id === id);
    return stage?.stage_name || "";
  };

  // Find making sub-stage name by ID
  const getSubStageNameById = (id) => {
    const subStage = dropdownData.makingSubStages.find(
      (subStage) => subStage._id === id,
    );
    return subStage?.sub_stage_name || "";
  };

  // Find cost type by ID
  const getCostTypeById = (id) => {
    const costType = dropdownData.costTypes.find((cost) => cost._id === id);
    return costType?.cost_type || "";
  };

  // Find unit by ID
  const getUnitById = (id) => {
    const unit = dropdownData.units.find((u) => u._id === id);
    return unit?.unit_name || unit?.name || "";
  };

  // Refresh all data
  const refreshAllData = async () => {
    await fetchPriceMakings();
  };

  // Clear error
  const clearError = () => {
    setError("");
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
    getStageNameById,
    getSubStageNameById,
    getCostTypeById,
    getUnitById,
    refreshPriceMakings: refreshAllData,
    clearError,
  };
};
