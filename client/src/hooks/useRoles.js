import { useState, useEffect } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "@/api/api";

export default function useRoles() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchRoles = async () => {
    try {
      setLoading(true);
      setError("");
      
      const url = API_ENDPOINTS.getRoles();
      console.log("Fetching roles from:", url);
      
      const res = await axios.get(url);
      console.log("Full API Response:", res.data);
      
      let rolesData = [];
      
      // Based on your API structure
      if (res.data?.success) {
        console.log("Response has success: true");
        
        if (Array.isArray(res.data)) {
          rolesData = res.data;
          console.log("Data is direct array in response");
        }
        else if (Array.isArray(res.data.data)) {
          rolesData = res.data.data;
          console.log("Data found in res.data.data");
        }
        else if (Array.isArray(res.data.roles)) {
          rolesData = res.data.roles;
          console.log("Data found in res.data.roles");
        }
        else {
          console.log("Searching for array in response properties...");
          for (const key in res.data) {
            if (Array.isArray(res.data[key]) && key !== 'success') {
              rolesData = res.data[key];
              console.log(`Found array in property: ${key}`);
              break;
            }
          }
        }
      } 
      else if (Array.isArray(res.data)) {
        rolesData = res.data;
        console.log("Response is direct array");
      }
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
          rolesData = foundArray;
          console.log("Found nested array in response");
        }
      }
      
      console.log("Extracted roles data:", rolesData);
      
      const mappedRoles = rolesData.map((item) => ({
        _id: item._id || item.id,
        role_name: item.role_name || item.name || "",
        description: item.description || "",
        status: item.status !== false,
      }));
      
      console.log("Mapped roles:", mappedRoles);
      setRoles(mappedRoles);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to load roles");
    } finally {
      setLoading(false);
    }
  };

  const addRole = async (roleData) => {
    try {
      setLoading(true);
      setError("");
      
      const url = API_ENDPOINTS.createRole();
      console.log("Adding role at:", url);
      
      const res = await axios.post(url, roleData);
      
      console.log("Add response:", res.data);
      
      let newRole = {};
      
      if (res.data?.success) {
        const responseData = res.data.created || res.data.data || res.data;
        newRole = {
          _id: responseData._id || responseData.id,
          role_name: responseData.role_name || roleData.role_name,
          description: responseData.description || roleData.description,
          status: responseData.status !== false,
        };
      }
      
      console.log("New role to add:", newRole);
      
      setRoles(prev => [...prev, newRole]);
      
      setTimeout(() => {
        fetchRoles();
      }, 100);
      
      return newRole;
    } catch (err) {
      console.error("Add error:", err);
      setError("Failed to add role");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateRole = async (id, roleData) => {
    try {
      setLoading(true);
      setError("");
      
      const url = API_ENDPOINTS.updateRole(id);
      console.log("Updating role at:", url);
      
      const res = await axios.put(url, roleData);
      
      console.log("Update response:", res.data);
      
      let updatedData = {
        _id: id,
        role_name: roleData.role_name,
        description: roleData.description,
        status: true,
      };
      
      if (res.data?.success) {
        const responseData = res.data.created || res.data.data || res.data;
        updatedData = {
          _id: responseData._id || responseData.id || id,
          role_name: responseData.role_name || roleData.role_name,
          description: responseData.description || roleData.description,
          status: responseData.status !== false,
        };
      }
      
      console.log("Updated role data:", updatedData);
      setRoles(prev => prev.map(item => (item._id === id ? updatedData : item)));
      
      setTimeout(() => {
        fetchRoles();
      }, 100);
      
      return updatedData;
    } catch (err) {
      console.error("Update error:", err);
      setError("Failed to update role");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteRole = async (id) => {
    try {
      setLoading(true);
      setError("");
      
      const url = API_ENDPOINTS.deleteRole(id);
      console.log("Deleting role at:", url);
      
      const res = await axios.delete(url);
      console.log("Delete response:", res.data);
      
      if (res.data?.success) {
        setRoles(prev => prev.filter((item) => item._id !== id));
      } else {
        throw new Error(res.data?.message || "Failed to delete role");
      }
    } catch (err) {
      console.error("Delete error:", err);
      setError("Failed to delete role");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  return {
    roles,
    loading,
    error,
    addRole,
    updateRole,
    deleteRole,
    fetchRoles,
  };
}