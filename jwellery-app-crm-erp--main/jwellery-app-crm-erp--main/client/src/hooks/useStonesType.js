import { useState, useEffect } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "@/api/api";
import { toast } from "react-toastify";

export default function useStonesType() {
  const [stones, setStones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ Fetch Stones
  const fetchStones = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get(API_ENDPOINTS.getAllStoneTypes());
      console.log("API Response:", res.data);

      let stonesData = [];

      if (Array.isArray(res.data)) {
        stonesData = res.data;
      } else if (res.data?.stones) {
        stonesData = res.data.stones;
      }

      const mappedStones = stonesData.map((s) => ({
        _id: s._id || s.id,
        stone_type: s.stone_type || s.name || "",
        stone_image: s.fullImageUrl || s.stone_image || "",
      }));

      setStones(mappedStones);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to load stone types");
      toast.error("Failed to load stone types. Please try again.", {
        autoClose: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ Add Stone
  const addStone = async (stoneData, imageFile) => {
    const formData = new FormData();
    formData.append("stone_type", stoneData.stone_type);
    if (imageFile) formData.append("stone_image", imageFile);

    // Show loading toast
    const toastId = toast.loading("Adding stone type...");

    try {
      setLoading(true);
      setError("");

      const res = await axios.post(
        API_ENDPOINTS.createStoneType(),
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const stone = res.data.stone || res.data;

      const newStone = {
        _id: stone._id,
        stone_type: stone.stone_type,
        stone_image: stone.fullImageUrl || stone.stone_image || "",
      };

      setStones((prev) => [...prev, newStone]);

      // Update toast to success
      toast.update(toastId, {
        render: "Stone type added successfully!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });

      return newStone;
    } catch (err) {
      console.error("Add error:", err);
      setError("Failed to add stone type");

      // Update toast to error
      toast.update(toastId, {
        render: err.response?.data?.message || "Failed to add stone type. Please try again.",
        type: "error",
        isLoading: false,
        autoClose: 4000,
      });

      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ✅ Update Stone
  const updateStone = async (id, data) => {
    const formData = new FormData();
    formData.append("stone_type", data.stone_type);
    if (data.imageFile) formData.append("stone_image", data.imageFile);

    // Show loading toast
    const toastId = toast.loading("Updating stone type...");

    try {
      setLoading(true);
      setError("");

      const res = await axios.put(
        API_ENDPOINTS.updateStoneType(id),
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const stone = res.data.stone || res.data;

      const updatedStone = {
        _id: stone._id,
        stone_type: stone.stone_type,
        stone_image: stone.fullImageUrl || stone.stone_image || "",
      };

      setStones((prev) =>
        prev.map((s) => (s._id === id ? updatedStone : s))
      );

      // Update toast to success
      toast.update(toastId, {
        render: "Stone type updated successfully!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });

      return updatedStone;
    } catch (err) {
      console.error("Update error:", err);
      setError("Failed to update stone type");

      // Update toast to error
      toast.update(toastId, {
        render: err.response?.data?.message || "Failed to update stone type. Please try again.",
        type: "error",
        isLoading: false,
        autoClose: 4000,
      });

      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ✅ Delete Stone
  const deleteStone = async (id) => {
    // Show loading toast
    const toastId = toast.loading("Deleting stone type...");

    try {
      setLoading(true);
      setError("");

      await axios.delete(API_ENDPOINTS.deleteStoneType(id));

      setStones((prev) => prev.filter((s) => s._id !== id));

      // Update toast to success
      toast.update(toastId, {
        render: "Stone type deleted successfully!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
    } catch (err) {
      console.error("Delete error:", err);
      setError("Failed to delete stone type");

      // Update toast to error
      toast.update(toastId, {
        render: err.response?.data?.message || "Failed to delete stone type. Please try again.",
        type: "error",
        isLoading: false,
        autoClose: 4000,
      });

      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStones();
  }, []);

  return {
    stones,
    loading,
    error,
    addStone,
    updateStone,
    deleteStone,
    fetchStones,
    refetch: fetchStones,
  };
}