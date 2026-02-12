import { useState, useEffect } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "@/api/api";

export default function useBrands() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Helper function (local to this hook)
  const normalizeResponseData = (data, fieldName) => {
    if (!data) return [];
    
    if (Array.isArray(data)) {
      return data;
    } else if (Array.isArray(data?.[fieldName])) {
      return data[fieldName];
    } else if (data?.success && Array.isArray(data[fieldName])) {
      return data[fieldName];
    } else if (Array.isArray(data?.data)) {
      return data.data;
    }
    return [];
  };

const fetchBrands = async () => {
  try {
    setLoading(true);
    
    const url = API_ENDPOINTS.getBrands();
    console.log("Fetching brands from:", url);
    
    const res = await axios.get(url);
    console.log("API Response:", res.data);
    
    const brandsData = normalizeResponseData(res.data, 'brands');
    
    // IMPORTANT: Map the logo property correctly
    const mappedBrands = brandsData.map((b) => ({
      _id: b._id || b.id,
      name: b.name || "",
      // Use fullLogoUrl from the response
      logo: b.fullLogoUrl || b.logo || "",
    }));
    
    console.log("Fetched brands:", mappedBrands);
    setBrands(mappedBrands);
  } catch (err) {
    console.error("Fetch error:", err);
    setError("Failed to load brands");
  } finally {
    setLoading(false);
  }
};

const addBrand = async (name, logoFile) => {
  const formData = new FormData();
  formData.append("name", name);
  if (logoFile) formData.append("logo", logoFile);

  try {
    setLoading(true);
    
    const url = API_ENDPOINTS.createBrand();
    console.log("Adding brand at:", url);
    
    const res = await axios.post(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    
    console.log("Add response:", res.data);
    
    let newBrand = {
      _id: "",
      name: name,
      logo: ""
    };
    
    // Based on your response structure
    if (res.data?.status && res.data.brand) {
      // Response has status: true and brand object
      newBrand = {
        _id: res.data.brand._id || "",
        name: res.data.brand.name || name,
        // Use fullLogoUrl from the response
        logo: res.data.brand.fullLogoUrl || ""
      };
    } else if (res.data?.brand) {
      // Response has brand object directly
      newBrand = {
        _id: res.data.brand._id || "",
        name: res.data.brand.name || name,
        logo: res.data.brand.fullLogoUrl || res.data.brand.logo || ""
      };
    } else if (res.data?._id) {
      // Response is the brand object itself
      newBrand = {
        _id: res.data._id || "",
        name: res.data.name || name,
        logo: res.data.fullLogoUrl || res.data.logo || ""
      };
    }
    
    console.log("New brand to add:", newBrand);
    
    // Update the state with the new brand
    setBrands(prev => [...prev, newBrand]);
    return newBrand;
  } catch (err) {
    console.error("Add error:", err);
    setError("Failed to add brand");
    throw err;
  } finally {
    setLoading(false);
  }
};

const updateBrand = async (id, data) => {
  const formData = new FormData();
  formData.append("name", data.name);
  if (data.logoFile) formData.append("logo", data.logoFile);

  try {
    setLoading(true);
    
    const url = API_ENDPOINTS.updateBrand(id);
    console.log("Updating brand at:", url);
    
    const res = await axios.put(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    
    console.log("Update response:", res.data);
    
    let updatedData = {
      _id: id,
      name: data.name,
      logo: data.logo || ""
    };
    
    // Based on your response structure
    if (res.data?.status && res.data.brand) {
      const { brand } = res.data;
      updatedData = {
        _id: brand._id || id,
        name: brand.name || data.name,
        // Use fullLogoUrl from the response
        logo: brand.fullLogoUrl || brand.logo || data.logo || ""
      };
    } else if (res.data?.brand) {
      const { brand } = res.data;
      updatedData = {
        _id: brand._id || id,
        name: brand.name || data.name,
        logo: brand.fullLogoUrl || brand.logo || data.logo || ""
      };
    }
    
    console.log("Updated brand data:", updatedData);
    setBrands(prev => prev.map(b => (b._id === id ? updatedData : b)));
    return updatedData;
  } catch (err) {
    console.error("Update error:", err);
    setError("Failed to update brand");
    throw err;
  } finally {
    setLoading(false);
  }
};

  const deleteBrand = async (id) => {
    try {
      setLoading(true);
      await axios.delete(API_ENDPOINTS.deleteBrand(id));
      setBrands(prev => prev.filter((b) => b._id !== id));
    } catch (err) {
      console.error("Delete error:", err);
      setError("Failed to delete");
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