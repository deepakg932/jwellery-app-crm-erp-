import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "@/api/api";
import { toast } from "react-toastify";

export default function useStones() {
  const [stones, setStones] = useState([]);
  const [stoneTypes, setStoneTypes] = useState([]);
  const [stonePurities, setStonePurities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ Fetch Stone Types
  const fetchStoneTypes = useCallback(async () => {
    try {
      const res = await axios.get(API_ENDPOINTS.getAllStoneTypes());
      const data = res.data.stones || res.data || [];

      const uniqueTypes = [
        ...new Set(data.map((s) => s.stone_type).filter(Boolean)),
      ];

      setStoneTypes(
        uniqueTypes.map((type, index) => ({
          _id: `type-${index + 1}`,
          name: type,
        }))
      );
    } catch (err) {
      console.error("Fetch stone types error:", err);
      setStoneTypes([]);
      toast.error("Failed to load stone types", {
        autoClose: 4000,
      });
    }
  }, []);

  // ✅ Fetch Stone Purities
  const fetchStonePurities = useCallback(async () => {
    try {
      const res = await axios.get(API_ENDPOINTS.getAllStonePurities());
      const data = res.data.purities || res.data.purity || res.data || [];

      const uniquePurities = [
        ...new Set(data.map((p) => p.stone_purity).filter(Boolean)),
      ];

      setStonePurities(
        uniquePurities.map((purity, index) => ({
          _id: `purity-${index + 1}`,
          name: purity,
        }))
      );
    } catch (err) {
      console.error("Fetch stone purities error:", err);
      setStonePurities([]);
      toast.error("Failed to load stone purities", {
        autoClose: 4000,
      });
    }
  }, []);

  // ✅ Fetch All Stones
  const fetchStones = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get(API_ENDPOINTS.getAllStones());
      const data = res.data.stones || res.data || [];

      const mapped = data.map((s) => ({
        _id: s._id || s.id,
        stone_name: s.stone_name,
        stone_type: s.stone_type,
        stone_purity: s.stone_purity,
        stone_price: s.stone_price || 0,
        stone_image: s.fullImageUrl || s.stone_image || "",
      }));

      setStones(mapped);
    } catch (err) {
      console.error("Fetch stones error:", err);
      setError("Failed to load stones");
      setStones([]);
      toast.error("Failed to load stones. Please try again.", {
        autoClose: 4000,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Add Stone
  const addStone = useCallback(async (data, imageFile) => {
    // Show loading toast
    const toastId = toast.loading("Adding stone...");

    try {
      setLoading(true);
      setError("");

      const formData = new FormData();
      formData.append("stone_name", data.stone_name);
      formData.append("stone_type", data.stone_type);
      formData.append("stone_purity", data.stone_purity);
      formData.append("stone_price", data.stone_price);
      if (imageFile) formData.append("stone_image", imageFile);

      const res = await axios.post(
        API_ENDPOINTS.createStone(),
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const stone = res.data.stone || res.data;

      const newStone = {
        _id: stone._id,
        stone_name: stone.stone_name,
        stone_type: stone.stone_type,
        stone_purity: stone.stone_purity,
        stone_price: stone.stone_price,
        stone_image: stone.fullImageUrl || stone.stone_image || "",
      };

      setStones((prev) => [...prev, newStone]);

      // Update toast to success
      toast.update(toastId, {
        render: "Stone added successfully!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });

      return newStone;
    } catch (err) {
      const msg =
        err.response?.data?.message || "Failed to add stone";
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

  // ✅ Update Stone
  const updateStone = useCallback(async (id, data) => {
    // Show loading toast
    const toastId = toast.loading("Updating stone...");

    try {
      setLoading(true);
      setError("");

      const formData = new FormData();
      formData.append("stone_name", data.stone_name);
      formData.append("stone_type", data.stone_type);
      formData.append("stone_purity", data.stone_purity);
      formData.append("stone_price", data.stone_price);
      if (data.imageFile)
        formData.append("stone_image", data.imageFile);

      const res = await axios.put(
        API_ENDPOINTS.updateStone(id),
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const stone = res.data.stone || res.data;

      const updated = {
        _id: stone._id || id,
        stone_name: stone.stone_name,
        stone_type: stone.stone_type,
        stone_purity: stone.stone_purity,
        stone_price: stone.stone_price,
        stone_image: stone.fullImageUrl || stone.stone_image || "",
      };

      setStones((prev) =>
        prev.map((s) => (s._id === id ? updated : s))
      );

      // Update toast to success
      toast.update(toastId, {
        render: "Stone updated successfully!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });

      return updated;
    } catch (err) {
      setError("Failed to update stone");
      
      // Update toast to error
      toast.update(toastId, {
        render: err.response?.data?.message || "Failed to update stone. Please try again.",
        type: "error",
        isLoading: false,
        autoClose: 4000,
      });
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Delete Stone
  const deleteStone = useCallback(async (id) => {
    // Show loading toast
    const toastId = toast.loading("Deleting stone...");

    try {
      setLoading(true);
      setError("");

      await axios.delete(API_ENDPOINTS.deleteStone(id));

      setStones((prev) =>
        prev.filter((s) => s._id !== id)
      );

      // Update toast to success
      toast.update(toastId, {
        render: "Stone deleted successfully!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
    } catch (err) {
      setError("Failed to delete stone");
      
      // Update toast to error
      toast.update(toastId, {
        render: err.response?.data?.message || "Failed to delete stone. Please try again.",
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
    fetchStonePurities();
    fetchStones();
  }, [fetchStoneTypes, fetchStonePurities, fetchStones]);

  return {
    stones,
    stoneTypes,
    stonePurities,
    loading,
    error,
    addStone,
    updateStone,
    deleteStone,
    fetchStones,
    fetchStoneTypes,
    fetchStonePurities,
  };
}