// hooks/useQuotations.js
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "@/api/api";

export default function useQuotations() {
  const [quotations, setQuotations] = useState([]);
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

      console.log("Quotation Customers API Response:", res.data);

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
      console.error("Error fetching customers for quotations:", err);
      setError("Failed to load customers");
      return [];
    } finally {
      setLoadingCustomers(false);
    }
  };

  // Fetch items (products) for dropdown
  const fetchItems = useCallback(async (page = 1, limit = 100) => {
    try {
      setLoadingItems(true);
      const response = await axios.get(
        `${API_ENDPOINTS.getAllItems()}?page=${page}&limit=${limit}`
      );

      console.log("Fetch items for quotation response:", response.data);

      let itemsData = [];

      if (response.data && response.data.success) {
        if (response.data.products && Array.isArray(response.data.products)) {
          itemsData = response.data.products;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          itemsData = response.data.data;
        }
      }

      console.log("Processed items for quotation:", itemsData);
      setItems(itemsData);
      return itemsData;
    } catch (err) {
      console.error("Error fetching items for quotations:", err);
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

      console.log("Units API Response for quotation:", res.data);

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
      console.error("Error fetching units for quotations:", err);
      setError("Failed to load units");
      return [];
    } finally {
      setLoadingUnits(false);
    }
  };

  // Fetch Branches (similar to branches for quotations)
  const fetchBranches = async () => {
    try {
      setLoadingBranches(true);
      const res = await axios.get(API_ENDPOINTS.getBranches());
      let BranchesData = [];

      console.log("BranchesData API Response:", res.data);

      if (res.data?.success && Array.isArray(res.data.data)) {
        BranchesData = res.data.data;
      } else if (res.data?.fetched && Array.isArray(res.data.fetched)) {
        BranchesData = res.data.fetched;
      } else if (Array.isArray(res.data)) {
        BranchesData = res.data;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        BranchesData = res.data.data;
      }

      console.log("Processed Branches:", BranchesData);
      setBranches(BranchesData);
      return BranchesData;
    } catch (err) {
      console.error("Error fetching Branches:", err);
      setError("Failed to load Branches");
      return [];
    } finally {
      setLoadingBranches(false);
    }
  };

  // Fetch all quotations
  const fetchQuotations = async () => {
    try {
      setLoading(true);
      setError("");

      const url = API_ENDPOINTS.getQuotations();
      console.log("Fetching quotations from:", url);

      const res = await axios.get(url);
      console.log("Quotations API Response:", res.data);

      let quotationsData = [];

      if (res.data?.success && Array.isArray(res.data.data)) {
        quotationsData = res.data.data;
      } else if (Array.isArray(res.data)) {
        quotationsData = res.data;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        quotationsData = res.data.data;
      }

      console.log("Extracted quotations data:", quotationsData);

      const mappedQuotations = quotationsData.map((quotation) => {
        const customer = quotation.customer_id || quotation.customer || {};
        const customerName =
          customer.name || customer.customer_name || "Unknown Customer";
        const customerMobile = customer.mobile || customer.phone || "";

        const branch = quotation.branch_id|| {};
        const branchName = branch.name || branch.branch_name || "Main branch";
        const branchCode = branch.code || branch.branch_code || "";

        const totalAmount = parseFloat(quotation.total_amount) || 0;
        const grandTotal = parseFloat(quotation.grand_total) || totalAmount;
        const subtotal = parseFloat(quotation.subtotal) || 0;
        const shippingCost = parseFloat(quotation.shipping_cost) || 0;
        const discount = parseFloat(quotation.discount) || 0;
        const taxAmount = parseFloat(quotation.tax_amount) || 0;

        return {
          _id: quotation._id,
          quotation_number: quotation.quotation_number,
          customer_id: customer,
          customer_name: customerName,
          customer_mobile: customerMobile,
          customer_code: customer.customer_code || "",
          quotation_date: quotation.quotation_date || quotation.createdAt || new Date().toISOString(),
          expiry_date: quotation.expiry_date || null,
          items: quotation.items || [],
          status: quotation.status?.toLowerCase() || "draft",
          note: quotation.note || quotation.quotation_note || "",
          shipping_cost: shippingCost,
          discount: discount,
          tax_amount: taxAmount,
          subtotal: subtotal,
          total_amount: totalAmount,
          grand_total: grandTotal,
          branch_id: branch,
          branch_name: branchName,
          branch_code: branchCode,
          created_at: quotation.createdAt || new Date().toISOString(),
          updated_at: quotation.updatedAt || new Date().toISOString(),
          created_by: quotation.created_by || null,
          terms_conditions: quotation.terms_conditions || "",
          valid_days: quotation.valid_days || 30,
        };
      });

      console.log("Mapped quotations for table:", mappedQuotations);
      setQuotations(mappedQuotations);
      return mappedQuotations;
    } catch (err) {
      console.error("Fetch quotations error:", err);

      if (err.response) {
        const errorMessage =
          err.response.data?.message ||
          err.response.data?.error ||
          `Server error: ${err.response.status}`;
        setError(errorMessage);
      } else if (err.request) {
        setError("Network error. Please check your connection.");
      } else {
        setError("Failed to load quotations. Please try again.");
      }

      setQuotations([]);
    } finally {
      setLoading(false);
    }
  };

  // Add a new quotation
  const addQuotation = async (quotationData) => {
    try {
      setLoading(true);
      setError("");

      const tempRefNo = `TEMP-QTN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      const transformedData = {
        customer_id: quotationData.customer_id,
        quotation_date: quotationData.quotation_date,
        expiry_date: quotationData.expiry_date,
        items: Array.isArray(quotationData.items)
          ? quotationData.items.map((item) => ({
              product_id: item.product_id,
              quantity: parseFloat(item.quantity) || 1,
              unit_price: parseFloat(item.unit_price) || 0,
              discount: parseFloat(item.discount) || 0,
              tax_rate: parseFloat(item.tax_rate) || 0,
              tax_amount: parseFloat(item.tax_amount) || 0,
              net_price: parseFloat(item.net_price) || 0,
              subtotal: parseFloat(item.subtotal) || 0,
              product_name: item.product_name,
              product_code: item.product_code,
            }))
          : [],
        note: quotationData.note || "",
        shipping_cost: parseFloat(quotationData.shipping_cost) || 0,
        discount: parseFloat(quotationData.discount) || 0,
        tax_amount: parseFloat(quotationData.tax_amount) || 0,
        subtotal: parseFloat(quotationData.subtotal) || 0,
        total_amount: parseFloat(quotationData.total_amount) || 0,
        grand_total: parseFloat(quotationData.grand_total) || 0,
        branch_id: quotationData.branch_id,
        status: quotationData.status || "draft",
        terms_conditions: quotationData.terms_conditions || "",
        valid_days: quotationData.valid_days || 30,
      };

      const url = API_ENDPOINTS.createQuotation();
      console.log("Adding quotation at:", url, "Data:", transformedData);

      const res = await axios.post(url, transformedData);
      console.log("Add quotation response:", res.data);

      if (!res.data) {
        throw new Error("No response from server");
      }

      const responseData = res.data.data || res.data;

      if (!responseData) {
        throw new Error("Invalid response structure");
      }

      const customer = responseData.customer_id || transformedData.customer_id;
      const customerName =
        customer?.name || customer?.customer_name || "Unknown Customer";

      const newQuotation = {
        _id: responseData._id || responseData.id || `temp-${Date.now()}`,
        customer_id: customer,
        customer_name: customerName,
        customer_mobile: customer?.mobile || customer?.phone || "",
        customer_code: customer?.customer_code || "",
        quotation_date: responseData.quotation_date || transformedData.quotation_date,
        expiry_date: responseData.expiry_date || transformedData.expiry_date,
        items: Array.isArray(responseData.items)
          ? responseData.items.map((item) => ({
              ...item,
              product: item.product || null,
            }))
          : transformedData.items,
        status: responseData.status || transformedData.status,
        note: responseData.note || transformedData.note,
        shipping_cost: responseData.shipping_cost || transformedData.shipping_cost,
        discount: responseData.discount || transformedData.discount,
        tax_amount: responseData.tax_amount || transformedData.tax_amount,
        subtotal: responseData.subtotal || transformedData.subtotal,
        total_amount: responseData.total_amount || transformedData.total_amount,
        grand_total: responseData.grand_total || transformedData.grand_total,
        branch_id: responseData.branch_id || transformedData.branch_id,
        branch_name: responseData.branch?.name || responseData.branch?.branch_name || "Main branch",
        branch_code: responseData.branch?.code || responseData.branch?.branch_code || "",
        created_at: responseData.createdAt || responseData.created_at || new Date().toISOString(),
        updated_at: responseData.updatedAt || responseData.updated_at || new Date().toISOString(),
        terms_conditions: responseData.terms_conditions || transformedData.terms_conditions,
        valid_days: responseData.valid_days || transformedData.valid_days,
      };

      console.log("New quotation created:", newQuotation);

      setQuotations((prev) => [newQuotation, ...prev]);

      setTimeout(() => {
        fetchQuotations();
      }, 1000);

      return newQuotation;
    } catch (err) {
      console.error("Add quotation error:", err);

      if (err.response) {
        const errorMessage =
          err.response.data?.message ||
          err.response.data?.error ||
          `Server error: ${err.response.status}`;
        setError(errorMessage);
        throw new Error(errorMessage);
      } else if (err.request) {
        setError("Network error. Please check your connection.");
        throw new Error("Network error");
      } else {
        setError("Failed to add quotation. Please try again.");
        throw err;
      }
    } finally {
      setLoading(false);
    }
  };

  // Update a quotation
  const updateQuotation = async (id, quotationData) => {
    try {
      setLoading(true);
      setError("");

      const url = API_ENDPOINTS.updateQuotation(id);
      console.log("Updating quotation at:", url, "Data:", quotationData);

      const res = await axios.put(url, quotationData);
      console.log("Update quotation response:", res.data);

      if (res.data?.success) {
        const responseData = res.data.data || res.data;
        const updatedData = {
          _id: responseData._id || responseData.id || id,
          customer_id: responseData.customer_id || quotationData.customer_id,
          quotation_date: responseData.quotation_date || quotationData.quotation_date,
          expiry_date: responseData.expiry_date || quotationData.expiry_date,
          items: responseData.items || quotationData.items,
          status: responseData.status || quotationData.status || "draft",
          note: responseData.note || quotationData.note,
          shipping_cost: responseData.shipping_cost || quotationData.shipping_cost,
          discount: responseData.discount || quotationData.discount,
          tax_amount: responseData.tax_amount || quotationData.tax_amount,
          subtotal: responseData.subtotal || quotationData.subtotal,
          total_amount: responseData.total_amount || quotationData.total_amount,
          grand_total: responseData.grand_total || quotationData.grand_total,
          branch_id: responseData.branch_id || quotationData.branch_id,
          terms_conditions: responseData.terms_conditions || quotationData.terms_conditions,
          valid_days: responseData.valid_days || quotationData.valid_days,
        };

        console.log("Updated quotation data:", updatedData);
        setQuotations((prev) =>
          prev.map((item) => (item._id === id ? updatedData : item))
        );

        setTimeout(() => {
          fetchQuotations();
        }, 500);

        return updatedData;
      } else {
        throw new Error(res.data?.message || "Failed to update quotation");
      }
    } catch (err) {
      console.error("Update quotation error:", err);
      setError("Failed to update quotation");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete a quotation
  const deleteQuotation = async (id) => {
    try {
      setLoading(true);
      setError("");

      const url = API_ENDPOINTS.deleteQuotation(id);
      console.log("Deleting quotation at:", url);

      const res = await axios.delete(url);
      console.log("Delete response:", res.data);

      if (res.data?.success) {
        setQuotations((prev) => prev.filter((item) => item._id !== id));
      } else {
        throw new Error(res.data?.message || "Failed to delete quotation");
      }

      return res.data;
    } catch (err) {
      console.error("Delete quotation error:", err);
      setError("Failed to delete quotation");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Convert quotation to sale
  const convertToSale = async (quotationId) => {
    try {
      setLoading(true);
      setError("");

      const url = API_ENDPOINTS.convertQuotationToSale(quotationId);
      console.log("Converting quotation to sale:", url);

      const res = await axios.post(url);
      console.log("Convert to sale response:", res.data);

      if (res.data?.success) {
        setQuotations((prev) =>
          prev.map((quotation) =>
            quotation._id === quotationId
              ? { ...quotation, status: "converted" }
              : quotation
          )
        );

        return res.data;
      } else {
        throw new Error(res.data?.message || "Failed to convert quotation");
      }
    } catch (err) {
      console.error("Convert to sale error:", err);
      setError("Failed to convert quotation to sale");
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

  // Fetch quotations on mount
  useEffect(() => {
    fetchQuotations();
  }, []);

  return {
    // Data
    quotations,
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
    fetchQuotations,
    fetchCustomers,
    fetchItems,
    fetchUnits,
    fetchBranches,
    addQuotation,
    updateQuotation,
    deleteQuotation,
    convertToSale,
  };
}