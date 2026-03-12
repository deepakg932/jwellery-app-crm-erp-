import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "@/api/api";
import { toast } from "react-toastify";

export default function useStonePurity() {
  const [stonePurities, setStonePurities] = useState([]);
  const [stoneTypes, setStoneTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ Fetch Stone Types (Dropdown)
  const fetchStoneTypes = useCallback(async () => {
    try {
      const res = await axios.get(API_ENDPOINTS.getAllStoneTypes());

      const stonesData = res.data.stones || res.data;

      const uniqueTypes = [
        ...new Set(
          stonesData
            .map((s) => s.stone_name || s.stone_type)
            .filter(Boolean)
        ),
      ];

      const mappedTypes = uniqueTypes.map((type, index) => ({
        id: index,
        name: type,
      }));

      setStoneTypes(mappedTypes);
    } catch (err) {
      console.error("Stone types fetch error:", err);
      toast.error("Failed to load stone types", {
        autoClose: 4000,
      });
    }
  }, []);

  // ✅ Fetch Purities
  const fetchPurities = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get(API_ENDPOINTS.getAllStonePurities());

      const purityData = res.data.purities || res.data.purity || [];

      const mappedPurities = purityData.map((p) => ({
        _id: p._id || p.id,
        stone_purity: p.stone_purity,
        stone_type: p.stone_type,
        percentage: p.percentage,
      }));

      setStonePurities(mappedPurities);
    } catch (err) {
      console.error("Fetch purity error:", err);
      setError("Failed to load purities");
      toast.error("Failed to load stone purities. Please try again.", {
        autoClose: 4000,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Add Purity
  const addStonePurity = useCallback(async (data) => {
    // Show loading toast
    const toastId = toast.loading("Adding stone purity...");

    try {
      setLoading(true);
      setError("");

      const payload = {
        stone_purity: data.stone_purity.trim(),
        stone_type: data.stone_type,
        percentage: Number(data.percentage),
      };

      const res = await axios.post(
        API_ENDPOINTS.createStonePurity(),
        payload
      );

      const purity = res.data.purity || res.data;

      const newPurity = {
        _id: purity._id,
        stone_purity: purity.stone_purity,
        stone_type: purity.stone_type,
        percentage: purity.percentage,
      };

      setStonePurities((prev) => [...prev, newPurity]);

      // Update toast to success
      toast.update(toastId, {
        render: "Stone purity added successfully!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });

      return newPurity;
    } catch (err) {
      const msg =
        err.response?.data?.message || "Failed to add stone purity";
      setError(msg);
      
      // Update toast to error
      toast.update(toastId, {
        render: msg,
        type: "error",
        isLoading: false,
        autoClose: 4000,
      });
      
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Update Purity
  const updateStonePurity = useCallback(async (id, data) => {
    // Show loading toast
    const toastId = toast.loading("Updating stone purity...");

    try {
      setLoading(true);
      setError("");

      const payload = {
        stone_purity: data.stone_purity.trim(),
        stone_type: data.stone_type,
        percentage: Number(data.percentage),
      };

      const res = await axios.put(
        API_ENDPOINTS.updateStonePurity(id),
        payload
      );

      const purity = res.data.purity || res.data;

      const updatedPurity = {
        _id: purity._id || id,
        stone_purity: purity.stone_purity,
        stone_type: purity.stone_type,
        percentage: purity.percentage,
      };

      setStonePurities((prev) =>
        prev.map((p) => (p._id === id ? updatedPurity : p))
      );

      // Update toast to success
      toast.update(toastId, {
        render: "Stone purity updated successfully!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });

      return updatedPurity;
    } catch (err) {
      setError("Failed to update stone purity");
      
      // Update toast to error
      toast.update(toastId, {
        render: err.response?.data?.message || "Failed to update stone purity. Please try again.",
        type: "error",
        isLoading: false,
        autoClose: 4000,
      });
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Delete Purity
  const deleteStonePurity = useCallback(async (id) => {
    // Show loading toast
    const toastId = toast.loading("Deleting stone purity...");

    try {
      setLoading(true);
      setError("");

      await axios.delete(API_ENDPOINTS.deleteStonePurity(id));

      setStonePurities((prev) =>
        prev.filter((p) => p._id !== id)
      );

      // Update toast to success
      toast.update(toastId, {
        render: "Stone purity deleted successfully!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
    } catch (err) {
      setError("Failed to delete purity");
      
      // Update toast to error
      toast.update(toastId, {
        render: err.response?.data?.message || "Failed to delete stone purity. Please try again.",
        type: "error",
        isLoading: false,
        autoClose: 4000,
      });
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Initial Load
  useEffect(() => {
    fetchStoneTypes();
    fetchPurities();
  }, [fetchStoneTypes, fetchPurities]);

  return {
    stonePurities,
    stoneTypes,
    loading,
    error,
    addStonePurity,
    updateStonePurity,
    deleteStonePurity,
    fetchPurities,
    fetchStoneTypes,
  };
}