import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "@/api/api";
import { toast } from "react-toastify";

export default function useGST() {
  const [gstList, setGstList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch all GST records
  const fetchGSTList = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      
      const url = API_ENDPOINTS.getAllGST();
      console.log("Fetching GST list from:", url);
      
      const res = await axios.get(url);
      console.log("GST API Response:", res.data);
      
      // Directly extract data from API response
      let gstData = [];
      
      if (res.data?.success && Array.isArray(res.data.data)) {
        gstData = res.data.data;
      } else if (Array.isArray(res.data)) {
        gstData = res.data;
      }
      
      // Map the data
      const mappedGST = gstData.map((item) => ({
        _id: item._id,
        sgst_percentage: item.sgst_percentage || 0,
        cgst_percentage: item.cgst_percentage || 0,
        igst_percentage: item.igst_percentage || 0,
        utgst_percentage: item.utgst_percentage || 0,
        total_percentage: item.gst_total || 0, // Using gst_total from response
        created_at: item.createdAt || new Date().toISOString(),
        updated_at: item.updatedAt || new Date().toISOString(),
      }));
      
      console.log("Fetched GST list:", mappedGST);
      setGstList(mappedGST);
      return mappedGST;
    } catch (err) {
      console.error("Fetch GST error:", err);
      setError("Failed to load GST list");
      toast.error("Failed to load GST list. Please try again.", {
        autoClose: 4000,
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Add a new GST record
  const addGST = async (gstData) => {
    // Show loading toast
    const toastId = toast.loading("Adding GST...");

    try {
      setLoading(true);
      setError("");
      
      const url = API_ENDPOINTS.createGST();
      console.log("Adding GST at:", url, "Data:", gstData);
      
      const payload = {
        sgst_percentage: parseFloat(gstData.sgst_percentage) || 0,
        cgst_percentage: parseFloat(gstData.cgst_percentage) || 0,
        igst_percentage: parseFloat(gstData.igst_percentage) || 0,
        utgst_percentage: parseFloat(gstData.utgst_percentage) || 0,
      };
      
      const res = await axios.post(url, payload);
      console.log("Add GST response:", res.data);
      
      // Refresh the list from API
      await fetchGSTList();

      // Update toast to success
      toast.update(toastId, {
        render: "GST added successfully!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
      
      return res.data;
    } catch (err) {
      console.error("Add GST error:", err);
      setError("Failed to add GST");

      // Update toast to error
      toast.update(toastId, {
        render: err.response?.data?.message || "Failed to add GST. Please try again.",
        type: "error",
        isLoading: false,
        autoClose: 4000,
      });
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update an existing GST record
  const updateGST = async (id, gstData) => {
    // Show loading toast
    const toastId = toast.loading("Updating GST...");

    try {
      setLoading(true);
      setError("");
      
      const url = API_ENDPOINTS.updateGST(id);
      console.log("Updating GST at:", url, "Data:", gstData);
      
      const payload = {
        sgst_percentage: parseFloat(gstData.sgst_percentage) || 0,
        cgst_percentage: parseFloat(gstData.cgst_percentage) || 0,
        igst_percentage: parseFloat(gstData.igst_percentage) || 0,
        utgst_percentage: parseFloat(gstData.utgst_percentage) || 0,
      };
      
      const res = await axios.put(url, payload);
      console.log("Update GST response:", res.data);
      
      // Refresh the list from API
      await fetchGSTList();

      // Update toast to success
      toast.update(toastId, {
        render: "GST updated successfully!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
      
      return res.data;
    } catch (err) {
      console.error("Update GST error:", err);
      setError("Failed to update GST");

      // Update toast to error
      toast.update(toastId, {
        render: err.response?.data?.message || "Failed to update GST. Please try again.",
        type: "error",
        isLoading: false,
        autoClose: 4000,
      });
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete a GST record
  const deleteGST = async (id) => {
    // Show loading toast
    const toastId = toast.loading("Deleting GST...");

    try {
      setLoading(true);
      setError("");
      
      const url = API_ENDPOINTS.deleteGST(id);
      console.log("Deleting GST at:", url);
      
      const res = await axios.delete(url);
      console.log("Delete GST response:", res.data);
      
      // Refresh the list from API
      await fetchGSTList();

      // Update toast to success
      toast.update(toastId, {
        render: "GST deleted successfully!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
      
      return res.data;
    } catch (err) {
      console.error("Delete GST error:", err);
      setError("Failed to delete GST");

      // Update toast to error
      toast.update(toastId, {
        render: err.response?.data?.message || "Failed to delete GST. Please try again.",
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
    fetchGSTList();
  }, [fetchGSTList]);

  return {
    gstList,
    loading,
    error,
    addGST,
    updateGST,
    deleteGST,
    fetchGSTList,
  };
}