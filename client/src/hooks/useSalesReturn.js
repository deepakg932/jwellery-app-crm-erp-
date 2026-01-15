// hooks/useSalesReturn.js
import { useState, useEffect } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "@/api/api";

export default function useSalesReturn() {
  const [saleReturns, setSaleReturns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch all sale returns
  const fetchSaleReturns = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get(API_ENDPOINTS.getSaleReturns());
      
      let returnsData = [];
      console.log(res)

      // Handle different response structures
      if (res.data?.success && Array.isArray(res.data.data)) {
        returnsData = res.data.data;
      } else if (Array.isArray(res.data)) {
        returnsData = res.data;
      } else if (res.data?.data?.returns) {
        returnsData = res.data.data.returns;
      }

      // Map to consistent format
      const mappedReturns = returnsData.map((returnItem) => ({
        _id: returnItem._id,
        return_number: returnItem.return_number || `RET-${Date.now()}`,
        sale_id: returnItem.sale_id || returnItem.sale,
        reference_no: returnItem.reference_no,
        return_date: returnItem.return_date || new Date().toISOString(),
        customer_id: returnItem.customer_id,
        customer_name: returnItem.customer_name || returnItem.customer_id?.name,
        items: returnItem.items || [],
        reason: returnItem.reason || "",
        return_type: returnItem.return_type || "full",
        status: returnItem.status || "pending",
        refund_amount: parseFloat(returnItem.refund_amount) || 0,
        total_amount: parseFloat(returnItem.total_amount) || 0,
        notes: returnItem.notes || "",
        created_at: returnItem.created_at,
        updated_at: returnItem.updated_at,
      }));

      setSaleReturns(mappedReturns);
      return mappedReturns;
    } catch (err) {
      console.error("Fetch sale returns error:", err);
      setError("Failed to load sale returns");
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Create a sale return - UPDATED
  const createSaleReturn = async (returnData) => {
    try {
      setLoading(true);
      setError("");

      // Transform data for your API
      const transformedData = {
        sale_id: returnData.sale_id,
        return_date: returnData.return_date,
        reference_no: returnData.reference_no,
        items: returnData.items.map(item => ({
          product_id: item.product_id,
          quantity: parseFloat(item.quantity) || 0, // Original quantity from sale
          return_quantity: parseFloat(item.return_quantity) || 0,
          price_before_tax: parseFloat(item.price_before_tax) || 0,
          gst_rate: parseFloat(item.gst_rate) || 0,
          gst_amount: parseFloat(item.gst_amount) || 0,
          selling_total: parseFloat(item.selling_total) || 0,
          final_total: parseFloat(item.final_total) || 0,
          return_reason: item.return_reason || "",
        })),
        reason: returnData.reason,
        return_type: returnData.return_type,
        refund_amount: parseFloat(returnData.refund_amount) || 0,
        total_amount: parseFloat(returnData.total_amount) || 0,
        notes: returnData.notes || "",
        status: "pending",
      };

      console.log("Sending sale return data:", transformedData);

      const res = await axios.post(API_ENDPOINTS.createSaleReturn(), transformedData);
      
      if (res.data?.success) {
        const newReturn = res.data.data || res.data;
        setSaleReturns(prev => [newReturn, ...prev]);
        return newReturn;
      } else {
        throw new Error(res.data?.message || "Failed to create sale return");
      }
    } catch (err) {
      console.error("Create sale return error:", err);
      setError(err.response?.data?.message || "Failed to create sale return");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update sale return status
  const updateSaleReturnStatus = async (id, status) => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.put(API_ENDPOINTS.updateSaleReturn(id), { status });
      
      if (res.data?.success) {
        setSaleReturns(prev => 
          prev.map(item => 
            item._id === id ? { ...item, status } : item
          )
        );
        return res.data.data;
      } else {
        throw new Error("Failed to update return status");
      }
    } catch (err) {
      console.error("Update return status error:", err);
      setError(err.response?.data?.message || "Failed to update return status");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get return by sale ID
  const getReturnBySaleId = async (saleId) => {
    try {
      setLoading(true);
      const res = await axios.get(API_ENDPOINTS.getSaleReturnBySaleId(saleId));
      
      if (res.data?.success) {
        return res.data.data || res.data;
      }
      return null;
    } catch (err) {
      console.error("Get return by sale error:", err);
      return null;
    } finally {
      setLoading(false);
    }
  };
  console.log(saleReturns)

    useEffect(() => {
      // Fetch customer groups first, then customers
      const fetchData = async () => {
        await fetchSaleReturns();
      };
      
      fetchData();
    }, []);

  return {
    saleReturns,
    loading,
    error,
    fetchSaleReturns,
    createSaleReturn,
    updateSaleReturnStatus,
    getReturnBySaleId,
  };
}