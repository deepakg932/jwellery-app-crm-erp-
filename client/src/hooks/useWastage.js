// hooks/useWastage.js
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "@/api/api";
import { toast } from "react-toastify";

export const useWastage = () => {
  const [wastages, setWastages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch all wastages
  const fetchWastages = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

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
        material_name: item.material_name || "",
        wastage_type: item.wastage_type || "",
        wastage_percentage: item.wastage_percentage || 0,
        unit: item.unit || "",
        description: item.description || "",
        is_active: item.is_active !== undefined ? item.is_active : true,
        created_at:
          item.createdAt || item.created_at || new Date().toISOString(),
        updated_at:
          item.updatedAt || item.updated_at || new Date().toISOString(),
      }));

      console.log("Fetched wastages:", mappedWastages);
      setWastages(mappedWastages);
      return mappedWastages;
    } catch (err) {
      console.error("Fetch wastages error:", err);
      setError("Failed to load wastages");
      toast.error("Failed to load wastages. Please try again.", {
        autoClose: 4000,
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Add a new wastage
  const addWastage = async (wastageData) => {
    // Show loading toast
    const toastId = toast.loading("Adding wastage...");

    try {
      setLoading(true);
      setError("");

      const url = API_ENDPOINTS.createWastage();
      console.log("Adding wastage at:", url, "Data:", wastageData);

      const payload = {
        material_name: wastageData.material_name || "",
        wastage_type: wastageData.wastage_type || "",
        wastage_percentage: parseFloat(wastageData.wastage_percentage) || 0,
        unit: wastageData.unit || "",
        description: wastageData.description || "",
      };

      const res = await axios.post(url, payload);
      console.log("Add wastage response:", res.data);

      // Refresh the list from API
      await fetchWastages();

      // Update toast to success
      toast.update(toastId, {
        render: "Wastage added successfully!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });

      return res.data;
    } catch (err) {
      console.error("Add wastage error:", err);
      setError("Failed to add wastage");

      // Update toast to error
      toast.update(toastId, {
        render:
          err.response?.data?.message ||
          "Failed to add wastage. Please try again.",
        type: "error",
        isLoading: false,
        autoClose: 4000,
      });

      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update an existing wastage
  const updateWastage = async (id, wastageData) => {
    // Show loading toast
    const toastId = toast.loading("Updating wastage...");

    try {
      setLoading(true);
      setError("");

      const url = API_ENDPOINTS.updateWastage(id);
      console.log("Updating wastage at:", url, "Data:", wastageData);

      const payload = {
        material_name: wastageData.material_name || "",
        wastage_type: wastageData.wastage_type || "",
        wastage_percentage: parseFloat(wastageData.wastage_percentage) || 0,
        unit: wastageData.unit || "",
        description: wastageData.description || "",
      };

      const res = await axios.put(url, payload);
      console.log("Update wastage response:", res.data);

      // Refresh the list from API
      await fetchWastages();

      // Update toast to success
      toast.update(toastId, {
        render: "Wastage updated successfully!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });

      return res.data;
    } catch (err) {
      console.error("Update wastage error:", err);
      setError("Failed to update wastage");

      // Update toast to error
      toast.update(toastId, {
        render:
          err.response?.data?.message ||
          "Failed to update wastage. Please try again.",
        type: "error",
        isLoading: false,
        autoClose: 4000,
      });

      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete a wastage
  const deleteWastage = async (id) => {
    // Show loading toast
    const toastId = toast.loading("Deleting wastage...");

    try {
      setLoading(true);
      setError("");

      const url = API_ENDPOINTS.deleteWastage(id);
      console.log("Deleting wastage at:", url);

      const res = await axios.delete(url);
      console.log("Delete wastage response:", res.data);

      // Refresh the list from API
      await fetchWastages();

      // Update toast to success
      toast.update(toastId, {
        render: "Wastage deleted successfully!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });

      return res.data;
    } catch (err) {
      console.error("Delete wastage error:", err);
      setError("Failed to delete wastage");

      // Update toast to error
      toast.update(toastId, {
        render:
          err.response?.data?.message ||
          "Failed to delete wastage. Please try again.",
        type: "error",
        isLoading: false,
        autoClose: 4000,
      });

      throw err;
    } finally {
      setLoading(false);
    }
  };

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
    fetchWastages,
  };
};
