import { useState, useEffect } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "@/api/api";

export default function usePurchaseReturn() {
  const [purchaseReturns, setPurchaseReturns] = useState([]);
  const [stockIns, setStockIns] = useState([]); // Purchase Received for dropdown
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loadingStockIns, setLoadingStockIns] = useState(false);

  // Fetch Purchase Received for dropdown
  const fetchStockIns = async () => {
    try {
      setLoadingStockIns(true);
      const url = API_ENDPOINTS.getStockMovements();
      console.log("Fetching purchase received from:", url);

      const res = await axios.get(url);
      console.log("Purchase Received API Response:", res.data);

      let stockInsData = [];

      // Handle different response structures
      if (res.data?.success && res.data?.data) {
        if (Array.isArray(res.data.data)) {
          stockInsData = res.data.data;
        } else if (Array.isArray(res.data.data.data)) {
          stockInsData = res.data.data.data;
        }
      } else if (Array.isArray(res.data)) {
        stockInsData = res.data;
      }

      // Filter only received purchase entries
      const receivedPurchase = stockInsData.filter(
        (pr) => pr.status === "received" || pr.status === "partially_received"
      );

      console.log("Fetched Purchase Received:", receivedPurchase);
      setStockIns(receivedPurchase);
      return receivedPurchase;
    } catch (err) {
      console.error("Fetch purchase received error:", err);
      setError("Failed to load purchase received entries");
      return [];
    } finally {
      setLoadingStockIns(false);
    }
  };

  // Fetch purchase returns
  const fetchPurchaseReturns = async () => {
    try {
      setLoading(true);
      setError("");
      const url = API_ENDPOINTS.getPurchaseReturns();
      console.log("Fetching purchase returns from:", url);

      const res = await axios.get(url);
      console.log("Purchase Returns API Response:", res.data);

      let purchaseReturnsData = [];

      if (res.data?.success && res.data?.data) {
        if (Array.isArray(res.data.data)) {
          purchaseReturnsData = res.data.data;
        } else if (Array.isArray(res.data.data.data)) {
          purchaseReturnsData = res.data.data.data;
        }
      } else if (Array.isArray(res.data)) {
        purchaseReturnsData = res.data;
      }

      // Map data to match form structure
      const mappedPurchaseReturns = purchaseReturnsData.map((returnItem) => {
        // Handle nested objects
        const purchaseReceived = returnItem.purchase_received_id || {};
        const supplier = returnItem.supplier_id || {};
        const branch = returnItem.branch_id || {};

        // Get PO number from nested structure
        const poNumber = purchaseReceived.po_number || 
                        purchaseReceived.po_id?.po_number || 
                        `PR-${purchaseReceived._id?.substring(0, 8)}`;

        return {
          _id: returnItem._id,
          purchase_received_id: purchaseReceived, // Keep full object
          po_number: poNumber,
          supplier_id: supplier,
          supplier_name: supplier.supplier_name || supplier.name || "",
          branch_id: branch,
          branch_name: branch.branch_name || branch.name || "",
          return_date: returnItem.return_date || returnItem.createdAt,
          return_reason: returnItem.return_reason || "",
          items: returnItem.items || [],
          remarks: returnItem.remarks || "",
          total_cost: returnItem.total_cost || 0,
          status: returnItem.status || "pending",
          created_at: returnItem.createdAt,
          updated_at: returnItem.updatedAt,
        };
      });

      console.log("Fetched purchase returns:", mappedPurchaseReturns);
      setPurchaseReturns(mappedPurchaseReturns);
      return mappedPurchaseReturns;
    } catch (err) {
      console.error("Fetch purchase returns error:", err);
      setError("Failed to load purchase returns");
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Create purchase return
  const createPurchaseReturn = async (returnData) => {
    try {
      setLoading(true);
      setError("");

      // Prepare the data for API
      const apiData = {
        purchase_received_id: returnData.purchase_received_id || null,
        supplier_id: returnData.supplier_id,
        branch_id: returnData.branch_id,
        return_date: returnData.return_date,
        return_reason: returnData.return_reason,
        items: returnData.items.map((item) => {
          // Calculate return quantity/weight
          const returnedQty = parseFloat(item.return_quantity) || 0;
          const returnedWt = parseFloat(item.return_weight) || 0;
          const availableQty = parseFloat(item.available_quantity) || 0;
          const availableWt = parseFloat(item.available_weight) || 0;

          // Validate return doesn't exceed available
          if (returnedQty > availableQty || returnedWt > availableWt) {
            throw new Error(`Return quantity exceeds available for ${item.inventory_item_name}`);
          }

          return {
            purchase_received_item_id: item.purchase_received_item_id || null,
            inventory_item_id: item.inventory_item_id,
            available_quantity: availableQty,
            available_weight: availableWt,
            return_quantity: returnedQty,
            return_weight: returnedWt,
            unit_id: item.unit_id || null,
            unit_code: item.unit_code || null,
            unit_name: item.unit_name || null,
            cost: parseFloat(item.cost) || 0,
            total_cost: parseFloat(item.total_cost) || 0,
            reason: item.reason || "",
            status: "pending",
          };
        }),
        remarks: returnData.remarks || "",
        total_cost: parseFloat(returnData.total_cost) || 0,
        status: returnData.status || "pending",
      };

      console.log("API Data for create purchase return:", apiData);

      const url = API_ENDPOINTS.createPurchaseReturn();
      console.log("Creating purchase return at:", url);

      const res = await axios.post(url, apiData);
      console.log("Create purchase return response:", res.data);

      if (res.data?.success) {
        const responseData = res.data.data || res.data;

        const newReturn = {
          _id: responseData._id,
          purchase_received_id: responseData.purchase_received_id || returnData.purchase_received_id,
          po_number: returnData.po_number,
          supplier_id: responseData.supplier_id || returnData.supplier_id,
          supplier_name: returnData.supplier_name,
          branch_id: responseData.branch_id || returnData.branch_id,
          branch_name: returnData.branch_name,
          return_date: responseData.return_date || returnData.return_date,
          return_reason: responseData.return_reason || returnData.return_reason,
          items: responseData.items || returnData.items.map(item => ({
            ...item,
            return_quantity: parseFloat(item.return_quantity) || 0,
            return_weight: parseFloat(item.return_weight) || 0,
          })),
          remarks: responseData.remarks || returnData.remarks,
          total_cost: responseData.total_cost || returnData.total_cost,
          status: responseData.status || returnData.status,
          created_at: responseData.createdAt,
          updated_at: responseData.updatedAt,
        };

        setPurchaseReturns((prev) => [...prev, newReturn]);

        // Refetch to ensure consistency
        setTimeout(() => {
          fetchPurchaseReturns();
        }, 500);

        return newReturn;
      } else {
        throw new Error(res.data?.message || "Failed to create purchase return");
      }
    } catch (err) {
      console.error("Create purchase return error:", err);
      setError(err.response?.data?.message || err.message || "Failed to create purchase return");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update purchase return
  const updatePurchaseReturn = async (id, returnData) => {
    try {
      setLoading(true);
      setError("");

      const apiData = {
        purchase_received_id: returnData.purchase_received_id || null,
        supplier_id: returnData.supplier_id,
        branch_id: returnData.branch_id,
        return_date: returnData.return_date,
        return_reason: returnData.return_reason,
        items: returnData.items.map((item) => {
          const returnedQty = parseFloat(item.return_quantity) || 0;
          const returnedWt = parseFloat(item.return_weight) || 0;
          const availableQty = parseFloat(item.available_quantity) || 0;
          const availableWt = parseFloat(item.available_weight) || 0;

          if (returnedQty > availableQty || returnedWt > availableWt) {
            throw new Error(`Return quantity exceeds available for ${item.inventory_item_name}`);
          }

          return {
            purchase_received_item_id: item.purchase_received_item_id || null,
            inventory_item_id: item.inventory_item_id,
            available_quantity: availableQty,
            available_weight: availableWt,
            return_quantity: returnedQty,
            return_weight: returnedWt,
            unit_id: item.unit_id || null,
            unit_code: item.unit_code || null,
            unit_name: item.unit_name || null,
            cost: parseFloat(item.cost) || 0,
            total_cost: parseFloat(item.total_cost) || 0,
            reason: item.reason || "",
            status: item.status || "pending",
          };
        }),
        remarks: returnData.remarks || "",
        total_cost: parseFloat(returnData.total_cost) || 0,
        status: returnData.status || "pending",
      };

      console.log("API Data for update purchase return:", apiData);

      const url = API_ENDPOINTS.updatePurchaseReturn(id);
      console.log("Updating purchase return at:", url);

      const res = await axios.put(url, apiData);
      console.log("Update purchase return response:", res.data);

      if (res.data?.success) {
        const responseData = res.data.data || res.data;

        const updatedReturn = {
          _id: responseData._id || id,
          purchase_received_id: responseData.purchase_received_id || returnData.purchase_received_id,
          po_number: returnData.po_number,
          supplier_id: responseData.supplier_id || returnData.supplier_id,
          supplier_name: returnData.supplier_name,
          branch_id: responseData.branch_id || returnData.branch_id,
          branch_name: returnData.branch_name,
          return_date: responseData.return_date || returnData.return_date,
          return_reason: responseData.return_reason || returnData.return_reason,
          items: responseData.items || returnData.items.map(item => ({
            ...item,
            return_quantity: parseFloat(item.return_quantity) || 0,
            return_weight: parseFloat(item.return_weight) || 0,
          })),
          remarks: responseData.remarks || returnData.remarks,
          total_cost: responseData.total_cost || returnData.total_cost,
          status: responseData.status || returnData.status,
          updated_at: responseData.updatedAt,
        };

        setPurchaseReturns((prev) =>
          prev.map((item) => (item._id === id ? updatedReturn : item))
        );

        setTimeout(() => {
          fetchPurchaseReturns();
        }, 500);

        return updatedReturn;
      } else {
        throw new Error(res.data?.message || "Failed to update purchase return");
      }
    } catch (err) {
      console.error("Update purchase return error:", err);
      setError(err.response?.data?.message || err.message || "Failed to update purchase return");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete purchase return
  const deletePurchaseReturn = async (id) => {
    try {
      setLoading(true);
      setError("");

      const url = API_ENDPOINTS.deletePurchaseReturn(id);
      console.log("Deleting purchase return at:", url);

      const res = await axios.delete(url);
      console.log("Delete purchase return response:", res.data);

      if (res.data?.success) {
        setPurchaseReturns((prev) => prev.filter((item) => item._id !== id));
        return true;
      } else {
        throw new Error(res.data?.message || "Failed to delete purchase return");
      }
    } catch (err) {
      console.error("Delete purchase return error:", err);
      setError(err.response?.data?.message || "Failed to delete purchase return");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get a single purchase return by ID
  const getPurchaseReturnById = async (id) => {
    try {
      setLoading(true);
      setError("");

      await fetchPurchaseReturns();

      const returnItem = purchaseReturns.find((item) => item._id === id);

      if (!returnItem) {
        setError("Purchase return not found");
        return null;
      }

      const transformedReturn = {
        ...returnItem,
        items: returnItem.items?.map(item => ({
          ...item,
          return_quantity: item.return_quantity || 0,
          return_weight: item.return_weight || 0,
          inventory_item_id: item.inventory_item_id?._id || item.inventory_item_id,
          inventory_item_name: item.inventory_item_id?.name || "Unknown Item",
          sku_code: item.inventory_item_id?.item_code || "N/A",
        })) || [],
      };

      return transformedReturn;
    } catch (err) {
      console.error("Get purchase return by ID error:", err);
      setError("Failed to load purchase return details");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Initialize data on mount
  useEffect(() => {
    const initializeData = async () => {
      await Promise.all([fetchStockIns()]);
    };

    initializeData();
  }, []);

  // Fetch purchase returns on mount
  useEffect(() => {
    fetchPurchaseReturns();
  }, []);

  return {
    // Data
    purchaseReturns,
    stockIns,
    
    // Loading states
    loading,
    loadingStockIns,

    // Error
    error,

    // Functions
    fetchPurchaseReturns,
    fetchStockIns,
    createPurchaseReturn,
    updatePurchaseReturn,
    deletePurchaseReturn,
    getPurchaseReturnById,
  };
}