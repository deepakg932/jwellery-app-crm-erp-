import { useState, useEffect } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "@/api/api";
import { toast } from "react-toastify";

export default function useBrands() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ Fetch Brands
  const fetchBrands = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get(API_ENDPOINTS.getBrands());
      console.log("API Response:", res.data);

      let brandsData = [];

      if (Array.isArray(res.data)) {
        brandsData = res.data;
      } else if (res.data?.brands) {
        brandsData = res.data.brands;
      }

      const mappedBrands = brandsData.map((b) => ({
        _id: b._id || b.id,
        name: b.name || "",
        logo: b.fullLogoUrl || b.logo || "",
      }));

      setBrands(mappedBrands);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to load brands");
      toast.error("Failed to load brands. Please try again.", {
        autoClose: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ Add Brand
  const addBrand = async (name, logoFile) => {
    const formData = new FormData();
    formData.append("name", name);
    if (logoFile) formData.append("logo", logoFile);

    // Show loading toast
    const toastId = toast.loading("Adding brand...");

    try {
      setLoading(true);
      setError("");

      const res = await axios.post(
        API_ENDPOINTS.createBrand(),
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const brand = res.data.brand || res.data;

      const newBrand = {
        _id: brand._id,
        name: brand.name,
        logo: brand.fullLogoUrl || brand.logo || "",
      };

      setBrands((prev) => [...prev, newBrand]);

      // Update toast to success
      toast.update(toastId, {
        render: "Brand added successfully!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });

      return newBrand;
    } catch (err) {
      console.error("Add error:", err);
      setError("Failed to add brand");

      // Update toast to error
      toast.update(toastId, {
        render: err.response?.data?.message || "Failed to add brand. Please try again.",
        type: "error",
        isLoading: false,
        autoClose: 4000,
      });

      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ✅ Update Brand
  const updateBrand = async (id, data) => {
    const formData = new FormData();
    formData.append("name", data.name);
    if (data.logoFile) formData.append("logo", data.logoFile);

    // Show loading toast
    const toastId = toast.loading("Updating brand...");

    try {
      setLoading(true);
      setError("");

      const res = await axios.put(
        API_ENDPOINTS.updateBrand(id),
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const brand = res.data.brand || res.data;

      const updatedBrand = {
        _id: brand._id,
        name: brand.name,
        logo: brand.fullLogoUrl || brand.logo || "",
      };

      setBrands((prev) =>
        prev.map((b) => (b._id === id ? updatedBrand : b))
      );

      // Update toast to success
      toast.update(toastId, {
        render: "Brand updated successfully!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });

      return updatedBrand;
    } catch (err) {
      console.error("Update error:", err);
      setError("Failed to update brand");

      // Update toast to error
      toast.update(toastId, {
        render: err.response?.data?.message || "Failed to update brand. Please try again.",
        type: "error",
        isLoading: false,
        autoClose: 4000,
      });

      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ✅ Delete Brand
  const deleteBrand = async (id) => {
    // Show loading toast
    const toastId = toast.loading("Deleting brand...");

    try {
      setLoading(true);
      setError("");

      await axios.delete(API_ENDPOINTS.deleteBrand(id));

      setBrands((prev) => prev.filter((b) => b._id !== id));

      // Update toast to success
      toast.update(toastId, {
        render: "Brand deleted successfully!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
    } catch (err) {
      console.error("Delete error:", err);
      setError("Failed to delete brand");

      // Update toast to error
      toast.update(toastId, {
        render: err.response?.data?.message || "Failed to delete brand. Please try again.",
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
    fetchBrands();
  }, []);

  return {
    brands,
    loading,
    error,
    addBrand,
    updateBrand,
    deleteBrand,
    fetchBrands,
  };
}