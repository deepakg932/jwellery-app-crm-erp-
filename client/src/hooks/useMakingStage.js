import { useState, useEffect } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "@/api/api";
import { toast } from "react-toastify";

export const useMakingStage = () => {
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchStages = async () => {
    try {
      setLoading(true);

      // Using API_ENDPOINTS
      const res = await axios.get(API_ENDPOINTS.getMakingStages());
      console.log("API Response:", res.data);

      let stagesData = [];

      // Handle different response structures
      if (Array.isArray(res.data)) {
        stagesData = res.data;
      } else if (res.data && Array.isArray(res.data.stages)) {
        stagesData = res.data.stages;
      } else if (res.data && Array.isArray(res.data.data)) {
        stagesData = res.data.data;
      } else if (res.data && res.data.success && Array.isArray(res.data.data)) {
        stagesData = res.data.data;
      }

      // Map to consistent structure - only name field
      const mappedStages = stagesData.map((s) => ({
        _id: s._id || s.id,
        stage_name: s.stage_name || s.makingStage || "",
      }));

      console.log("Fetched stages:", mappedStages);
      setStages(mappedStages);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to load stages");
      toast.error("Failed to load making stages. Please try again.", {
        autoClose: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  const addStage = async (stage_name) => {
    // If your API expects {name} directly
    const payload = { stage_name };

    // Show loading toast
    const toastId = toast.loading("Adding making stage...");

    try {
      setLoading(true);

      // Using API_ENDPOINTS
      const res = await axios.post(API_ENDPOINTS.createMakingStage(), payload);
      console.log("Add response:", res.data);

      let newStage = {};

      // Check for different response structures
      if (res.data && res.data.success && res.data.stage) {
        newStage = {
          _id: res.data.stage._id || res.data.stage.id,
          stage_name: res.data.stage.stage_name || stage_name,
        };
      } else if (res.data) {
        newStage = {
          _id: res.data._id || res.data.id,
          stage_name: res.data.stage_name || stage_name,
        };
      } else {
        newStage = {
          _id: `temp-${Date.now()}`,
          stage_name: stage_name,
        };
      }

      console.log("New stage to add:", newStage);
      setStages((prev) => [...prev, newStage]);

      // Update toast to success
      toast.update(toastId, {
        render: "Making stage added successfully!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });

      return newStage;
    } catch (err) {
      console.error("Add error:", err);
      setError("Failed to add stage");

      // Update toast to error
      toast.update(toastId, {
        render:
          err.response?.data?.message ||
          "Failed to add making stage. Please try again.",
        type: "error",
        isLoading: false,
        autoClose: 4000,
      });

      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateStage = async (id, stage_name) => {
    // If your API expects {name} directly
    const payload = { stage_name };
    console.log(payload);

    // Show loading toast
    const toastId = toast.loading("Updating making stage...");

    try {
      setLoading(true);
      // console.log("Updating stage with ID:", id, "Name:", name);

      // Using API_ENDPOINTS
      const res = await axios.put(API_ENDPOINTS.updateMakingStage(id), payload);
      console.log("Update response:", res.data);

      let updatedData = {};
      if (res.data && res.data.success && res.data.stage) {
        updatedData = {
          _id: res.data.stage._id || res.data.stage.id || id,
          stage_name: res.data.stage.stage_name || stage_name,
        };
      } else if (res.data) {
        updatedData = {
          _id: res.data._id || res.data.id || id,
          stage_name: res.data.stage_name || stage_name,
        };
      } else {
        updatedData = {
          _id: id,
          stage_name: stage_name,
        };
      }

      setStages((prev) =>
        prev.map((stage) => (stage._id === id ? updatedData : stage)),
      );

      // Update toast to success
      toast.update(toastId, {
        render: "Making stage updated successfully!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });

      return updatedData;
    } catch (err) {
      console.error("Update error:", err);
      setError("Failed to update stage");

      // Update toast to error
      toast.update(toastId, {
        render:
          err.response?.data?.message ||
          "Failed to update making stage. Please try again.",
        type: "error",
        isLoading: false,
        autoClose: 4000,
      });

      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteStage = async (id) => {
    // Show loading toast
    const toastId = toast.loading("Deleting making stage...");

    try {
      setLoading(true);

      // Using API_ENDPOINTS
      await axios.delete(API_ENDPOINTS.deleteMakingStage(id));
      setStages((prev) => prev.filter((stage) => stage._id !== id));

      // Update toast to success
      toast.update(toastId, {
        render: "Making stage deleted successfully!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
    } catch (err) {
      console.error("Delete error:", err);
      setError("Failed to delete");

      // Update toast to error
      toast.update(toastId, {
        render:
          err.response?.data?.message ||
          "Failed to delete making stage. Please try again.",
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
    fetchStages();
  }, []);

  return {
    stages,
    loading,
    error,
    addStage,
    updateStage,
    deleteStage,
    fetchStages,
  };
};
