import { useState, useEffect } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "@/api/api";

export default function useCustomerGroups() {
  const [customerGroups, setCustomerGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchCustomerGroups = async () => {
    try {
      setLoading(true);
      setError("");
      
      const url = API_ENDPOINTS.getCustomerGroups();
      console.log("Fetching customer groups from:", url);
      
      const res = await axios.get(url);
      console.log("Full API Response:", res.data);
      
      let customerGroupsData = [];
      
      // Based on your branch types API structure
      if (res.data?.success) {
        console.log("Response has success: true");
        
        if (Array.isArray(res.data)) {
          customerGroupsData = res.data;
          console.log("Data is direct array in response");
        }
        else if (Array.isArray(res.data.data)) {
          customerGroupsData = res.data.data;
          console.log("Data found in res.data.data");
        }
        else if (Array.isArray(res.data.customerGroups)) {
          customerGroupsData = res.data.customerGroups;
          console.log("Data found in res.data.customerGroups");
        }
        else {
          console.log("Searching for array in response properties...");
          for (const key in res.data) {
            if (Array.isArray(res.data[key]) && key !== 'success') {
              customerGroupsData = res.data[key];
              console.log(`Found array in property: ${key}`);
              break;
            }
          }
        }
      } 
      else if (Array.isArray(res.data)) {
        customerGroupsData = res.data;
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
          customerGroupsData = foundArray;
          console.log("Found nested array in response");
        }
      }
      
      console.log("Extracted customer groups data:", customerGroupsData);
      
      const mappedCustomerGroups = customerGroupsData.map((item) => ({
        _id: item._id || item.id,
        customer_group: item.customer_group || item.name || "",
        status: item.status !== false,
      }));
      
      console.log("Mapped customer groups:", mappedCustomerGroups);
      setCustomerGroups(mappedCustomerGroups);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to load customer groups");
    } finally {
      setLoading(false);
    }
  };

  const addCustomerGroup = async (customerGroupName) => {
    try {
      setLoading(true);
      setError("");
      
      const url = API_ENDPOINTS.createCustomerGroup();
      console.log("Adding customer group at:", url);
      
      const res = await axios.post(url, { 
        customer_group: customerGroupName 
      });
      
      console.log("Add response:", res.data);
      
      let newCustomerGroup = {};
      
      if (res.data?.success) {
        const responseData = res.data.created || res.data.data || res.data;
        newCustomerGroup = {
          _id: responseData._id || responseData.id,
          customer_group: responseData.customer_group || customerGroupName,
          status: responseData.status !== false,
        };
      }
      
      console.log("New customer group to add:", newCustomerGroup);
      
      setCustomerGroups(prev => [...prev, newCustomerGroup]);
      
      setTimeout(() => {
        fetchCustomerGroups();
      }, 100);
      
      return newCustomerGroup;
    } catch (err) {
      console.error("Add error:", err);
      setError("Failed to add customer group");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateCustomerGroup = async (id, customerGroupName) => {
    try {
      setLoading(true);
      setError("");
      
      const url = API_ENDPOINTS.updateCustomerGroup(id);
      console.log("Updating customer group at:", url);
      
      const res = await axios.put(url, { 
        customer_group: customerGroupName 
      });
      
      console.log("Update response:", res.data);
      
      let updatedData = {
        _id: id,
        customer_group: customerGroupName,
        status: true,
      };
      
      if (res.data?.success) {
        const responseData = res.data.created || res.data.data || res.data;
        updatedData = {
          _id: responseData._id || responseData.id || id,
          customer_group: responseData.customer_group || customerGroupName,
          status: responseData.status !== false,
        };
      }
      
      console.log("Updated customer group data:", updatedData);
      setCustomerGroups(prev => prev.map(item => (item._id === id ? updatedData : item)));
      
      setTimeout(() => {
        fetchCustomerGroups();
      }, 100);
      
      return updatedData;
    } catch (err) {
      console.error("Update error:", err);
      setError("Failed to update customer group");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteCustomerGroup = async (id) => {
    try {
      setLoading(true);
      setError("");
      
      const url = API_ENDPOINTS.deleteCustomerGroup(id);
      console.log("Deleting customer group at:", url);
      
      const res = await axios.delete(url);
      console.log("Delete response:", res.data);
      
      if (res.data?.success) {
        setCustomerGroups(prev => prev.filter((item) => item._id !== id));
      } else {
        throw new Error(res.data?.message || "Failed to delete customer group");
      }
    } catch (err) {
      console.error("Delete error:", err);
      setError("Failed to delete customer group");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerGroups();
  }, []);

  return {
    customerGroups,
    loading,
    error,
    addCustomerGroup,
    updateCustomerGroup,
    deleteCustomerGroup,
    fetchCustomerGroups,
  };
}