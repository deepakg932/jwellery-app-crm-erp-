// hooks/useGRNs.js
import { useState, useEffect } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "@/api/api";

export default function useGRNs() {
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

      // Assuming you have a GRN API endpoint
      // You'll need to add this to your API_ENDPOINTS
      const res = await axios.get('/api/grns'); // Update this endpoint
      console.log("GRNs API Response:", res.data);

      let grnsData = [];

      if (res.data?.success && Array.isArray(res.data.data)) {
        grnsData = res.data.data;
      } else if (res.data?.fetched && Array.isArray(res.data.fetched)) {
        grnsData = res.data.fetched;
      } else if (Array.isArray(res.data)) {
        grnsData = res.data;
      }

      const mappedGRNs = grnsData.map((item) => ({
        _id: item._id || item.id,
        grn_number: item.grn_number || `GRN-${Date.now()}`,
        po_reference: item.po_reference || item.purchase_order_id || null,
        supplier: item.supplier_id || item.supplier || {},
        branch: item.branch_id || item.branch || {},
        items: item.items || [],
        status: item.status || "received",
        remarks: item.remarks || "",
        total_cost: item.total_cost || 0,
        created_date: item.created_date || item.createdAt || new Date().toISOString().split('T')[0],
      }));

      console.log("Fetched GRNs:", mappedGRNs);
      setGrns(mappedGRNs);
    } catch (err) {
      console.error("Fetch GRNs error:", err);
      setError("Failed to load GRNs");
    } finally {
      setLoading(false);
    }
  };

  // Add a new GRN
  const addGRN = async (grnData) => {
    try {
      setLoading(true);
      setError("");

      // Assuming you have a create GRN API endpoint
      const res = await axios.post('/api/grns', grnData); // Update this endpoint
      console.log("Add GRN response:", res.data);

      let newGRN = {
        _id: `temp-${Date.now()}`,
        ...grnData,
        status: "received",
      };

      if (res.data?.success) {
        const responseData = res.data.data || res.data;
        newGRN = {
          _id: responseData._id || responseData.id,
          grn_number: responseData.grn_number || `GRN-${Date.now()}`,
          po_reference: responseData.po_reference || grnData.po_reference,
          supplier: responseData.supplier_id || responseData.supplier || grnData.supplier,
          branch: responseData.branch_id || responseData.branch || grnData.branch,
          items: responseData.items || grnData.items,
          status: responseData.status || "received",
          remarks: responseData.remarks || grnData.remarks,
          total_cost: responseData.total_cost || grnData.total_cost,
          created_date: responseData.created_date || new Date().toISOString().split('T')[0],
        };
      }

      setGrns(prev => [...prev, newGRN]);
      
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

      // Assuming you have an update GRN API endpoint
      const res = await axios.put(`/api/grns/${id}`, grnData); // Update this endpoint
      console.log("Update GRN response:", res.data);

      if (res.data?.success) {
        const responseData = res.data.data || res.data;
        const updatedData = {
          _id: responseData._id || responseData.id || id,
          grn_number: responseData.grn_number,
          po_reference: responseData.po_reference || grnData.po_reference,
          supplier: responseData.supplier_id || responseData.supplier || grnData.supplier,
          branch: responseData.branch_id || responseData.branch || grnData.branch,
          items: responseData.items || grnData.items,
          status: responseData.status || "received",
          remarks: responseData.remarks || grnData.remarks,
          total_cost: responseData.total_cost || grnData.total_cost,
          created_date: responseData.created_date || grnData.created_date,
        };

        setGrns(prev => prev.map(item => (item._id === id ? updatedData : item)));
        
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

      // Assuming you have a delete GRN API endpoint
      const res = await axios.delete(`/api/grns/${id}`); // Update this endpoint
      console.log("Delete response:", res.data);

      if (res.data?.success) {
        setGrns(prev => prev.filter((item) => item._id !== id));
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
  };
}