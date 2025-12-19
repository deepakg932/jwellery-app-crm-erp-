// hooks/useMaterial.js
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '@/api/api';

export const useMaterial = () => {
  const [materials, setMaterials] = useState([]);
  const [metals, setMetals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch all material types from API
  const fetchMaterials = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const url = API_ENDPOINTS.getMaterialTypes();
      console.log("Fetching material types from:", url);
      
      const res = await axios.get(url);
      console.log("Material Types API Response:", res.data);
      
      let materialData = [];
      
      if (res.data?.success && Array.isArray(res.data.data)) {
        materialData = res.data.data;
      }
      
      const mappedMaterials = materialData.map((item) => ({
        _id: item._id,
        material_type: item.material_type || '',
        metal_id: item.metal_id?._id || '',
        metal_name: item.metal_id?.name || '',
        created_at: item.createdAt,
        updated_at: item.updatedAt,
      }));
      
      setMaterials(mappedMaterials);
      return mappedMaterials;
    } catch (err) {
      console.error("Fetch material types error:", err);
      setError("Failed to load material types");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch all metals from API
  const fetchMetals = useCallback(async () => {
    try {
      const url = API_ENDPOINTS.getMetals();
      console.log("Fetching metals from:", url);
      
      const res = await axios.get(url);
      console.log("Metals API Response:", res.data);
      
      let metalData = [];
      
      if (res.data?.success && Array.isArray(res.data.metals)) {
        metalData = res.data.metals;
      }
      
      const mappedMetals = metalData.map((item) => ({
        _id: item._id,
        name: item.name || '',
        image: item.image || '',
        fullImageUrl: item.fullImageUrl || '',
      }));
      
      setMetals(mappedMetals);
      return mappedMetals;
    } catch (err) {
      console.error("Fetch metals error:", err);
      setError("Failed to load metals");
      throw err;
    }
  }, []);

  // Add a new material type to API
  const addMaterial = async (materialData) => {
    try {
      setLoading(true);
      setError('');
      
      const url = API_ENDPOINTS.createMaterialTypes();
      console.log("Adding material type at:", url, "Data:", materialData);
      
      const payload = {
        material_type: materialData.material_type || '',
        metal_id: materialData.metal_type || '', // Send metal_id, not metal_type
      };
      
      const res = await axios.post(url, payload);
      console.log("Add material type response:", res.data);
      
      // Refresh the list from API
      await fetchMaterials();
      
      return res.data;
    } catch (err) {
      console.error("Add material type error:", err);
      setError("Failed to add material type");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update an existing material type in API
  const updateMaterial = async (id, materialData) => {
    try {
      setLoading(true);
      setError('');
      
      const url = API_ENDPOINTS.updateMaterialTypes(id);
      console.log("Updating material type at:", url, "Data:", materialData);
      
      const payload = {
        material_type: materialData.material_type || '',
        metal_id: materialData.metal_type || '',
      };
      
      const res = await axios.put(url, payload);
      console.log("Update material type response:", res.data);
      
      // Refresh the list from API
      await fetchMaterials();
      
      return res.data;
    } catch (err) {
      console.error("Update material type error:", err);
      setError("Failed to update material type");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete a material type from API
  const deleteMaterial = async (id) => {
    try {
      setLoading(true);
      setError('');
      
      const url = API_ENDPOINTS.deleteMaterialTypes(id);
      console.log("Deleting material type at:", url);
      
      const res = await axios.delete(url);
      console.log("Delete material type response:", res.data);
      
      // Refresh the list from API
      await fetchMaterials();
      
      return res.data;
    } catch (err) {
      console.error("Delete material type error:", err);
      setError("Failed to delete material type");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Initialize with data from APIs
  useEffect(() => {
    fetchMaterials();
    fetchMetals();
  }, [fetchMaterials, fetchMetals]);

  return {
    materials,
    metals,
    loading,
    error,
    addMaterial,
    updateMaterial,
    deleteMaterial,
    fetchMaterials,
    fetchMetals,
  };
};