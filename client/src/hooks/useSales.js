import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "@/api/api";

export default function useSales() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [customers, setCustomers] = useState([]);
  const [items, setItems] = useState([]);
  const [units, setUnits] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [loadingBranches, setLoadingBranches] = useState(false);

  // Fetch customers (for dropdown)
  const fetchCustomers = async () => {
    try {
      setLoadingCustomers(true);
      const res = await axios.get(API_ENDPOINTS.getCustomers());
      let customersData = [];

      console.log("Customers API Response:", res.data);

      // Handle customer response structure
      if (res.data?.success && Array.isArray(res.data.data)) {
        customersData = res.data.data;
      } else if (res.data?.fetched && Array.isArray(res.data.fetched)) {
        customersData = res.data.fetched;
      } else if (Array.isArray(res.data)) {
        customersData = res.data;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        customersData = res.data.data;
      }

      console.log("Processed customers:", customersData);
      setCustomers(customersData);
      return customersData;
    } catch (err) {
      console.error("Error fetching customers:", err);
      setError("Failed to load customers");
      return [];
    } finally {
      setLoadingCustomers(false);
    }
  };

  // Fetch items (products) for dropdown - using getAllItems
  const fetchItems = useCallback(async (page = 1, limit = 100) => {
    try {
      setLoadingItems(true);
      const response = await axios.get(
        `${API_ENDPOINTS.getAllItems()}?page=${page}&limit=${limit}`
      );

      console.log("Fetch items response:", response.data);

      let itemsData = [];

      if (response.data && response.data.success) {
        // Extract items from response
        if (response.data.products && Array.isArray(response.data.products)) {
          itemsData = response.data.products;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          itemsData = response.data.data;
        }
      }

      console.log("Processed items:", itemsData);
      setItems(itemsData);
      return itemsData;
    } catch (err) {
      console.error("Error fetching items:", err);
      setError("Failed to load items");
      return [];
    } finally {
      setLoadingItems(false);
    }
  }, []);

  // Fetch units (for dropdown)
  const fetchUnits = async () => {
    try {
      setLoadingUnits(true);
      const res = await axios.get(API_ENDPOINTS.getUnits());

      console.log("Units API Response:", res.data);

      let unitsData = [];

      if (res.data?.success && Array.isArray(res.data.data)) {
        unitsData = res.data.data;
      } else if (res.data?.fetched && Array.isArray(res.data.fetched)) {
        unitsData = res.data.fetched;
      } else if (Array.isArray(res.data)) {
        unitsData = res.data;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        unitsData = res.data.data;
      }

      console.log("Processed units:", unitsData);
      setUnits(unitsData);
      return unitsData;
    } catch (err) {
      console.error("Error fetching units:", err);
      setError("Failed to load units");
      return [];
    } finally {
      setLoadingUnits(false);
    }
  };

  // Fetch branches
  const fetchBranches = async () => {
    try {
      setLoadingBranches(true);
      const res = await axios.get(API_ENDPOINTS.getBranches());
      let branchesData = [];

      console.log("Branches API Response:", res.data);

      if (res.data?.success && Array.isArray(res.data.data)) {
        branchesData = res.data.data;
      } else if (res.data?.fetched && Array.isArray(res.data.fetched)) {
        branchesData = res.data.fetched;
      } else if (Array.isArray(res.data)) {
        branchesData = res.data;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        branchesData = res.data.data;
      }

      console.log("Processed branches:", branchesData);
      setBranches(branchesData);
      return branchesData;
    } catch (err) {
      console.error("Error fetching branches:", err);
      setError("Failed to load branches");
      return [];
    } finally {
      setLoadingBranches(false);
    }
  };

  // Fetch all sales
  const fetchSales = async () => {
    try {
      setLoading(true);
      setError("");

      const url = API_ENDPOINTS.getSales();
      console.log("Fetching sales from:", url);

      const res = await axios.get(url);
      console.log("Sales API Response:", res.data);

      let salesData = [];

      // Handle your specific response structure
      if (res.data?.success && Array.isArray(res.data.data)) {
        salesData = res.data.data;
      } else if (res.data?.fetched && Array.isArray(res.data.fetched)) {
        salesData = res.data.fetched;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        salesData = res.data.data;
      } else if (Array.isArray(res.data)) {
        salesData = res.data;
      }

      const mappedSales = salesData.map((item) => ({
        _id: item._id || item.id,
        sale_number: item.sale_number || `SALE-${Date.now()}`,
        customer_id: item.customer_id || item.customer || {},
        sale_date: item.sale_date || new Date().toISOString().split("T")[0],
        reference_no: item.reference_no || "",
        items: item.items || [],
        status: item.status || "draft",
        sale_note: item.sale_note || "",
        shipping_cost: item.shipping_cost || 0,
        discount: item.discount || 0,
        vat: item.vat || 0,
        subtotal: item.subtotal || 0,
        total_amount: item.total_amount || 0,
        grand_total: item.grand_total || 0,
        branch_id: item.branch_id || item.branch || {},
        payment_status: item.payment_status || "pending",
      }));

      console.log("Fetched sales:", mappedSales);
      setSales(mappedSales);
    } catch (err) {
      console.error("Fetch sales error:", err);
      setError("Failed to load sales");
    } finally {
      setLoading(false);
    }
  };

  // Add a new sale
  const addSale = async (saleData) => {
    try {
      setLoading(true);
      setError("");

      const url = API_ENDPOINTS.createSale();
      console.log("Adding sale at:", url, "Data:", saleData);

      const res = await axios.post(url, saleData);
      console.log("Add sale response:", res.data);

      let newSale = {
        _id: `temp-${Date.now()}`,
        ...saleData,
        status: saleData.status || "draft",
      };

      if (res.data?.success) {
        const responseData = res.data.data || res.data;
        newSale = {
          _id: responseData._id || responseData.id,
          sale_number: responseData.sale_number || `SALE-${Date.now()}`,
          customer_id: responseData.customer_id || saleData.customer_id,
          sale_date: responseData.sale_date || saleData.sale_date,
          reference_no: responseData.reference_no || saleData.reference_no,
          items: responseData.items || saleData.items,
          status: responseData.status || saleData.status || "draft",
          sale_note: responseData.sale_note || saleData.sale_note,
          shipping_cost: responseData.shipping_cost || saleData.shipping_cost,
          discount: responseData.discount || saleData.discount,
          vat: responseData.vat || saleData.vat,
          subtotal: responseData.subtotal || saleData.subtotal,
          total_amount: responseData.total_amount || saleData.total_amount,
          grand_total: responseData.grand_total || saleData.grand_total,
          branch_id: responseData.branch_id || saleData.branch_id,
          payment_status: responseData.payment_status || saleData.payment_status,
        };
      }

      console.log("New sale to add:", newSale);
      setSales((prev) => [...prev, newSale]);

      // Refetch to ensure consistency
      setTimeout(() => {
        fetchSales();
      }, 500);

      return newSale;
    } catch (err) {
      console.error("Add sale error:", err);
      setError("Failed to add sale");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update a sale
  const updateSale = async (id, saleData) => {
    try {
      setLoading(true);
      setError("");

      const url = API_ENDPOINTS.updateSale(id);
      console.log("Updating sale at:", url, "Data:", saleData);

      const res = await axios.put(url, saleData);
      console.log("Update sale response:", res.data);

      if (res.data?.success) {
        const responseData = res.data.data || res.data;
        const updatedData = {
          _id: responseData._id || responseData.id || id,
          sale_number: responseData.sale_number,
          customer_id: responseData.customer_id || saleData.customer_id,
          sale_date: responseData.sale_date || saleData.sale_date,
          reference_no: responseData.reference_no || saleData.reference_no,
          items: responseData.items || saleData.items,
          status: responseData.status || saleData.status || "draft",
          sale_note: responseData.sale_note || saleData.sale_note,
          shipping_cost: responseData.shipping_cost || saleData.shipping_cost,
          discount: responseData.discount || saleData.discount,
          vat: responseData.vat || saleData.vat,
          subtotal: responseData.subtotal || saleData.subtotal,
          total_amount: responseData.total_amount || saleData.total_amount,
          grand_total: responseData.grand_total || saleData.grand_total,
          branch_id: responseData.branch_id || saleData.branch_id,
          payment_status: responseData.payment_status || saleData.payment_status,
        };

        console.log("Updated sale data:", updatedData);
        setSales((prev) =>
          prev.map((item) => (item._id === id ? updatedData : item))
        );

        // Refetch to ensure consistency
        setTimeout(() => {
          fetchSales();
        }, 500);

        return updatedData;
      } else {
        throw new Error(res.data?.message || "Failed to update sale");
      }
    } catch (err) {
      console.error("Update sale error:", err);
      setError("Failed to update sale");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete a sale
  const deleteSale = async (id) => {
    try {
      setLoading(true);
      setError("");

      const url = API_ENDPOINTS.deleteSale(id);
      console.log("Deleting sale at:", url);

      const res = await axios.delete(url);
      console.log("Delete response:", res.data);

      if (res.data?.success) {
        // Remove the item from state immediately
        setSales((prev) => prev.filter((item) => item._id !== id));
      } else {
        throw new Error(res.data?.message || "Failed to delete sale");
      }
      
      return res.data;
    } catch (err) {
      console.error("Delete sale error:", err);
      setError("Failed to delete sale");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Initialize data on mount
  useEffect(() => {
    const initializeData = async () => {
      await Promise.all([
        fetchCustomers(),
        fetchItems(),
        fetchUnits(),
        fetchBranches(),
      ]);
    };

    initializeData();
  }, []);

  // Fetch sales on mount
  useEffect(() => {
    fetchSales();
  }, []);

  return {
    // Data
    sales,
    customers,
    items,
    units,
    branches,

    // Loading states
    loading,
    loadingCustomers,
    loadingItems,
    loadingUnits,
    loadingBranches,

    // Error
    error,

    // Functions
    fetchSales,
    fetchCustomers,
    fetchItems,
    fetchUnits,
    fetchBranches,
    addSale,
    updateSale,
    deleteSale,
  };
}