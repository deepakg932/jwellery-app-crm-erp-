import { useState, useEffect } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "@/api/api";

export default function useStockIn() {
  const [grns, setGrns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loadingPurchaseOrders, setLoadingPurchaseOrders] = useState(false);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);
  const [loadingInventoryItems, setLoadingInventoryItems] = useState(false);
  const [loadingBranches, setLoadingBranches] = useState(false);

  // Fetch purchase orders for reference dropdown
  const fetchPurchaseOrders = async () => {
    try {
      setLoadingPurchaseOrders(true);
      const res = await axios.get(API_ENDPOINTS.getPurchaseOrders());
      
      let purchaseOrdersData = [];
      
      if (res.data?.success && Array.isArray(res.data.data)) {
        purchaseOrdersData = res.data.data;
      } else if (res.data?.fetched && Array.isArray(res.data.fetched)) {
        purchaseOrdersData = res.data.fetched;
      } else if (Array.isArray(res.data)) {
        purchaseOrdersData = res.data;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        purchaseOrdersData = res.data.data;
      }
      
      console.log("Fetched purchase orders for GRN:", purchaseOrdersData);
      setPurchaseOrders(purchaseOrdersData);
      return purchaseOrdersData;
    } catch (err) {
      console.error("Error fetching purchase orders:", err);
      setError("Failed to load purchase orders");
      return [];
    } finally {
      setLoadingPurchaseOrders(false);
    }
  };

  // Fetch suppliers
  const fetchSuppliers = async () => {
    try {
      setLoadingSuppliers(true);
      const res = await axios.get(API_ENDPOINTS.getSuppliers());
      let suppliersData = [];
      
      if (res.data?.success && Array.isArray(res.data.data)) {
        suppliersData = res.data.data;
      } else if (res.data?.fetched && Array.isArray(res.data.fetched)) {
        suppliersData = res.data.fetched;
      } else if (Array.isArray(res.data)) {
        suppliersData = res.data;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        suppliersData = res.data.data;
      }
      
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

  // Fetch inventory items
  const fetchInventoryItems = async () => {
    try {
      setLoadingInventoryItems(true);
      const res = await axios.get(API_ENDPOINTS.getInventoryItems());
      
      let itemsData = [];
      
      if (res.data?.success && Array.isArray(res.data.data)) {
        itemsData = res.data.data;
      } else if (res.data?.fetched && Array.isArray(res.data.fetched)) {
        itemsData = res.data.fetched;
      } else if (Array.isArray(res.data)) {
        itemsData = res.data;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        itemsData = res.data.data;
      }
      
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

  // Fetch branches
  const fetchBranches = async () => {
    try {
      setLoadingBranches(true);
      const res = await axios.get(API_ENDPOINTS.getBranches());
      
      console.log("Branches API Response:", res.data);
      
      let branchesData = [];
      
      if (res.data?.success && Array.isArray(res.data.data)) {
        branchesData = res.data.data;
      } else if (res.data?.fetched && Array.isArray(res.data.fetched)) {
        branchesData = res.data.fetched;
      } else if (Array.isArray(res.data)) {
        branchesData = res.data;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        branchesData = res.data.data;
      }
      
      console.log("Fetched branches:", branchesData);
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

  // Fetch all GRNs
  const fetchGRNs = async () => {
    try {
      setLoading(true);
      setError("");

      // Using the correct API endpoint from your configuration
      const res = await axios.get(API_ENDPOINTS.getGRNs());
      console.log("GRNs API Response:", res.data);

      let grnsData = [];

      // Extract data based on your API response structure
      if (res.data?.success && Array.isArray(res.data.data)) {
        grnsData = res.data.data;
      } else if (res.data?.fetched && Array.isArray(res.data.fetched)) {
        grnsData = res.data.fetched;
      } else if (Array.isArray(res.data)) {
        grnsData = res.data;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        grnsData = res.data.data;
      }

      // Map the response to match your table structure
      const mappedGRNs = grnsData.map((grn) => ({
        _id: grn._id || grn.id,
        grn_number: grn.grn_number || `GRN-${Date.now()}`,
        po_id: grn.po_id?._id || grn.po_id,
        po_reference: grn.po_id,
        supplier_id: grn.supplier_id?._id || grn.supplier_id,
        supplier: grn.supplier_id,
        branch_id: grn.branch_id?._id || grn.branch_id,
        branch: grn.branch_id,
        items: grn.items || [],
        total_items: grn.total_items || (grn.items ? grn.items.length : 0),
        total_cost: grn.total_cost || 0,
        status: grn.status || "received",
        remarks: grn.remarks || "",
        received_by: grn.received_by,
        received_date: grn.received_date,
        grn_date: grn.received_date || grn.createdAt,
        createdAt: grn.createdAt,
        updatedAt: grn.updatedAt,
      }));

      console.log("Fetched GRNs:", mappedGRNs);
      setGrns(mappedGRNs);
      return mappedGRNs;
    } catch (err) {
      console.error("Fetch GRNs error:", err);
      setError("Failed to load GRNs");
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Add a new GRN
  const addGRN = async (grnData) => {
    try {
      setLoading(true);
      setError("");

      // Using the correct API endpoint from your configuration
      const res = await axios.post(API_ENDPOINTS.createGRN(), grnData);
      console.log("Add GRN response:", res.data);

      // Handle different response formats
      let newGRN = {
        _id: `temp-${Date.now()}`,
        ...grnData,
        status: "received",
      };

      if (res.data?.success) {
        const responseData = res.data.data || res.data;
        newGRN = {
          _id: responseData._id,
          grn_number: responseData.grn_number,
          po_id: responseData.po_id?._id || responseData.po_id,
          po_reference: responseData.po_id,
          supplier_id: responseData.supplier_id?._id || responseData.supplier_id,
          supplier: responseData.supplier_id,
          branch_id: responseData.branch_id?._id || responseData.branch_id,
          branch: responseData.branch_id,
          items: responseData.items || grnData.items,
          total_items: responseData.total_items || (responseData.items ? responseData.items.length : 0),
          total_cost: responseData.total_cost || grnData.total_cost,
          status: responseData.status || "received",
          remarks: responseData.remarks || grnData.remarks,
          received_date: responseData.received_date,
          grn_date: responseData.received_date || responseData.createdAt,
          createdAt: responseData.createdAt || new Date(),
          updatedAt: responseData.updatedAt,
        };
      }

      // Update local state
      setGrns(prev => [...prev, newGRN]);
      
      // Refresh the list after a short delay
      setTimeout(() => {
        fetchGRNs();
      }, 500);
      
      return newGRN;
    } catch (err) {
      console.error("Add GRN error:", err);
      setError("Failed to add GRN");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update a GRN
  const updateGRN = async (id, grnData) => {
    try {
      setLoading(true);
      setError("");

      // Using the correct API endpoint from your configuration
      const res = await axios.put(API_ENDPOINTS.updateGRN(id), grnData);
      console.log("Update GRN response:", res.data);

      if (res.data?.success) {
        const responseData = res.data.data || res.data;
        const updatedData = {
          _id: responseData._id || id,
          grn_number: responseData.grn_number,
          po_id: responseData.po_id?._id || responseData.po_id,
          po_reference: responseData.po_id,
          supplier_id: responseData.supplier_id?._id || responseData.supplier_id,
          supplier: responseData.supplier_id,
          branch_id: responseData.branch_id?._id || responseData.branch_id,
          branch: responseData.branch_id,
          items: responseData.items || grnData.items,
          total_items: responseData.total_items || (responseData.items ? responseData.items.length : 0),
          total_cost: responseData.total_cost || grnData.total_cost,
          status: responseData.status || "received",
          remarks: responseData.remarks || grnData.remarks,
          received_date: responseData.received_date,
          grn_date: responseData.received_date || responseData.updatedAt,
          updatedAt: responseData.updatedAt || new Date(),
        };

        // Update local state
        setGrns(prev => prev.map(item => (item._id === id ? updatedData : item)));
        
        // Refresh the list
        setTimeout(() => {
          fetchGRNs();
        }, 500);
        
        return updatedData;
      } else {
        throw new Error(res.data?.message || "Failed to update GRN");
      }
    } catch (err) {
      console.error("Update GRN error:", err);
      setError("Failed to update GRN");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete a GRN
  const deleteGRN = async (id) => {
    try {
      setLoading(true);
      setError("");

      // Using the correct API endpoint from your configuration
      const res = await axios.delete(API_ENDPOINTS.deleteGRN(id));
      console.log("Delete response:", res.data);

      if (res.data?.success) {
        // Update local state
        setGrns(prev => prev.filter((item) => item._id !== id));
        return true;
      } else {
        throw new Error(res.data?.message || "Failed to delete GRN");
      }
    } catch (err) {
      console.error("Delete GRN error:", err);
      setError("Failed to delete GRN");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get GRN by ID (for view/edit)
  const getGRNById = async (id) => {
    try {
      setLoading(true);
      setError("");

      // Using the correct API endpoint from your configuration
      const res = await axios.get(API_ENDPOINTS.getGRNById(id));
      console.log("Get GRN by ID response:", res.data);

      if (res.data?.success) {
        const responseData = res.data.data || res.data;
        return {
          _id: responseData._id,
          grn_number: responseData.grn_number,
          po_id: responseData.po_id?._id || responseData.po_id,
          po_reference: responseData.po_id,
          supplier_id: responseData.supplier_id?._id || responseData.supplier_id,
          supplier: responseData.supplier_id,
          branch_id: responseData.branch_id?._id || responseData.branch_id,
          branch: responseData.branch_id,
          items: responseData.items || [],
          total_items: responseData.total_items || (responseData.items ? responseData.items.length : 0),
          total_cost: responseData.total_cost || 0,
          status: responseData.status || "received",
          remarks: responseData.remarks || "",
          received_date: responseData.received_date,
          grn_date: responseData.received_date || responseData.createdAt,
          createdAt: responseData.createdAt,
          updatedAt: responseData.updatedAt,
        };
      } else {
        throw new Error(res.data?.message || "Failed to fetch GRN");
      }
    } catch (err) {
      console.error("Get GRN by ID error:", err);
      setError("Failed to fetch GRN details");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Initialize data on mount
  useEffect(() => {
    const initializeData = async () => {
      await Promise.all([
        fetchPurchaseOrders(),
        fetchSuppliers(),
        fetchInventoryItems(),
        fetchBranches()
      ]);
    };

    initializeData();
  }, []);

  // Fetch GRNs on mount
  useEffect(() => {
    fetchGRNs();
  }, []);

  return {
    // Data
    grns,
    purchaseOrders,
    suppliers,
    inventoryItems,
    branches,
    
    // Loading states
    loading,
    loadingPurchaseOrders,
    loadingSuppliers,
    loadingInventoryItems,
    loadingBranches,
    
    // Error
    error,
    
    // Functions
    fetchGRNs,
    fetchPurchaseOrders,
    fetchSuppliers,
    fetchInventoryItems,
    fetchBranches,
    addGRN,
    updateGRN,
    deleteGRN,
    getGRNById,
  };
}