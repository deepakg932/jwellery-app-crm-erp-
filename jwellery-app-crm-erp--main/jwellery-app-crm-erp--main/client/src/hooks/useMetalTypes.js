import { useState, useEffect } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "@/api/api";
import { toast } from "react-toastify";

export default function useMetalTypes() {
  const [metalTypes, setMetalTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchMetalTypes = async () => {
    try {
      setLoading(true);

      const res = await axios.get(API_ENDPOINTS.getMetals());
      console.log("API Response:", res.data);

      let metals = [];

      if (Array.isArray(res.data)) {
        metals = res.data;
      } else if (res.data && Array.isArray(res.data.metals)) {
        metals = res.data.metals;
      } else if (res.data && Array.isArray(res.data.data)) {
        metals = res.data.data;
      } else if (
        res.data &&
        res.data.success &&
        Array.isArray(res.data.metals)
      ) {
        metals = res.data.metals;
      }

      const mappedMetals = metals.map((m) => ({
        _id: m._id || m.id,
        name: m.name || "",
        image: m.fullImageUrl || m.image || "",
      }));

      console.log("Fetched metals:", mappedMetals);
      setMetalTypes(mappedMetals);

    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to load metal types");
      toast.error("Failed to load metal types. Please try again.", {
        autoClose: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  const addMetalType = async (name, imageFile) => {
    const formData = new FormData();
    formData.append("name", name);
    if (imageFile) formData.append("image", imageFile);

    // Show loading toast
    const toastId = toast.loading("Adding metal type...");

    try {
      setLoading(true);

      const res = await axios.post(API_ENDPOINTS.createMetal(), formData);
      console.log("Add response:", res.data);

      let newMetal = {};

      if (res.data && res.data.success && res.data.metal) {
        newMetal = {
          _id: res.data.metal._id || res.data.metal.id,
          name: res.data.metal.name,
          image: res.data.metal.fullImageUrl || res.data.metal.image || "",
        };
      } else if (res.data) {
        newMetal = {
          _id: res.data._id || res.data.id,
          name: res.data.name,
          image: res.data.fullImageUrl || res.data.image || "",
        };
      }

      setMetalTypes((prev) => [...prev, newMetal]);

      // Update toast to success
      toast.update(toastId, {
        render: "Metal type added successfully!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });

      return newMetal;
    } catch (err) {
      console.error("Add error:", err);
      setError("Failed to add metal type");

      // Update toast to error
      toast.update(toastId, {
        render:
          err.response?.data?.message ||
          "Failed to add metal type. Please try again.",
        type: "error",
        isLoading: false,
        autoClose: 4000,
      });

      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateMetalType = async (id, data) => {
    const formData = new FormData();
    formData.append("name", data.name);
    if (data.imageFile) formData.append("image", data.imageFile);

    // Show loading toast
    const toastId = toast.loading("Updating metal type...");

    try {
      setLoading(true);
      console.log("Updating metal with ID:", id, "Data:", data);

      const res = await axios.put(API_ENDPOINTS.updateMetal(id), formData);
      console.log("Update response:", res.data);

      let updatedData = {};
      if (res.data && res.data.success && res.data.metal) {
        updatedData = {
          _id: res.data.metal._id || res.data.metal.id || id,
          name: res.data.metal.name || data.name,
          image: res.data.metal.fullImageUrl || res.data.metal.image || "",
        };
      } else if (res.data) {
        updatedData = {
          _id: res.data._id || res.data.id || id,
          name: res.data.name || data.name,
          image: res.data.fullImageUrl || res.data.image || "",
        };
      } else {
        updatedData = {
          _id: id,
          name: data.name,
          image: "",
        };
      }

      setMetalTypes((prev) =>
        prev.map((m) => (m._id === id ? updatedData : m)),
      );

      // Update toast to success
      toast.update(toastId, {
        render: "Metal type updated successfully!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });

      console.log("Updated metal data:", updatedData);
      return updatedData;
    } catch (err) {
      console.error("Update error:", err);
      setError("Failed to update metal type");

      // Update toast to error
      toast.update(toastId, {
        render:
          err.response?.data?.message ||
          "Failed to update metal type. Please try again.",
        type: "error",
        isLoading: false,
        autoClose: 4000,
      });

      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteMetalType = async (id) => {
    // Show loading toast
    const toastId = toast.loading("Deleting metal type...");

    try {
      setLoading(true);

      await axios.delete(API_ENDPOINTS.deleteMetal(id));
      setMetalTypes((prev) => prev.filter((m) => m._id !== id));

      // Update toast to success
      toast.update(toastId, {
        render: "Metal type deleted successfully!",
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
          "Failed to delete metal type. Please try again.",
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
    fetchMetalTypes();
  }, []);

  return {
    metalTypes,
    loading,
    error,
    addMetalType,
    updateMetalType,
    deleteMetalType,
    fetchMetalTypes,
  };
}
