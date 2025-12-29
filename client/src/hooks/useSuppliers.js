import { useState, useEffect } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "@/api/api";

export default function useSuppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch all suppliers
  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      setError("");

      const url = API_ENDPOINTS.getSuppliers(); // Add this to your api.js
      console.log("Fetching suppliers from:", url);

      const res = await axios.get(url);
      console.log("Suppliers API Response:", res.data);

      let suppliersData = [];

      // Handle your specific response structure
      if (res.data?.fetched && Array.isArray(res.data.fetched)) {
        suppliersData = res.data.fetched;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        suppliersData = res.data.data;
      } else if (Array.isArray(res.data)) {
        suppliersData = res.data;
      }

      const mappedSuppliers = suppliersData.map((item) => ({
        _id: item._id || item.id,
        supplier_name: item.supplier_name || item.name || "",
        phone: item.phone || "",
        email: item.email || "",
        address: item.address || "",
        status: item.status !== false,
      }));

      console.log("Fetched suppliers:", mappedSuppliers);
      setSuppliers(mappedSuppliers);
    } catch (err) {
      console.error("Fetch suppliers error:", err);
      setError("Failed to load suppliers");
    } finally {
      setLoading(false);
    }
  };

  // Add a new supplier
  const addSupplier = async (supplierData) => {
    try {
      setLoading(true);
      setError("");

      const url = API_ENDPOINTS.createSupplier(); // Add this to your api.js
      console.log("Adding supplier at:", url, "Data:", supplierData);

      const res = await axios.post(url, supplierData);
      console.log("Add supplier response:", res.data);

      let newSupplier = {
        _id: `temp-${Date.now()}`,
        ...supplierData,
        status: supplierData.status !== false,
      };

      if (res.data?.status !== false) {
        // Check if response has created, data, or fetched
        const responseData = res.data.created || res.data.data || res.data.fetched || res.data;
        newSupplier = {
          _id: responseData._id || responseData.id,
          supplier_name: responseData.supplier_name || supplierData.supplier_name,
          phone: responseData.phone || supplierData.phone,
          email: responseData.email || supplierData.email,
          address: responseData.address || supplierData.address,
          status: responseData.status !== false,
        };
      }

      console.log("New supplier to add:", newSupplier);
      setSuppliers(prev => [...prev, newSupplier]);
      
      // Refetch to ensure consistency
      setTimeout(() => {
        fetchSuppliers();
      }, 500);
      
      return newSupplier;
    } catch (err) {
      console.error("Add supplier error:", err);
      setError("Failed to add supplier");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update a supplier
  const updateSupplier = async (id, supplierData) => {
    try {
      setLoading(true);
      setError("");

      const url = API_ENDPOINTS.updateSupplier(id); // Add this to your api.js
      console.log("Updating supplier at:", url, "Data:", supplierData);

      const res = await axios.put(url, supplierData);
      console.log("Update supplier response:", res.data);

      if (res.data?.status !== false) {
        // Check if response has updated, data, or fetched
        const responseData = res.data.updated || res.data.data || res.data.fetched || res.data;
        const updatedData = {
          _id: responseData._id || responseData.id || id,
          supplier_name: responseData.supplier_name || supplierData.supplier_name,
          phone: responseData.phone || supplierData.phone,
          email: responseData.email || supplierData.email,
          address: responseData.address || supplierData.address,
          status: responseData.status !== false,
        };

        console.log("Updated supplier data:", updatedData);
        setSuppliers(prev => prev.map(item => (item._id === id ? updatedData : item)));
        
        // Refetch to ensure consistency
        setTimeout(() => {
          fetchSuppliers();
        }, 500);
        
        return updatedData;
      } else {
        throw new Error(res.data?.message || "Failed to update supplier");
      }
    } catch (err) {
      console.error("Update supplier error:", err);
      setError("Failed to update supplier");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete a supplier
  const deleteSupplier = async (id) => {
    try {
      setLoading(true);
      setError("");

      const url = API_ENDPOINTS.deleteSupplier(id); // Add this to your api.js
      console.log("Deleting supplier at:", url);

      const res = await axios.delete(url);
      console.log("Delete response:", res.data);

      if (res.data?.status !== false) {
        setSuppliers(prev => prev.filter((item) => item._id !== id));
      } else {
        throw new Error(res.data?.message || "Failed to delete supplier");
      }
    } catch (err) {
      console.error("Delete supplier error:", err);
      setError("Failed to delete supplier");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  return {
    suppliers,
    loading,
    error,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    fetchSuppliers,
  };
}