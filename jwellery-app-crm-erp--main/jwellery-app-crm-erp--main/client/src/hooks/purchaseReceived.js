// hooks/useStockIn.js
import { useState, useEffect } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "@/api/api";

export default function purchaseReceived() {
  const [stockIns, setStockIns] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loadingPurchaseOrders, setLoadingPurchaseOrders] = useState(false);

  // Fetch purchase orders for dropdown
  const fetchPurchaseOrders = async () => {
    try {
      setLoadingPurchaseOrders(true);
      const url = API_ENDPOINTS.getPurchaseOrders();
      console.log("Fetching purchase orders from:", url);

      const res = await axios.get(url);
      console.log("Purchase Orders API Response:", res.data);

      let purchaseOrdersData = [];

      // Handle different response structures
      if (res.data?.success && res.data?.data) {
        if (Array.isArray(res.data.data)) {
          purchaseOrdersData = res.data.data;
        } else if (Array.isArray(res.data.data.data)) {
          purchaseOrdersData = res.data.data.data;
        }
      } else if (Array.isArray(res.data)) {
        purchaseOrdersData = res.data;
      }

      console.log("Fetched purchase orders:", purchaseOrdersData);
      setPurchaseOrders(purchaseOrdersData);
      return purchaseOrdersData;
    } catch (err) {
      console.error("Fetch purchase orders error:", err);
      setError("Failed to load purchase orders");
      return [];
    } finally {
      setLoadingPurchaseOrders(false);
    }
  };

  // Fetch stock ins (GRNs)
  const fetchPurchaseReceived = async () => {
    try {
      setLoading(true);
      setError("");
      const url = API_ENDPOINTS.getStockMovements();
      console.log("Fetching stock ins from:", url);

      const res = await axios.get(url);
      console.log("Stock Ins API Response:", res.data);

      let stockInsData = [];

      if (res.data?.success && res.data?.data) {
        if (Array.isArray(res.data.data)) {
          stockInsData = res.data.data;
        } else if (Array.isArray(res.data.data.data)) {
          stockInsData = res.data.data.data;
        }
      } else if (Array.isArray(res.data)) {
        stockInsData = res.data;
      }

      // Map data to match your form structure - handle nested objects
      const mappedStockIns = stockInsData.map((stockIn) => {
        // Handle nested supplier object
        const supplier = stockIn.supplier_id || {};
        const supplierName = supplier.supplier_name || supplier.name || "";
        
        // Handle nested PO object
        const po = stockIn.po_id || {};
        const poId = po._id || "";
        const poNumber = po.po_number || "";
        
        // Handle nested branch object
        const branch = stockIn.branch_id || {};

        return {
          _id: stockIn._id,
          po_id: po, // Keep the full object for display
          po_number: poNumber,
          supplier_id: supplier, // Keep the full object for display
          supplier_name: supplierName,
          branch_id: branch, // Keep the full object for display
          branch_name: branch.name || "",
          received_date: stockIn.received_date || stockIn.createdAt,
          items: stockIn.items || [],
          remarks: stockIn.remarks || "",
          total_cost: stockIn.total_cost || 0,
          status: stockIn.status || "received",
          created_at: stockIn.createdAt,
          updated_at: stockIn.updatedAt,
        };
      });

      console.log("Fetched stock ins:", mappedStockIns);
      setStockIns(mappedStockIns);
      return mappedStockIns;
    } catch (err) {
      console.error("Fetch stock ins error:", err);
      setError("Failed to load stock ins");
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Create stock in (GRN) - UPDATED to only use received_quantity/received_weight
  const createStockIn = async (stockInData) => {
    try {
      setLoading(true);
      setError("");

      // Prepare the data for API - match your form structure
      const apiData = {
        po_id: stockInData.po_id || null,
        supplier_id: stockInData.supplier_id,
        branch_id: stockInData.branch_id,
        received_date: stockInData.received_date,
        items: stockInData.items.map((item) => {
          const orderedQty = parseFloat(item.ordered_quantity) || 0;
          const orderedWt = parseFloat(item.ordered_weight) || 0;
          const receivedQty = parseFloat(item.received_quantity) || 0;
          const receivedWt = parseFloat(item.received_weight) || 0;

          // Determine status based on received vs ordered
          let itemStatus = "pending";
          const ordered = orderedQty > 0 ? orderedQty : orderedWt;
          const received = receivedQty > 0 ? receivedQty : receivedWt;

          if (received > 0 && received < ordered) {
            itemStatus = "partially_received";
          } else if (received >= ordered) {
            itemStatus = "received";
          }

          return {
            po_item_id: item.po_item_id || null,
            inventory_item_id: item.inventory_item_id,
            ordered_quantity: orderedQty,
            ordered_weight: orderedWt,
            unit_id: item.unit_id || null,
            unit_code: item.unit_code || null,
            unit_name: item.unit_name || null,
            cost: parseFloat(item.cost) || parseFloat(item.rate) || 0,
            total_cost: parseFloat(item.total_cost) || parseFloat(item.total) || 0,
            received_quantity: receivedQty,
            received_weight: receivedWt,
            remarks: item.remarks || "",
            status: itemStatus,
          };
        }),
        remarks: stockInData.remarks || "",
        total_cost: parseFloat(stockInData.total_cost) || 0,
        status: stockInData.status || "received",
      };

      console.log("API Data for create:", apiData);

      const url = API_ENDPOINTS.createStockMovement();
      console.log("Creating stock in at:", url, "Data:", apiData);

      const res = await axios.post(url, apiData);
      console.log("Create stock in response:", res.data);

      if (res.data?.success) {
        const responseData = res.data.data || res.data;

        const newStockIn = {
          _id: responseData._id,
          po_id: responseData.po_id || stockInData.po_id,
          supplier_id: responseData.supplier_id || stockInData.supplier_id,
          supplier_name: stockInData.supplier_name,
          branch_id: responseData.branch_id || stockInData.branch_id,
          branch_name: stockInData.branch_name,
          received_date: responseData.received_date || stockInData.received_date,
          items: responseData.items || stockInData.items.map(item => ({
            ...item,
            // Ensure received fields are properly set
            received_quantity: parseFloat(item.received_quantity) || 0,
            received_weight: parseFloat(item.received_weight) || 0,
          })),
          remarks: responseData.remarks || stockInData.remarks,
          total_cost: responseData.total_cost || stockInData.total_cost,
          status: responseData.status || stockInData.status,
          created_at: responseData.createdAt,
          updated_at: responseData.updatedAt,
        };

        setStockIns((prev) => [...prev, newStockIn]);

        // Refetch to ensure consistency
        setTimeout(() => {
          fetchPurchaseReceived();
        }, 500);

        return newStockIn;
      } else {
        throw new Error(res.data?.message || "Failed to create stock in");
      }
    } catch (err) {
      console.error("Create stock in error:", err);
      setError(err.response?.data?.message || err.message || "Failed to create stock in");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update stock in (GRN) - UPDATED to only use received_quantity/received_weight
  const updateStockIn = async (id, stockInData) => {
    try {
      setLoading(true);
      setError("");

      // Prepare the data for API - match your form structure
      const apiData = {
        po_id: stockInData.po_id || null,
        supplier_id: stockInData.supplier_id,
        branch_id: stockInData.branch_id,
        received_date: stockInData.received_date,
        items: stockInData.items.map((item) => {
          const orderedQty = parseFloat(item.ordered_quantity) || 0;
          const orderedWt = parseFloat(item.ordered_weight) || 0;
          const receivedQty = parseFloat(item.received_quantity) || 0;
          const receivedWt = parseFloat(item.received_weight) || 0;

          // Determine status based on received vs ordered
          let itemStatus = "pending";
          const ordered = orderedQty > 0 ? orderedQty : orderedWt;
          const received = receivedQty > 0 ? receivedQty : receivedWt;

          if (received > 0 && received < ordered) {
            itemStatus = "partially_received";
          } else if (received >= ordered) {
            itemStatus = "received";
          }

          return {
            po_item_id: item.po_item_id || null,
            inventory_item_id: item.inventory_item_id,
            ordered_quantity: orderedQty,
            ordered_weight: orderedWt,
            unit_id: item.unit_id || null,
            unit_code: item.unit_code || null,
            unit_name: item.unit_name || null,
            cost: parseFloat(item.cost) || parseFloat(item.rate) || 0,
            total_cost: parseFloat(item.total_cost) || parseFloat(item.total) || 0,
            received_quantity: receivedQty,
            received_weight: receivedWt,
            remarks: item.remarks || "",
            status: itemStatus,
          };
        }),
        remarks: stockInData.remarks || "",
        total_cost: parseFloat(stockInData.total_cost) || 0,
        status: stockInData.status || "received",
      };

      console.log("API Data for update:", apiData);

      const url = API_ENDPOINTS.updateStockMovement(id);
      console.log("Updating stock in at:", url, "Data:", apiData);

      const res = await axios.put(url, apiData);
      console.log("Update stock in response:", res.data);

      if (res.data?.success) {
        const responseData = res.data.data || res.data;

        const updatedStockIn = {
          _id: responseData._id || id,
          po_id: responseData.po_id || stockInData.po_id,
          supplier_id: responseData.supplier_id || stockInData.supplier_id,
          supplier_name: stockInData.supplier_name,
          branch_id: responseData.branch_id || stockInData.branch_id,
          branch_name: stockInData.branch_name,
          received_date: responseData.received_date || stockInData.received_date,
          items: responseData.items || stockInData.items.map(item => ({
            ...item,
            // Ensure received fields are properly set
            received_quantity: parseFloat(item.received_quantity) || 0,
            received_weight: parseFloat(item.received_weight) || 0,
          })),
          remarks: responseData.remarks || stockInData.remarks,
          total_cost: responseData.total_cost || stockInData.total_cost,
          status: responseData.status || stockInData.status,
          updated_at: responseData.updatedAt,
        };

        setStockIns((prev) =>
          prev.map((item) => (item._id === id ? updatedStockIn : item))
        );

        // Refetch to ensure consistency
        setTimeout(() => {
          fetchPurchaseReceived();
        }, 500);

        return updatedStockIn;
      } else {
        throw new Error(res.data?.message || "Failed to update stock in");
      }
    } catch (err) {
      console.error("Update stock in error:", err);
      setError(err.response?.data?.message || err.message || "Failed to update stock in");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete stock in (GRN)
  const deleteStockIn = async (id) => {
    try {
      setLoading(true);
      setError("");

      const url = API_ENDPOINTS.deleteStockMovement(id);
      console.log("Deleting stock in at:", url);

      const res = await axios.delete(url);
      console.log("Delete stock in response:", res.data);

      if (res.data?.success) {
        setStockIns((prev) => prev.filter((item) => item._id !== id));
        return true;
      } else {
        throw new Error(res.data?.message || "Failed to delete stock in");
      }
    } catch (err) {
      console.error("Delete stock in error:", err);
      setError(err.response?.data?.message || "Failed to delete stock in");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get a single stock in by ID
  const getStockInById = async (id) => {
    try {
      setLoading(true);
      setError("");

      // First, get all stock ins and find the one with matching ID
      await fetchPurchaseReceived();

      const stockIn = stockIns.find((item) => item._id === id);

      if (!stockIn) {
        setError("Stock in not found");
        return null;
      }

      // Transform the item to match form structure if needed
      const transformedStockIn = {
        ...stockIn,
        items: stockIn.items?.map(item => ({
          ...item,
          // Map received fields to the form structure
          received_quantity: item.received_quantity || 0,
          received_weight: item.received_weight || 0,
          // Handle nested inventory_item_id object
          inventory_item_id: item.inventory_item_id?._id || item.inventory_item_id,
          inventory_item_name: item.inventory_item_id?.name || "Unknown Item",
          sku_code: item.inventory_item_id?.item_code || "N/A",
        })) || [],
      };

      return transformedStockIn;
    } catch (err) {
      console.error("Get stock in by ID error:", err);
      setError("Failed to load stock in details");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Initialize data on mount
  useEffect(() => {
    const initializeData = async () => {
      await Promise.all([fetchPurchaseOrders()]);
    };

    initializeData();
  }, []);

  // Fetch stock ins on mount
  useEffect(() => {
    fetchPurchaseReceived();
  }, []);

  return {
    // Data
    stockIns,
    purchaseOrders,
    
    // Loading states
    loading,
    loadingPurchaseOrders,

    // Error
    error,

    // Functions
    fetchPurchaseReceived,
    fetchPurchaseOrders,
    createStockIn,
    updateStockIn,
    deleteStockIn,
    getStockInById,
  };
}