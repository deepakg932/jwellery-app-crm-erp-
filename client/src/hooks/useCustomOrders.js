import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "@/api/api";

export default function useCustomOrders() {
  const [customOrders, setCustomOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [customerGroups, setCustomerGroups] = useState([]);
  const [units, setUnits] = useState([]); // Add units state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch units
  const fetchUnits = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get(API_ENDPOINTS.getUnits());

      let unitsData = [];

      if (
        response.data &&
        response.data.success &&
        Array.isArray(response.data.data)
      ) {
        unitsData = response.data.data;
      } else if (Array.isArray(response.data)) {
        unitsData = response.data;
      } else if (response.data && Array.isArray(response.data.units)) {
        unitsData = response.data.units;
      }

      const mappedUnits = unitsData.map((unit) => ({
        _id: unit._id || unit.id,
        name: unit.name || "",
        code: unit.code || "",
        conversion_factor: unit.conversion_factor || 1,
        is_active: unit.is_active || true,
      }));

      setUnits(mappedUnits);
      return mappedUnits;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch units");
      console.error("Error fetching units:", err);
      setUnits([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCustomerGroups = async () => {
    try {
      const url = API_ENDPOINTS.getCustomerGroups();
      const res = await axios.get(url);

      let groupsData = [];

      // Handle response structure
      if (res.data?.data && Array.isArray(res.data.data)) {
        groupsData = res.data.data;
      } else if (Array.isArray(res.data)) {
        groupsData = res.data;
      }

      const mappedGroups = groupsData.map((group) => ({
        _id: group._id || group.id,
        customer_group: group.customer_group || group.name || "",
        status: group.status || "active",
      }));

      setCustomerGroups(mappedGroups);
      return mappedGroups;
    } catch (err) {
      console.error("Fetch customer groups error:", err);
      return [];
    }
  };

  // Fetch all customers for dropdown
  const fetchCustomers = async () => {
    try {
      setError("");
      const url = API_ENDPOINTS.getCustomers();
      const res = await axios.get(url);

      let customersData = [];

      if (res.data?.success && Array.isArray(res.data.data)) {
        customersData = res.data.data;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        customersData = res.data.data;
      } else if (Array.isArray(res.data)) {
        customersData = res.data;
      }

      const mappedCustomers = customersData.map((customer) => ({
        _id: customer._id || customer.id,
        name: customer.name || customer.customer_name || "",
        mobile: customer.mobile || customer.phone || "",
        email: customer.email || "",
      }));

      setCustomers(mappedCustomers);
      return mappedCustomers;
    } catch (err) {
      console.error("Fetch customers error:", err);
      setError("Failed to load customers");
      return [];
    }
  };

  // Fetch all custom orders
  const fetchCustomOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const url = API_ENDPOINTS.getCustomOrders();
      console.log("Fetching custom orders from:", url);

      const res = await axios.get(url);
      console.log("Custom Orders API Response:", res.data);

      let ordersData = [];

      if (res.data?.success && Array.isArray(res.data.data)) {
        ordersData = res.data.data;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        ordersData = res.data.data;
      } else if (Array.isArray(res.data)) {
        ordersData = res.data;
      }

      const mappedOrders = ordersData.map((order) => ({
        _id: order._id || order.id,
        order_number:
          order.order_number || `ORD-${order._id?.slice(-6) || Date.now()}`,
        customer_id: order.customer_id?._id || order.customer_id || "",
        customer_name: order.customer_id?.name || order.customer_name || "",
        customer_mobile:
          order.customer_id?.mobile || order.customer_mobile || "",
        weight: order.weight || 0,
        unit_id: order.unit_id?._id || order.unit_id || "", // Add unit_id
        unit_name: order.unit_id?.name || order.unit_name || "", // Add unit_name for display
        unit_code: order.unit_id?.code || order.unit_code || "", // Add unit_code for display
        purity: order.purity || "",
        delivery_date: order.delivery_date || "",
        status: order.status || "pending",
        notes: order.notes || "",
        created_at:
          order.createdAt || order.created_at || new Date().toISOString(),
        updated_at:
          order.updatedAt || order.updated_at || new Date().toISOString(),
      }));

      setCustomOrders(mappedOrders);
      return mappedOrders;
    } catch (err) {
      console.error("Fetch custom orders error:", err);
      setError(err.response?.data?.message || "Failed to load custom orders");
      return [];
    } finally {
      setLoading(false);
    }
  };

  // add customer
  const addCustomer = async (customerData) => {
    try {
      setLoading(true);
      setError("");

      const url = API_ENDPOINTS.createCustomer();
      console.log("Adding customer at:", url, "Data:", customerData);

      const apiData = {
        ...customerData,
        status: customerData.status ? "active" : "inactive",
        name: customerData.name || customerData.customer_name || "",
      };

      const res = await axios.post(url, apiData);
      console.log("Add customer response:", res.data);

      if (res.data?.success && res.data.data) {
        const responseData = res.data.data;

        const customerGroup = customerGroups.find(
          (group) => group._id === customerData.customer_group_id
        );

        const newCustomer = {
          _id: responseData._id,
          name: responseData.name || customerData.name || "",
          customer_group_id:
            responseData.customer_group_id || customerData.customer_group_id,
          customer_group_id_obj: responseData.customer_group_id || {
            _id: customerData.customer_group_id,
          },
          customer_group: customerGroup?.customer_group || "",
          mobile: responseData.mobile || customerData.mobile || "",
          whatsapp_number:
            responseData.whatsapp_number || customerData.whatsapp_number || "",
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

        setCustomers((prev) => [...prev, newCustomer]);

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

  // Add a new custom order
  // Update the addCustomOrder function in useCustomOrders hook:
  const addCustomOrder = async (orderData) => {
    try {
      setLoading(true);
      setError("");

      const url = API_ENDPOINTS.createCustomOrder();
      console.log("Adding custom order at:", url, "Data:", orderData);

      // Check if we have FormData (with images)
      let formDataToSend;
      let config = {};

      if (orderData.images instanceof FormData) {
        // We have FormData with files
        formDataToSend = orderData.images;

        // Set proper headers for FormData
        config = {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        };
      } else {
        // Regular JSON data (no images or images are URLs)
        formDataToSend = {
          order_number:
            orderData.order_number ||
            `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          customer_id: orderData.customer_id || "",
          weight: parseFloat(orderData.weight) || 0,
          unit_id: orderData.unit_id || "",
          purity: orderData.purity || "",
          delivery_date: orderData.delivery_date || "",
          status: orderData.status || "pending",
          notes: orderData.notes || "",
          images: orderData.existingImages || [], // Include existing image URLs if any
        };
      }

      console.log("Sending to API:", formDataToSend);

      let res;
      if (formDataToSend instanceof FormData) {
        // Append other fields if they're not already in FormData
        if (!formDataToSend.has("customer_id")) {
          formDataToSend.append("customer_id", orderData.customer_id || "");
          formDataToSend.append("weight", parseFloat(orderData.weight) || 0);
          formDataToSend.append("unit_id", orderData.unit_id || "");
          formDataToSend.append("purity", orderData.purity || "");
          formDataToSend.append("delivery_date", orderData.delivery_date || "");
          formDataToSend.append("status", orderData.status || "pending");
          formDataToSend.append("notes", orderData.notes || "");
        }

        res = await axios.post(url, formDataToSend, config);
      } else {
        res = await axios.post(url, formDataToSend);
      }

      console.log("Add custom order response:", res.data);

      if (res.data?.success && res.data.data) {
        const responseData = res.data.data;

        // Find customer for display
        const customer = customers.find((c) => c._id === orderData.customer_id);
        // Find unit for display
        const unit = units.find((u) => u._id === orderData.unit_id);

        const newOrder = {
          _id: responseData._id || responseData.id,
          order_number: responseData.order_number || orderData.order_number,
          customer_id: responseData.customer_id || orderData.customer_id || "",
          customer_name: customer?.name || responseData.customer_name || "",
          customer_mobile:
            customer?.mobile || responseData.customer_mobile || "",
          weight: responseData.weight || orderData.weight || 0,
          unit_id: responseData.unit_id || orderData.unit_id || "",
          unit_name: unit?.name || responseData.unit_name || "",
          unit_code: unit?.code || responseData.unit_code || "",
          purity: responseData.purity || orderData.purity || "",
          delivery_date:
            responseData.delivery_date || orderData.delivery_date || "",
          status: responseData.status || "pending",
          notes: responseData.notes || orderData.notes || "",
          images: responseData.images || orderData.existingImages || [],
          created_at: responseData.createdAt || new Date().toISOString(),
          updated_at: responseData.updatedAt || new Date().toISOString(),
        };

        console.log("New order created:", newOrder);

        // Update state
        setCustomOrders((prev) => [...prev, newOrder]);

        // Refresh the orders list
        setTimeout(() => {
          fetchCustomOrders();
        }, 300);

        return newOrder;
      } else if (res.data?.message) {
        throw new Error(res.data.message);
      } else {
        throw new Error("Failed to add custom order");
      }
    } catch (err) {
      console.error("Add custom order error:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Failed to add custom order";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Similarly update the updateCustomOrder function:
  const updateCustomOrder = async (id, orderData) => {
    try {
      setLoading(true);
      setError("");

      const url = API_ENDPOINTS.updateCustomOrder(id);
      console.log("Updating custom order at:", url, "Data:", orderData);

      // Check if we have FormData (with images)
      let formDataToSend;
      let config = {};

      if (orderData.images instanceof FormData) {
        // We have FormData with files
        formDataToSend = orderData.images;

        // Append ID and existing images
        formDataToSend.append("id", id);
        if (orderData.existingImages && orderData.existingImages.length > 0) {
          formDataToSend.append(
            "existingImages",
            JSON.stringify(orderData.existingImages)
          );
        }

        // Set proper headers for FormData
        config = {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        };
      } else {
        // Regular JSON data
        formDataToSend = {
          customer_id: orderData.customer_id || "",
          weight: parseFloat(orderData.weight) || 0,
          unit_id: orderData.unit_id || "",
          purity: orderData.purity || "",
          delivery_date: orderData.delivery_date || "",
          status: orderData.status || "pending",
          notes: orderData.notes || "",
          existingImages: orderData.existingImages || [], // Include existing images
        };
      }

      console.log("Updating with data:", formDataToSend);

      let res;
      if (formDataToSend instanceof FormData) {
        res = await axios.put(url, formDataToSend, config);
      } else {
        res = await axios.put(url, formDataToSend);
      }

      console.log("Update custom order response:", res.data);

      if (res.data?.success && res.data.data) {
        const responseData = res.data.data;

        // Find customer for display
        const customer = customers.find((c) => c._id === orderData.customer_id);
        // Find unit for display
        const unit = units.find((u) => u._id === orderData.unit_id);

        const updatedData = {
          _id: responseData._id || id,
          order_number: responseData.order_number || orderData.order_number,
          customer_id: responseData.customer_id || orderData.customer_id,
          customer_name: customer?.name || responseData.customer_name || "",
          customer_mobile:
            customer?.mobile || responseData.customer_mobile || "",
          weight: responseData.weight || orderData.weight || 0,
          unit_id: responseData.unit_id || orderData.unit_id || "",
          unit_name: unit?.name || responseData.unit_name || "",
          unit_code: unit?.code || responseData.unit_code || "",
          purity: responseData.purity || orderData.purity || "",
          delivery_date:
            responseData.delivery_date || orderData.delivery_date || "",
          status: responseData.status || orderData.status || "pending",
          notes: responseData.notes || orderData.notes || "",
          images: responseData.images || [
            ...(orderData.existingImages || []),
            ...(orderData.images || []),
          ],
          updated_at: responseData.updatedAt || new Date().toISOString(),
        };

        setCustomOrders((prev) =>
          prev.map((item) =>
            item._id === id ? { ...item, ...updatedData } : item
          )
        );

        setTimeout(() => {
          fetchCustomOrders();
        }, 300);

        return updatedData;
      } else if (res.data?.message) {
        throw new Error(res.data.message);
      } else {
        throw new Error("Failed to update custom order");
      }
    } catch (err) {
      console.error("Update custom order error:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Failed to update custom order";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Delete a custom order
  const deleteCustomOrder = async (id) => {
    try {
      setLoading(true);
      setError("");

      const url = API_ENDPOINTS.deleteCustomOrder(id);
      console.log("Deleting custom order at:", url);

      const res = await axios.delete(url);
      console.log("Delete response:", res.data);

      if (res.data?.success || res.data?.status === true) {
        setCustomOrders((prev) => prev.filter((item) => item._id !== id));
        return true;
      } else {
        throw new Error(res.data?.message || "Failed to delete custom order");
      }
    } catch (err) {
      console.error("Delete custom order error:", err);
      setError(err.response?.data?.message || "Failed to delete custom order");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch all data
    const fetchData = async () => {
      await fetchUnits(); // Fetch units first
      await fetchCustomerGroups();
      await fetchCustomers();
      await fetchCustomOrders();
    };

    fetchData();
  }, []);

  return {
    customOrders,
    customers,
    customerGroups,
    units, // Export units
    loading,
    error,
    addCustomer,
    addCustomOrder,
    updateCustomOrder,
    deleteCustomOrder,
    fetchCustomOrders,
    fetchCustomers,
    fetchCustomerGroups,
    fetchUnits, // Export fetchUnits
  };
}
