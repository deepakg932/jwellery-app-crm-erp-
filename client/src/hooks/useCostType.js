import { useState, useEffect } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "@/api/api";
import { toast } from "react-toastify";

export const useCostType = () => {
  const [costTypes, setCostTypes] = useState([]);
  const [costNames, setCostNames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch cost names
  const fetchCostNames = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.getCosts());

      if (
        response.data &&
        response.data.success &&
        Array.isArray(response.data.data)
      ) {
        const mappedCostNames = response.data.data.map((cost) => ({
          _id: cost._id,
          cost_name: cost.cost_name || "",
          value: cost._id, 
          label: cost.cost_name || "", 
        }));
        setCostNames(mappedCostNames);
        return mappedCostNames;
      }
      return [];
    } catch (err) {
      console.error("Error fetching cost names:", err);
      toast.error("Failed to load cost names", {
        autoClose: 4000,
      });
      return [];
    }
  };

  // Fetch all cost types
  const fetchCostTypes = async () => {
    try {
      setLoading(true);
      setError("");

      const costNamesData = await fetchCostNames();

      const response = await axios.get(API_ENDPOINTS.getCostTypes());
      console.log("Cost Types API Response:", response.data);

      let costTypesData = [];

      if (
        response.data &&
        response.data.success &&
        Array.isArray(response.data.data)
      ) {
        costTypesData = response.data.data;
      } else if (Array.isArray(response.data)) {
        costTypesData = response.data;
      } else {
        console.warn(
          "Unexpected cost types response structure:",
          response.data,
        );
      }

      const mappedCostTypes = costTypesData.map((costType) => {
        const costNameIdObj = costType.cost_name_id || {};
        const costNameId = costNameIdObj._id || "";
        const costNameText = costNameIdObj.cost_name || "";

        const costNameFromList = costNamesData.find(
          (cost) => cost._id === costNameId,
        );

        return {
          _id: costType._id,
          cost_type: costType.cost_type || "",
          cost_name_id: costNameId, 
          cost_name: costNameText || costNameFromList?.cost_name || "", 
          is_active:
            costType.is_active !== undefined ? costType.is_active : true,
          createdAt: costType.createdAt,
          updatedAt: costType.updatedAt,
          cost_name_obj: costNameIdObj,
        };
      });

      console.log("Fetched cost types:", mappedCostTypes);
      setCostTypes(mappedCostTypes);
    } catch (err) {
      console.error("Error fetching cost types:", err);
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Failed to load cost types";
      setError(errorMsg);
      toast.error(errorMsg, {
        autoClose: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  const addCostType = async (costTypeData) => {
    const toastId = toast.loading("Adding cost type...");

    const data = {
      cost_type: costTypeData.cost_type || "",
      cost_name_id: costTypeData.cost_name_id || "",
      is_active:
        costTypeData.is_active !== undefined ? costTypeData.is_active : true,
    };

    try {
      setLoading(true);
      setError("");
      console.log("Sending add cost type request:", data);

      const response = await axios.post(API_ENDPOINTS.createCostType(), data);
      console.log("Add cost type response:", response.data);

      if (response.data && response.data.success && response.data.data) {
        const responseData = response.data.data;

        
        const costNameIdObj = responseData.cost_name_id || {};
        const costNameId = costNameIdObj._id || data.cost_name_id;
        const costNameText = costNameIdObj.cost_name || "";

        
        const costNameObj =
          costNames.find((cost) => cost._id === costNameId) || null;

        const newCostType = {
          _id: responseData._id,
          cost_type: responseData.cost_type || data.cost_type,
          cost_name_id: costNameId,
          cost_name: costNameText || costNameObj?.cost_name || "",
          is_active:
            responseData.is_active !== undefined
              ? responseData.is_active
              : true,
          createdAt: responseData.createdAt,
          updatedAt: responseData.updatedAt,
          cost_name_obj: costNameIdObj,
        };

        console.log("New cost type:", newCostType);
        setCostTypes((prev) => [...prev, newCostType]);

      
        toast.update(toastId, {
          render: "Cost type added successfully!",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });

        return newCostType;
      } else {
        throw new Error(response.data?.message || "Failed to create cost type");
      }
    } catch (err) {
      console.error("Error adding cost type:", err);
      const errorMsg =
        err.response?.data?.message || err.message || "Failed to add cost type";
      setError(errorMsg);

      
      toast.update(toastId, {
        render: errorMsg,
        type: "error",
        isLoading: false,
        autoClose: 4000,
      });

      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  
  const updateCostType = async (id, costTypeData) => {
 
    const toastId = toast.loading("Updating cost type...");

    const requestData = {
      cost_type: costTypeData.cost_type || "",
      cost_name_id: costTypeData.cost_name_id || "",
      is_active:
        costTypeData.is_active !== undefined ? costTypeData.is_active : true,
    };

    try {
      setLoading(true);
      setError("");
      console.log("Updating cost type:", id, "Data:", requestData);

      const response = await axios.put(
        API_ENDPOINTS.updateCostType(id),
        requestData,
      );
      console.log("Update cost type response:", response.data);

      if (response.data && response.data.success && response.data.data) {
        const responseData = response.data.data;

  
        const costNameIdObj = responseData.cost_name_id || {};
        const costNameId = costNameIdObj._id || requestData.cost_name_id;
        const costNameText = costNameIdObj.cost_name || "";

      
        const costNameObj =
          costNames.find((cost) => cost._id === costNameId) || null;

        const updatedData = {
          _id: responseData._id || id,
          cost_type: responseData.cost_type || requestData.cost_type,
          cost_name_id: costNameId,
          cost_name: costNameText || costNameObj?.cost_name || "", 
          is_active:
            responseData.is_active !== undefined
              ? responseData.is_active
              : true,
          createdAt: responseData.createdAt,
          updatedAt: responseData.updatedAt,
          cost_name_obj: costNameIdObj,
        };

        console.log("Updated cost type:", updatedData);
        setCostTypes((prev) =>
          prev.map((costType) =>
            costType._id === id ? updatedData : costType,
          ),
        );

        // Update toast to success
        toast.update(toastId, {
          render: "Cost type updated successfully!",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });

        return updatedData;
      } else {
        throw new Error(response.data?.message || "Failed to update cost type");
      }
    } catch (err) {
      console.error("Error updating cost type:", err);
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Failed to update cost type";
      setError(errorMsg);

      // Update toast to error
      toast.update(toastId, {
        render: errorMsg,
        type: "error",
        isLoading: false,
        autoClose: 4000,
      });

      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };


  const deleteCostType = async (id) => {
    
    const toastId = toast.loading("Deleting cost type...");

    try {
      setLoading(true);
      setError("");
      console.log("Deleting cost type:", id);

      const response = await axios.delete(API_ENDPOINTS.deleteCostType(id));
      console.log("Delete cost type response:", response.data);

      if (response.data && response.data.success) {
        setCostTypes((prev) => prev.filter((costType) => costType._id !== id));

        toast.update(toastId, {
          render: "Cost type deleted successfully!",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
      } else {
        throw new Error(response.data?.message || "Failed to delete cost type");
      }
    } catch (err) {
      console.error("Error deleting cost type:", err);
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Failed to delete cost type";
      setError(errorMsg);

      // Update toast to error
      toast.update(toastId, {
        render: errorMsg,
        type: "error",
        isLoading: false,
        autoClose: 4000,
      });

      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Get cost names for dropdown (using IDs as values)
  const getCostNamesForDropdown = () => {
    return costNames.map((cost) => ({
      value: cost._id, // Use ID as value
      label: cost.cost_name, // Show name as label
    }));
  };

  // Get cost name by ID
  const getCostNameById = (id) => {
    const cost = costNames.find((cost) => cost._id === id);
    return cost ? cost.cost_name : "";
  };

  // Refresh all data
  const refreshAllData = async () => {
    await fetchCostTypes();
  };

  // Clear error
  const clearError = () => {
    setError("");
  };

  // Initialize on mount
  useEffect(() => {
    fetchCostTypes();
  }, []);

  return {
    // Data
    costTypes,
    costNames,

    // States
    loading,
    error,

    // CRUD Operations
    addCostType,
    updateCostType,
    deleteCostType,

    // Dropdown Data
    getCostNamesForDropdown,
    getCostNameById,

    // Utility Functions
    refreshCostTypes: refreshAllData,
    clearError,
  };
};

export default useCostType;