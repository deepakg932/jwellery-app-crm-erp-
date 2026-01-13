import { useState, useEffect } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "@/api/api";

export default function useCustomers() {
  const [customers, setCustomers] = useState([]);
  const [customerGroups, setCustomerGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch all customer groups
  const fetchCustomerGroups = async () => {
    try {
      setError("");

      const url = API_ENDPOINTS.getCustomerGroups();
      console.log("Fetching customer groups from:", url);

      const res = await axios.get(url);
      console.log("Customer Groups API Response:", res.data);

      let groupsData = [];

      // Handle your specific response structure
      if (res.data?.data && Array.isArray(res.data.data)) {
        groupsData = res.data.data;
      } else if (res.data?.fetched && Array.isArray(res.data.fetched)) {
        groupsData = res.data.fetched;
      } else if (Array.isArray(res.data)) {
        groupsData = res.data;
      }

      const mappedGroups = groupsData.map((group) => ({
        _id: group._id || group.id,
        customer_group: group.customer_group || group.name || "",
        status: group.status || "active",
      }));

      console.log("Fetched customer groups:", mappedGroups);
      setCustomerGroups(mappedGroups);
      return mappedGroups;
    } catch (err) {
      console.error("Fetch customer groups error:", err);
      setError(err.response?.data?.message || "Failed to load customer groups");
      return [];
    }
  };

  // Fetch all customers
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError("");

      const url = API_ENDPOINTS.getCustomers();
      console.log("Fetching customers from:", url);

      const res = await axios.get(url);
      console.log("Customers API Response:", res.data);

      let customersData = [];

      // Handle your specific response structure - updated based on your response
      if (res.data?.success && Array.isArray(res.data.data)) {
        customersData = res.data.data;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        customersData = res.data.data;
      } else if (res.data?.fetched && Array.isArray(res.data.fetched)) {
        customersData = res.data.fetched;
      } else if (Array.isArray(res.data)) {
        customersData = res.data;
      }

      const mappedCustomers = customersData.map((item) => ({
        _id: item._id || item.id,
        // Use the exact field names from your API response
        name: item.name || "",  // This is what your API returns
        // Get the ID from the nested customer_group_id object
        customer_group_id: item.customer_group_id?._id || item.customer_group_id || "",
        // Store the full object for reference
        customer_group_id_obj: item.customer_group_id || null,
        // Get the customer group name from the nested object
        customer_group: item.customer_group_id?.customer_group || item.customer_group || "",
        // Use the exact field name from your API
        mobile: item.mobile || "",
        whatsapp_number: item.whatsapp_number || "",
        email: item.email || "",
        tax_number: item.tax_number || "",
        address: item.address || "",
        city: item.city || "",
        state: item.state || "",
        country: item.country || "",
        pincode: item.pincode || "",
        status: item.status === "active", // Convert to boolean
        createdAt: item.createdAt || "",
        // Include other fields from your API if needed
        created_by: item.created_by || null,
        updatedAt: item.updatedAt || "",
      }));

      console.log("Fetched customers:", mappedCustomers);
      setCustomers(mappedCustomers);
      return mappedCustomers;
    } catch (err) {
      console.error("Fetch customers error:", err);
      setError(err.response?.data?.message || "Failed to load customers");
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Add a new customer
  const addCustomer = async (customerData) => {
    try {
      setLoading(true);
      setError("");

      const url = API_ENDPOINTS.createCustomer();
      console.log("Adding customer at:", url, "Data:", customerData);

      // Ensure we send data in the format your API expects
      const apiData = {
        ...customerData,
        // Convert status to string format if needed
        status: customerData.status ? "active" : "inactive",
        // If your form uses 'name', keep it as is
        name: customerData.name || customerData.customer_name || "",
      };

      const res = await axios.post(url, apiData);
      console.log("Add customer response:", res.data);

      if (res.data?.success && res.data.data) {
        const responseData = res.data.data;
        
        // Find the customer group for display purposes
        const customerGroup = customerGroups.find(group => group._id === customerData.customer_group_id);
        
        const newCustomer = {
          _id: responseData._id,
          name: responseData.name || customerData.name || "",
          customer_group_id: responseData.customer_group_id || customerData.customer_group_id,
          customer_group_id_obj: responseData.customer_group_id || { _id: customerData.customer_group_id },
          customer_group: customerGroup?.customer_group || "",
          mobile: responseData.mobile || customerData.mobile || "",
          whatsapp_number: responseData.whatsapp_number || customerData.whatsapp_number || "",
          email: responseData.email || customerData.email || "",
          tax_number: responseData.tax_number || customerData.tax_number || "",
          address: responseData.address || customerData.address || "",
          city: responseData.city || customerData.city || "",
          state: responseData.state || customerData.state || "",
          country: responseData.country || customerData.country || "",
          pincode: responseData.pincode || customerData.pincode || "",
          status: responseData.status === "active",
          createdAt: responseData.createdAt || new Date().toISOString(),
          updatedAt: responseData.updatedAt || new Date().toISOString(),
        };

        console.log("New customer to add:", newCustomer);
        
        // Update local state
        setCustomers(prev => [...prev, newCustomer]);
        
        // Refetch to ensure we have the complete data
        setTimeout(() => {
          fetchCustomers();
        }, 500);
        
        return newCustomer;
      } else {
        throw new Error(res.data?.message || "Failed to add customer");
      }
    } catch (err) {
      console.error("Add customer error:", err);
      setError(err.response?.data?.message || "Failed to add customer");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update a customer
  const updateCustomer = async (id, customerData) => {
    try {
      setLoading(true);
      setError("");

      const url = API_ENDPOINTS.updateCustomer(id);
      
      // Prepare data for API - match your API's expected format
      const apiData = {
        ...customerData,
        status: customerData.status ? "active" : "inactive",
        name: customerData.name || "",
      };
      
      console.log("Updating customer at:", url, "Data:", apiData);

      const res = await axios.put(url, apiData);
      console.log("Update customer response:", res.data);

      if (res.data?.success && res.data.data) {
        const responseData = res.data.data;
        
        // Find the customer group for display
        const customerGroup = customerGroups.find(group => group._id === customerData.customer_group_id);
        
        const updatedData = {
          _id: responseData._id || id,
          name: responseData.name || customerData.name || "",
          customer_group_id: responseData.customer_group_id || customerData.customer_group_id,
          customer_group_id_obj: responseData.customer_group_id || { _id: customerData.customer_group_id },
          customer_group: customerGroup?.customer_group || "",
          mobile: responseData.mobile || customerData.mobile || "",
          whatsapp_number: responseData.whatsapp_number || customerData.whatsapp_number || "",
          email: responseData.email || customerData.email || "",
          tax_number: responseData.tax_number || customerData.tax_number || "",
          address: responseData.address || customerData.address || "",
          city: responseData.city || customerData.city || "",
          state: responseData.state || customerData.state || "",
          country: responseData.country || customerData.country || "",
          pincode: responseData.pincode || customerData.pincode || "",
          status: responseData.status === "active",
          updatedAt: responseData.updatedAt || new Date().toISOString(),
        };

        console.log("Updated customer data:", updatedData);
        
        // Update local state
        setCustomers(prev => prev.map(item => 
          item._id === id ? { ...item, ...updatedData } : item
        ));
        
        // Refetch to ensure consistency
        setTimeout(() => {
          fetchCustomers();
        }, 500);
        
        return updatedData;
      } else {
        throw new Error(res.data?.message || "Failed to update customer");
      }
    } catch (err) {
      console.error("Update customer error:", err);
      setError(err.response?.data?.message || "Failed to update customer");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete a customer
  const deleteCustomer = async (id) => {
    try {
      setLoading(true);
      setError("");

      const url = API_ENDPOINTS.deleteCustomer(id);
      console.log("Deleting customer at:", url);

      const res = await axios.delete(url);
      console.log("Delete response:", res.data);

      if (res.data?.success || res.data?.status === true) {
        // Remove from local state
        setCustomers(prev => prev.filter((item) => item._id !== id));
        return true;
      } else {
        throw new Error(res.data?.message || "Failed to delete customer");
      }
    } catch (err) {
      console.error("Delete customer error:", err);
      setError(err.response?.data?.message || "Failed to delete customer");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch customer groups first, then customers
    const fetchData = async () => {
      await fetchCustomerGroups();
      await fetchCustomers();
    };
    
    fetchData();
  }, []);

  return {
    customers,
    customerGroups,
    loading,
    error,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    fetchCustomers,
    fetchCustomerGroups,
  };
}