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

      const url = API_ENDPOINTS.getSaleItems();
      console.log("Fetching sales from:", url);

      const res = await axios.get(url);
      console.log("Sales API Response:", res.data);

      let salesData = [];

      // Handle your specific API response structure
      if (res.data?.success && Array.isArray(res.data.data)) {
        salesData = res.data.data;
      }
      // Also handle other possible structures for compatibility
      else if (Array.isArray(res.data)) {
        salesData = res.data;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        salesData = res.data.data;
      }

      console.log("Extracted sales data:", salesData);

      // Map the data to a consistent format
      const mappedSales = salesData.map((sale) => {
        // Extract customer information
        const customer = sale.customer_id || sale.customer || {};
        const customerName =
          customer.name || customer.customer_name || "Unknown Customer";

        const customerMobile = customer.mobile || customer.phone || "";

        // Extract branch information
        const branch = sale.branch_id || sale.branch || {};
        const branchName = branch.branch_name || branch.name || "Main Branch";
        const branchCode = branch.branch_code || branch.code || "";

        // Use reference_no as identifier
        const referenceNo =
          sale.reference_no ||
          sale.sale_number ||
          sale.ref_number ||
          `REF-${sale._id?.slice(-8) || Date.now()}`;

        // Calculate totals from API response
        const totalAmount = parseFloat(sale.total_amount) || 0;
        const grandTotal = parseFloat(sale.grand_total) || totalAmount;
        const finalTotal = parseFloat(sale.final_total) || grandTotal;
        const subtotal = parseFloat(sale.subtotal) || 0;
        const shippingCost = parseFloat(sale.shipping_cost) || 0;
        const discount = parseFloat(sale.discount) || 0;

        // Payment information
        const paidAmount = parseFloat(sale.paid_amount) || 0;
        const currentPaid = parseFloat(sale.current_paid) || paidAmount;
        const balanceAmount =
          parseFloat(sale.balance_amount) || totalAmount - currentPaid;

        return {
          _id: sale._id,
          // Use reference_no - with fallback
          reference_no: referenceNo,
          sale_number: sale.sale_number, // Keep original if exists
          customer_id: customer,
          customer_name: customerName,
          customer_mobile: customerMobile,
          customer_code: customer.customer_code || "",
          sale_date:
            sale.sale_date || sale.createdAt || new Date().toISOString(),
          items: sale.items || [],
          status:
            sale.sale_status?.toLowerCase() ||
            sale.status?.toLowerCase() ||
            "draft",
          sale_note: sale.sale_note || sale.notes || "",
          shipping_cost: shippingCost,
          discount: discount,
          tax_amount: parseFloat(sale.gst_amount) || 0,
          total_tax: parseFloat(sale.total_tax) || 0, // ADD THIS LINE
          gst_amount: parseFloat(sale.gst_amount) || 0,
          gst_rate: sale.items?.[0]?.gst_rate || 0,
          subtotal: subtotal,
          total_amount: totalAmount,
          final_total: finalTotal,
          grand_total: grandTotal,
          branch_id: branch,
          branch_name: branchName,
          branch_code: branchCode,
          payment_status: sale.payment_status?.toLowerCase() || "pending",
          paid_amount: currentPaid,
          current_paid: currentPaid,
          balance_amount: balanceAmount,
          payment_date: sale.payment_date || null,
          payment_method: sale.payment_method || "",
          payment_notes: sale.payment_notes || "",
          created_at: sale.createdAt || new Date().toISOString(),
          updated_at: sale.updatedAt || new Date().toISOString(),

          // INVOICE FIELDS - ADD THESE:
          has_invoice: sale.has_invoice || false,
          invoice_id: sale.invoice_id || null,
          invoice_number: sale.invoice_number || null,

          // Additional fields for your response structure
          product_code: sale.items?.[0]?.product_code,
          price_before_tax: sale.items?.[0]?.price_before_tax,
          selling_total: sale.items?.[0]?.selling_total,
        };
      });

      console.log("Mapped sales for table:", mappedSales);
      setSales(mappedSales);
      return mappedSales;
    } catch (err) {
      console.error("Fetch sales error:", err);

      // Handle specific error cases
      if (err.response) {
        const errorMessage =
          err.response.data?.message ||
          err.response.data?.error ||
          `Server error: ${err.response.status}`;
        setError(errorMessage);
      } else if (err.request) {
        setError("Network error. Please check your connection.");
      } else {
        setError("Failed to load sales. Please try again.");
      }

      // Return empty array on error
      setSales([]);
    } finally {
      setLoading(false);
    }
  };
  // Add a new sale
  const addSale = async (saleData) => {
    try {
      setLoading(true);
      setError("");

      // Generate a temporary reference number for immediate display
      const tempRefNo = `TEMP-${Date.now()}-${Math.floor(
        Math.random() * 1000
      )}`;

      // Transform the data to match backend expectations
      const transformedData = {
        customer_id: saleData.customer_id,
        sale_date: saleData.sale_date,
        items: Array.isArray(saleData.items)
          ? saleData.items.map((item) => ({
              product_id: item.product_id,
              quantity: parseFloat(item.quantity) || 1,
              price_before_tax: parseFloat(item.price_before_tax) || 0,
              gst_rate: parseFloat(item.gst_rate) || 0,
              gst_amount: parseFloat(item.gst_amount) || 0,
              selling_total: parseFloat(item.selling_total) || 0,
              final_total: parseFloat(item.final_total) || 0,
              product_name: item.product_name,
              product_code: item.product_code,
            }))
          : [],
        sale_note: saleData.sale_note || "",
        shipping_cost: parseFloat(saleData.shipping_cost) || 0,
        discount: parseFloat(saleData.discount) || 0,
        vat: parseFloat(saleData.vat) || 0,
        subtotal: parseFloat(saleData.subtotal) || 0,
        total_amount: parseFloat(saleData.total_amount) || 0,
        grand_total: parseFloat(saleData.grand_total) || 0,
        branch_id: saleData.branch_id,
        status: saleData.status || "draft",
        payment_status: saleData.payment_status || "pending",
        // Include reference_no from form if provided
        reference_no: saleData.reference_no || null,
      };

      const url = API_ENDPOINTS.createSaleItem();
      console.log("Adding sale at:", url, "Data:", transformedData);

      const res = await axios.post(url, transformedData);
      console.log("Add sale response:", res.data);

      if (!res.data) {
        throw new Error("No response from server");
      }

      // Handle different response formats
      const responseData = res.data.data || res.data;

      if (!responseData) {
        throw new Error("Invalid response structure");
      }

      // Extract customer info for immediate display
      const customer = responseData.customer_id || transformedData.customer_id;
      const customerName =
        customer?.name || customer?.customer_name || "Unknown Customer";

      const newSale = {
        _id: responseData._id || responseData.id || `temp-${Date.now()}`,
        reference_no: responseData.reference_no || tempRefNo, // Use backend ref or temp
        customer_id: customer,
        customer_name: customerName,
        customer_mobile: customer?.mobile || customer?.phone || "",
        customer_code: customer?.customer_code || "",
        sale_date: responseData.sale_date || transformedData.sale_date,
        items: Array.isArray(responseData.items)
          ? responseData.items.map((item) => ({
              ...item,
              product: item.product || null,
            }))
          : transformedData.items,
        status: responseData.status || transformedData.status,
        sale_note: responseData.sale_note || transformedData.sale_note,
        shipping_cost:
          responseData.shipping_cost || transformedData.shipping_cost,
        discount: responseData.discount || transformedData.discount,
        vat: responseData.vat || transformedData.vat,
        subtotal: responseData.subtotal || transformedData.subtotal,
        total_amount: responseData.total_amount || transformedData.total_amount,
        grand_total: responseData.grand_total || transformedData.grand_total,
        branch_id: responseData.branch_id || transformedData.branch_id,
        branch_name:
          responseData.branch?.branch_name ||
          responseData.branch?.name ||
          "Main Branch",
        branch_code:
          responseData.branch?.branch_code || responseData.branch?.code || "",
        payment_status:
          responseData.payment_status || transformedData.payment_status,
        created_at:
          responseData.createdAt ||
          responseData.created_at ||
          new Date().toISOString(),
        updated_at:
          responseData.updatedAt ||
          responseData.updated_at ||
          new Date().toISOString(),
      };

      console.log("New sale created:", newSale);

      // Update state optimistically
      setSales((prev) => [newSale, ...prev]);

      // Refresh the list to get the actual reference_no from backend
      setTimeout(() => {
        fetchSales();
      }, 1000);

      // Return the created sale
      return newSale;
    } catch (err) {
      console.error("Add sale error:", err);

      // Handle specific error cases
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
        setError("Failed to add sale. Please try again.");
        throw err;
      }
    } finally {
      setLoading(false);
    }
  };

  // Update payment status of a sale
  const updateSalePayment = async (id, paymentData) => {
    try {
      setLoading(true);
      setError("");

      console.log(
        "Updating payment for sale ID:",
        id,
        "Payment Data:",
        paymentData
      );

      // Use the updateSaleItem endpoint
      const url = API_ENDPOINTS.updateSaleItem(id);

      // Prepare the payment update payload according to your API structure
      const totalAmount = sales.find((s) => s._id === id)?.total_amount || 0;
      const paidAmount = parseFloat(paymentData.paid_amount) || 0;
      const balanceAmount = totalAmount - paidAmount;

      const updatePayload = {
        payment_status: paymentData.payment_status,
        paid_amount: paidAmount,
        balance_amount: balanceAmount,
        payment_date:
          paymentData.payment_date || new Date().toISOString().split("T")[0],
        payment_method: paymentData.payment_method || "",
        payment_notes: paymentData.payment_notes || "",
      };

      console.log("Sending payment update to:", url, "Payload:", updatePayload);

      const res = await axios.put(url, updatePayload);
      console.log("Update payment response:", res.data);

      if (res.data?.success || res.data?.status === "success") {
        const responseData = res.data.data || res.data;

        // Update the sale in local state immediately for better UX
        setSales((prev) =>
          prev.map((sale) => {
            if (sale._id === id) {
              const updatedSale = {
                ...sale,
                payment_status: paymentData.payment_status,
                paid_amount: paidAmount,
                current_paid: paidAmount,
                balance_amount: balanceAmount,
                payment_date: paymentData.payment_date,
                payment_method: paymentData.payment_method,
                payment_notes: paymentData.payment_notes,
                updated_at: new Date().toISOString(),
              };

              // If status is paid and paid amount equals total amount, update balance to 0
              if (
                paymentData.payment_status === "paid" &&
                Math.abs(paidAmount - sale.total_amount) < 0.01
              ) {
                updatedSale.balance_amount = 0;
              }

              return updatedSale;
            }
            return sale;
          })
        );

        // Refresh data to ensure consistency with backend
        setTimeout(() => {
          fetchSales();
        }, 500);

        return responseData;
      } else {
        throw new Error(res.data?.message || "Failed to update payment status");
      }
    } catch (err) {
      console.error("Update payment error:", err);

      let errorMessage = "Failed to update payment status";

      if (err.response) {
        errorMessage =
          err.response.data?.message ||
          err.response.data?.error ||
          `Server error: ${err.response.status}`;

        // Log detailed error for debugging
        console.error("Error details:", err.response.data);
      } else if (err.request) {
        errorMessage = "Network error. Please check your connection.";
      }

      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Update a sale
  const updateSale = async (id, saleData) => {
    try {
      setLoading(true);
      setError("");

      const url = API_ENDPOINTS.updateSaleItem(id);
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
          payment_status:
            responseData.payment_status || saleData.payment_status,
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

      const url = API_ENDPOINTS.deleteSaleItem(id);
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
    updateSalePayment,
    updateSale,
    deleteSale,
  };
}
