import { useState, useEffect } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "@/api/api";

export default function useBranchTypes() {
  const [branchTypes, setBranchTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchBranchTypes = async () => {
    try {
      setLoading(true);
      setError("");
      
      const url = API_ENDPOINTS.getBranchTypes();
      console.log("Fetching branch types from:", url);
      
      const res = await axios.get(url);
      console.log("Full API Response:", res.data);
      
      let branchTypesData = [];
      
      // Based on your POST response, GET might have similar structure
      // Let's check different possible structures
      if (res.data?.success) {
        console.log("Response has success: true");
        
        // Check if data is directly in response
        if (Array.isArray(res.data)) {
          branchTypesData = res.data;
          console.log("Data is direct array in response");
        }
        // Check common data properties
        else if (Array.isArray(res.data.data)) {
          branchTypesData = res.data.data;
          console.log("Data found in res.data.data");
        }
        // Check for branchTypes array
        else if (Array.isArray(res.data.branchTypes)) {
          branchTypesData = res.data.branchTypes;
          console.log("Data found in res.data.branchTypes");
        }
        // If no array found, check all properties
        else {
          console.log("Searching for array in response properties...");
          for (const key in res.data) {
            if (Array.isArray(res.data[key]) && key !== 'success') {
              branchTypesData = res.data[key];
              console.log(`Found array in property: ${key}`);
              break;
            }
          }
        }
      } 
      // If no success property, check if response is directly an array
      else if (Array.isArray(res.data)) {
        branchTypesData = res.data;
        console.log("Response is direct array");
      }
      // Check if response has a nested array
      else if (res.data && typeof res.data === 'object') {
        console.log("Response is object, searching for nested array...");
        const findArray = (obj) => {
          for (const key in obj) {
            if (Array.isArray(obj[key])) {
              return obj[key];
            }
            if (typeof obj[key] === 'object' && obj[key] !== null) {
              const found = findArray(obj[key]);
              if (found) return found;
            }
          }
          return null;
        };
        
        const foundArray = findArray(res.data);
        if (foundArray) {
          branchTypesData = foundArray;
          console.log("Found nested array in response");
        }
      }
      
      console.log("Extracted branch types data:", branchTypesData);
      
      const mappedBranchTypes = branchTypesData.map((item) => ({
        _id: item._id || item.id,
        branch_type: item.branch_type || item.name || "",
        status: item.status !== false,
      }));
      
      console.log("Mapped branch types:", mappedBranchTypes);
      setBranchTypes(mappedBranchTypes);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to load branch types");
    } finally {
      setLoading(false);
    }
  };

  const addBranchType = async (branchTypeName) => {
    try {
      setLoading(true);
      setError("");
      
      const url = API_ENDPOINTS.createBranchType();
      console.log("Adding branch type at:", url);
      
      const res = await axios.post(url, { 
        branch_type: branchTypeName 
      });
      
      console.log("Add response:", res.data);
      
      let newBranchType = {};
      
      if (res.data?.success) {
        // Handle both "creatded" (typo) and "data" response structures
        const responseData = res.data.creatded || res.data.data || res.data;
        newBranchType = {
          _id: responseData._id || responseData.id,
          branch_type: responseData.branch_type || branchTypeName,
          status: responseData.status !== false,
        };
      }
      
      console.log("New branch type to add:", newBranchType);
      
      // IMPORTANT: Update local state AND refetch from server
      setBranchTypes(prev => [...prev, newBranchType]);
      
      // Also refetch to ensure data is synced with server
      setTimeout(() => {
        fetchBranchTypes();
      }, 100);
      
      return newBranchType;
    } catch (err) {
      console.error("Add error:", err);
      setError("Failed to add branch type");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateBranchType = async (id, branchTypeName) => {
    try {
      setLoading(true);
      setError("");
      
      const url = API_ENDPOINTS.updateBranchType(id);
      console.log("Updating branch type at:", url);
      
      const res = await axios.put(url, { 
        branch_type: branchTypeName 
      });
      
      console.log("Update response:", res.data);
      
      let updatedData = {
        _id: id,
        branch_type: branchTypeName,
        status: true,
      };
      
      if (res.data?.success) {
        const responseData = res.data.creatded || res.data.data || res.data;
        updatedData = {
          _id: responseData._id || responseData.id || id,
          branch_type: responseData.branch_type || branchTypeName,
          status: responseData.status !== false,
        };
      }
      
      console.log("Updated branch type data:", updatedData);
      setBranchTypes(prev => prev.map(item => (item._id === id ? updatedData : item)));
      
      // Refetch to ensure data is synced
      setTimeout(() => {
        fetchBranchTypes();
      }, 100);
      
      return updatedData;
    } catch (err) {
      console.error("Update error:", err);
      setError("Failed to update branch type");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteBranchType = async (id) => {
    try {
      setLoading(true);
      setError("");
      
      const url = API_ENDPOINTS.deleteBranchType(id);
      console.log("Deleting branch type at:", url);
      
      const res = await axios.delete(url);
      console.log("Delete response:", res.data);
      
      if (res.data?.success) {
        setBranchTypes(prev => prev.filter((item) => item._id !== id));
      } else {
        throw new Error(res.data?.message || "Failed to delete branch type");
      }
    } catch (err) {
      console.error("Delete error:", err);
      setError("Failed to delete branch type");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranchTypes();
  }, []);

  return {
    branchTypes,
    loading,
    error,
    addBranchType,
    updateBranchType,
    deleteBranchType,
    fetchBranchTypes,
  };
}