import { useState, useEffect } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "@/api/api";

export default function usePurchaseOrders() {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [suppliers, setSuppliers] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [units, setUnits] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);
  const [loadingInventoryItems, setLoadingInventoryItems] = useState(false);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [loadingBranches, setLoadingBranches] = useState(false);

  // Add fetchBranches function
  const fetchBranches = async () => {
    try {
      setLoadingBranches(true);
      const res = await axios.get(API_ENDPOINTS.getBranches());
      let branchesData = [];

      console.log("Branches API Response:", res.data);

      // Handle branch response structure
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

  // Fetch suppliers (for dropdown)
  const fetchSuppliers = async () => {
    try {
      setLoadingSuppliers(true);
      const res = await axios.get(API_ENDPOINTS.getSuppliers());
      let suppliersData = [];

      console.log("Suppliers API Response:", res.data);

      // Handle supplier response structure
      if (res.data?.success && Array.isArray(res.data.data)) {
        suppliersData = res.data.data;
      } else if (res.data?.fetched && Array.isArray(res.data.fetched)) {
        suppliersData = res.data.fetched;
      } else if (Array.isArray(res.data)) {
        suppliersData = res.data;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        suppliersData = res.data.data;
      }

      console.log("Processed suppliers:", suppliersData);
      setSuppliers(suppliersData);
      return suppliersData;
    } catch (err) {
      console.error("Error fetching suppliers:", err);
      setError("Failed to load suppliers");
      return [];
    } finally {
      setLoadingSuppliers(false);
    }
  };

  // Fetch inventory items (for dropdown)
  // Fetch inventory items (for dropdown)
  const fetchInventoryItems = async () => {
    try {
      setLoadingInventoryItems(true);
      const res = await axios.get(API_ENDPOINTS.getInventoryItems());

      console.log("Inventory Items API Response:", res.data);

      let itemsData = [];

      // Handle the nested structure: res.data.data.data
      if (
        res.data?.success &&
        res.data.data &&
        res.data.data.data &&
        Array.isArray(res.data.data.data)
      ) {
        itemsData = res.data.data.data;
        console.log("Found items in res.data.data.data:", itemsData);
      }
      // Also check for other possible structures
      else if (res.data?.success && Array.isArray(res.data.data)) {
        itemsData = res.data.data;
        console.log("Found items in res.data.data:", itemsData);
      } else if (res.data?.fetched && Array.isArray(res.data.fetched)) {
        itemsData = res.data.fetched;
        console.log("Found items in res.data.fetched:", itemsData);
      } else if (Array.isArray(res.data)) {
        itemsData = res.data;
        console.log("Found items in res.data:", itemsData);
      }

      console.log("Processed inventory items:", itemsData);
      setInventoryItems(itemsData);
      return itemsData;
    } catch (err) {
      console.error("Error fetching inventory items:", err);
      setError("Failed to load inventory items");
      return [];
    } finally {
      setLoadingInventoryItems(false);
    }
  };

  // Fetch units (for dropdown)
  const fetchUnits = async () => {
    try {
      setLoadingUnits(true);
      const res = await axios.get(API_ENDPOINTS.getUnits());

      console.log("Units API Response:", res.data);

      let unitsData = [];

      // Handle units response structure based on your example
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

  // Fetch all purchase orders
  const fetchPurchaseOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const url = API_ENDPOINTS.getPurchaseOrders();
      console.log("Fetching purchase orders from:", url);

      const res = await axios.get(url);
      console.log("Purchase Orders API Response:", res.data);

      let purchaseOrdersData = [];

      // Handle your specific response structure
      if (res.data?.success && Array.isArray(res.data.data)) {
        purchaseOrdersData = res.data.data;
      } else if (res.data?.fetched && Array.isArray(res.data.fetched)) {
        purchaseOrdersData = res.data.fetched;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        purchaseOrdersData = res.data.data;
      } else if (Array.isArray(res.data)) {
        purchaseOrdersData = res.data;
      }

      const mappedPurchaseOrders = purchaseOrdersData.map((item) => ({
        _id: item._id || item.id,
        order_number: item.po_number || item.order_number || `PO-${Date.now()}`,
        supplier: item.supplier_id || item.supplier || {},
        order_date: item.order_date || new Date().toISOString().split("T")[0],
        items: item.items || [],
        status: item.status || "draft",
        total_amount: item.total_amount || 0,
        notes: item.notes || "",
      }));

      console.log("Fetched purchase orders:", mappedPurchaseOrders);
      setPurchaseOrders(mappedPurchaseOrders);
    } catch (err) {
      console.error("Fetch purchase orders error:", err);
      setError("Failed to load purchase orders");
    } finally {
      setLoading(false);
    }
  };

  // Add a new purchase order
  const addPurchaseOrder = async (purchaseOrderData) => {
    try {
      setLoading(true);
      setError("");

      const url = API_ENDPOINTS.createPurchaseOrder();
      console.log("Adding purchase order at:", url, "Data:", purchaseOrderData);

      const res = await axios.post(url, purchaseOrderData);
      console.log("Add purchase order response:", res.data);

      let newPurchaseOrder = {
        _id: `temp-${Date.now()}`,
        ...purchaseOrderData,
        status: purchaseOrderData.status || "draft",
      };

      if (res.data?.success) {
        const responseData = res.data.data || res.data;
        newPurchaseOrder = {
          _id: responseData._id || responseData.id,
          order_number: responseData.po_number || `PO-${Date.now()}`,
          supplier:
            responseData.supplier_id ||
            responseData.supplier ||
            purchaseOrderData.supplier,
          order_date: responseData.order_date || purchaseOrderData.order_date,
          items: responseData.items || purchaseOrderData.items,
          status: responseData.status || purchaseOrderData.status || "draft",
          total_amount:
            responseData.total_amount || purchaseOrderData.total_amount,
          notes: responseData.notes || purchaseOrderData.notes,
        };
      }

      console.log("New purchase order to add:", newPurchaseOrder);
      setPurchaseOrders((prev) => [...prev, newPurchaseOrder]);

      // Refetch to ensure consistency
      setTimeout(() => {
        fetchPurchaseOrders();
      }, 500);

      return newPurchaseOrder;
    } catch (err) {
      console.error("Add purchase order error:", err);
      setError("Failed to add purchase order");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update a purchase order
  const updatePurchaseOrder = async (id, purchaseOrderData) => {
    try {
      setLoading(true);
      setError("");

      const url = API_ENDPOINTS.updatePurchaseOrder(id);
      console.log(
        "Updating purchase order at:",
        url,
        "Data:",
        purchaseOrderData
      );

      const res = await axios.put(url, purchaseOrderData);
      console.log("Update purchase order response:", res.data);

      if (res.data?.success) {
        const responseData = res.data.data || res.data;
        const updatedData = {
          _id: responseData._id || responseData.id || id,
          order_number: responseData.po_number || responseData.order_number,
          supplier:
            responseData.supplier_id ||
            responseData.supplier ||
            purchaseOrderData.supplier,
          order_date: responseData.order_date || purchaseOrderData.order_date,
          items: responseData.items || purchaseOrderData.items,
          status: responseData.status || purchaseOrderData.status || "draft",
          total_amount:
            responseData.total_amount || purchaseOrderData.total_amount,
          notes: responseData.notes || purchaseOrderData.notes,
        };

        console.log("Updated purchase order data:", updatedData);
        setPurchaseOrders((prev) =>
          prev.map((item) => (item._id === id ? updatedData : item))
        );

        // Refetch to ensure consistency
        setTimeout(() => {
          fetchPurchaseOrders();
        }, 500);

        return updatedData;
      } else {
        throw new Error(res.data?.message || "Failed to update purchase order");
      }
    } catch (err) {
      console.error("Update purchase order error:", err);
      setError("Failed to update purchase order");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // In usePurchaseOrders hook - update deletePurchaseOrder function:
  const deletePurchaseOrder = async (id) => {
    try {
      setLoading(true);
      setError("");

      const url = API_ENDPOINTS.deletePurchaseOrder(id);
      console.log("Deleting purchase order at:", url);

      const res = await axios.delete(url);
      console.log("Delete response:", res.data);

      if (res.data?.success || res.data?.status === true) {
        // Remove the item from state immediately
        setPurchaseOrders((prev) => prev.filter((item) => item._id !== id));
        return res.data;
      } else {
        throw new Error(res.data?.message || "Failed to delete purchase order");
      }
    } catch (err) {
      console.error("Delete purchase order error:", err);
      setError(
        "Failed to delete purchase order: " +
          (err.response?.data?.message || err.message)
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Initialize data on mount
  useEffect(() => {
    const initializeData = async () => {
      await Promise.all([
        fetchSuppliers(),
        fetchInventoryItems(),
        fetchUnits(),
        fetchBranches(), // Add branches fetch
      ]);
    };

    initializeData();
  }, []);

  // Fetch purchase orders on mount
  useEffect(() => {
    fetchPurchaseOrders();
  }, []);

  return {
    // Data
    purchaseOrders,
    suppliers,
    inventoryItems,
    units,
    branches,

    // Loading states
    loading,
    loadingSuppliers,
    loadingInventoryItems,
    loadingUnits,
    loadingBranches,

    // Error
    error,

    // Functions
    fetchPurchaseOrders,
    fetchSuppliers,
    fetchInventoryItems,
    fetchUnits,
    fetchBranches,
    addPurchaseOrder,
    updatePurchaseOrder,
    deletePurchaseOrder,
  };
}
