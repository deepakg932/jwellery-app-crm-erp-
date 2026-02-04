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
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [loadingBranches, setLoadingBranches] = useState(false);

  // Fetch all employees
  const fetchEmployees = async () => {
    try {
      setLoadingEmployees(true);
      const url = API_ENDPOINTS.getEmployees();
      console.log("Fetching employees from:", url);

      const res = await axios.get(url);
      console.log("Employees API Response:", res.data);

      let employeesData = [];

      // Handle different response structures
      if (res.data?.success && Array.isArray(res.data.data)) {
        employeesData = res.data.data;
      } else if (res.data?.fetched && Array.isArray(res.data.fetched)) {
        employeesData = res.data.fetched;
      } else if (Array.isArray(res.data)) {
        employeesData = res.data;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        employeesData = res.data.data;
      }

      const mappedEmployees = employeesData.map((item) => ({
        _id: item._id || item.id,
        name: item.name || item.employee_name || "",
        email: item.email || "",
        phone: item.phone || item.mobile || "",
        pan_number: item.pan_number || "",
        aadhaar_number: item.aadhaar_number || "",
        address: item.address || "",
        city: item.city || "",
        state: item.state || "",
        country: item.country || "",
        pincode: item.pincode || "",
        role_id: item.role_id?._id || item.role_id || "",
        role_name: item.role_id?.role_name || item.role_name || "",
        basic_salary: item.basic_salary || 0,
        image: item.image || item.profile_image || "",
        employee_code: item.employee_code || "",
        status: item.status === "active" || item.status === true,
        createdAt: item.createdAt || "",
      }));

      console.log("Fetched employees:", mappedEmployees);
      setEmployees(mappedEmployees);
      return mappedEmployees;
    } catch (err) {
      console.error("Fetch employees error:", err);
      setError(err.response?.data?.message || "Failed to load employees");
      return [];
    } finally {
      setLoadingEmployees(false);
    }
  };

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
        `${API_ENDPOINTS.getAllItems()}?page=${page}&limit=${limit}`,
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

        // Extract employee/sold_by information
        const soldBy = sale.sold_by || {};
        const soldByName = soldBy.name || "";

        // Use reference_no as identifier (it's available in your response)
        const referenceNo =
          sale.reference_no ||
          sale.sale_number ||
          `REF-${sale._id?.slice(-8) || Date.now()}`;

        // Calculate totals from API response - FIXED BASED ON YOUR RESPONSE
        const subtotal = parseFloat(sale.subtotal) || 0;
        const totalTax = parseFloat(sale.total_tax) || 0;
        const totalAmount = parseFloat(sale.total_amount) || 0;
        const shippingCost = parseFloat(sale.shipping_cost) || 0;
        const discount = parseFloat(sale.discount) || 0;
        const exchangeAmount = parseFloat(sale.exchange_amount) || 0;

        // IMPORTANT: Calculate grand_total based on your business logic
        // From your response, total_amount seems to be AFTER exchange adjustment
        // So grand_total should be subtotal + total_tax + shipping_cost - discount
        const grandTotal = subtotal + totalTax + shippingCost - discount;

        // final_total might be the same as grand_total in your case
        const finalTotal = parseFloat(sale.final_total) || grandTotal;

        // Payment information - FIXED BASED ON YOUR RESPONSE
        const currentPaid = parseFloat(sale.current_paid) || 0;
        const balanceAmount = parseFloat(sale.balance_amount);

        // Determine paid_amount from payment_status
        let paidAmount = 0;
        if (sale.payment_status === "paid") {
          paidAmount = currentPaid || totalAmount;
        } else {
          paidAmount = currentPaid;
        }

        // Items information - FIXED BASED ON YOUR RESPONSE
        const items = Array.isArray(sale.items) ? sale.items : [];
        const firstItem = items[0] || {};

        // GST information from first item or sale level
        const gstRate = firstItem.gst_rate || 0;
        const gstAmount = firstItem.gst_amount || 0;

        // Price before tax from first item
        const priceBeforeTax = firstItem.price_before_tax || 0;

        // Exchange details - FIXED BASED ON YOUR RESPONSE
        const exchangeDetails = sale.exchange_details || {};
        const isExchange = sale.is_exchange || false;

        return {
          _id: sale._id,
          // Use reference_no from your response
          reference_no: referenceNo,
          sale_number: referenceNo, // Using reference_no as sale_number too
          customer_id: customer,
          customer_name: customerName,
          customer_mobile: customerMobile,
          customer_code: customer.customer_code || "",
          sale_date:
            sale.sale_date || sale.createdAt || new Date().toISOString(),
          items: items,

          // Exchange fields - FIXED
          is_exchange: isExchange,
          exchange_amount: exchangeAmount,
          exchange_note: sale.exchange_note || "",
          exchange_details: exchangeDetails,

          // Status fields - FIXED
          status: (sale.sale_status || sale.status || "draft").toLowerCase(),
          sale_note: sale.sale_note || sale.notes || "",

          // Financial fields - FIXED
          shipping_cost: shippingCost,
          discount: discount,
          tax_amount: totalTax,
          total_tax: totalTax,
          gst_amount: gstAmount,
          gst_rate: gstRate,
          subtotal: subtotal,
          total_amount: totalAmount,
          final_total: finalTotal,
          grand_total: grandTotal,
          price_before_tax: priceBeforeTax,

          // Branch information
          branch_id: branch,
          branch_name: branchName,
          branch_code: branchCode,

          // Sold by information
          sold_by: soldBy,
          sold_by_id: soldBy._id || "",
          sold_by_name: soldByName,

          // Payment fields - FIXED
          payment_status: (sale.payment_status || "pending").toLowerCase(),
          paid_amount: paidAmount,
          current_paid: currentPaid,
          balance_amount: balanceAmount,
          payment_date: sale.payment_date || null,
          payment_method: sale.payment_method || "",
          payment_notes: sale.payment_notes || "",

          // Timestamps
          created_at: sale.createdAt || new Date().toISOString(),
          updated_at: sale.updatedAt || new Date().toISOString(),

          // INVOICE FIELDS - FIXED
          has_invoice: sale.has_invoice || false,
          invoice_id: sale.invoice_id || null,
          invoice_number: sale.invoice_number || null,

          // Additional fields for item details
          product_name: firstItem.product_name || "",
          product_id: firstItem.product_id || "",
          quantity: firstItem.quantity || 1,
          selling_total: firstItem.selling_total || 0,

          // Additional metadata
          created_by: sale.created_by || null,
          __v: sale.__v || 0,
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
      return [];
    } finally {
      setLoading(false);
    }
  };

  const addSale = async (formData) => {
    try {
      setLoading(true);
      setError("");

      console.log("=== SENDING SALE DATA ===");

      // Debug: Show all FormData entries
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(
            `${key}: [File: ${value.name}, size: ${value.size}, type: ${value.type}]`,
          );
        } else if (key === "items") {
          try {
            const parsed = JSON.parse(value);
            console.log(`${key}:`, parsed);
          } catch (e) {
            console.log(`${key}:`, value.substring(0, 100) + "...");
          }
        } else {
          console.log(`${key}:`, value);
        }
      }

      const url = API_ENDPOINTS.createSaleItem();
      console.log("Sending request to:", url);

      const res = await axios.post(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 30000, // 30 seconds timeout
      });

      console.log("Add sale response:", res.data);

      if (!res.data) {
        throw new Error("No response from server");
      }

      if (!res.data.success) {
        throw new Error(res.data.message || "Failed to create sale");
      }

      const responseData = res.data.data || res.data;

      if (!responseData) {
        throw new Error("Invalid response structure");
      }

      // Extract customer info
      const customer = responseData.customer_id || {};
      const customerName =
        customer.name || customer.customer_name || "Unknown Customer";
      const customerMobile = customer.mobile || customer.phone || "";

      // Extract branch info
      const branch = responseData.branch_id || {};
      const branchName = branch.branch_name || branch.name || "Main Branch";
      const branchCode = branch.branch_code || branch.code || "";

      // Extract sold_by info
      const soldBy = responseData.sold_by || {};
      const soldByName = soldBy.name || "";

      // Extract exchange details
      const exchangeDetails = responseData.exchange_details || {};

      // Build the new sale object
      const newSale = {
        _id: responseData._id,
        reference_no: responseData.reference_no,
        sale_number: responseData.reference_no,
        customer_id: customer,
        customer_name: customerName,
        customer_mobile: customerMobile,
        customer_code: customer.customer_code || "",
        sale_date: responseData.sale_date,

        items: Array.isArray(responseData.items)
          ? responseData.items.map((item) => ({
              ...item,
              product: item.product || null,
              product_name: item.product_name,
              product_code: item.product_code,
            }))
          : [],

        // Exchange details
        is_exchange: responseData.is_exchange || false,
        exchange_amount: responseData.exchange_amount || 0,
        exchange_note: responseData.exchange_note || "",
        exchange_item_name: exchangeDetails.item_name || "",
        exchange_item_weight: exchangeDetails.weight || 0,
        exchange_item_unit: exchangeDetails.unit || "",
        exchange_item_actual_rate: exchangeDetails.actual_rate || 0,
        exchange_item_image: exchangeDetails.image || null,
        exchange_details: exchangeDetails,

        // Financial details
        sale_note: responseData.sale_note || "",
        shipping_cost: responseData.shipping_cost || 0,
        discount: responseData.discount || 0,
        subtotal: responseData.subtotal || 0,
        total_tax: responseData.total_tax || 0,
        total_amount: responseData.total_amount || 0,
        final_total: responseData.total_amount || 0,
        grand_total: responseData.total_amount || 0,

        // Branch details
        branch_id: branch,
        branch_name: branchName,
        branch_code: branchCode,

        // Salesperson details
        sold_by: soldBy,
        sold_by_id: soldBy._id || "",
        sold_by_name: soldByName,

        // Status
        status: responseData.sale_status?.toLowerCase() || "draft",
        sale_status: responseData.sale_status || "draft",
        payment_status: responseData.payment_status?.toLowerCase() || "pending",

        // Payment information
        paid_amount: 0,
        balance_amount: responseData.total_amount || 0,

        // Timestamps
        created_at: responseData.createdAt || new Date().toISOString(),
        updated_at: responseData.updatedAt || new Date().toISOString(),

        // Additional fields
        created_by: responseData.created_by || null,
      };

      // Add full image URL if available
      if (exchangeDetails.fullImageUrl) {
        newSale.exchange_item_image_url = exchangeDetails.fullImageUrl;
      }

      console.log("New sale created:", newSale);

      // Update state
      setSales((prev) => [newSale, ...prev]);

      // Refresh data
      setTimeout(() => {
        fetchSales();
      }, 1000);

      return newSale;
    } catch (err) {
      console.error("Add sale error details:", err);

      let errorMessage = "Failed to create sale";

      if (err.response) {
        console.error("Error response:", {
          status: err.response.status,
          data: err.response.data,
          headers: err.response.headers,
        });

        errorMessage =
          err.response.data?.message ||
          err.response.data?.error ||
          `Server error: ${err.response.status}`;

        // Handle validation errors
        if (err.response.status === 400 && err.response.data?.errors) {
          const fieldErrors = err.response.data.errors;
          errorMessage = `Validation errors: ${
            Array.isArray(fieldErrors)
              ? fieldErrors.join(", ")
              : JSON.stringify(fieldErrors)
          }`;
        }
      } else if (err.request) {
        console.error("No response received:", err.request);
        errorMessage = "No response from server. Please check your connection.";
      } else {
        console.error("Request setup error:", err.message);
        errorMessage = err.message || "Failed to create sale";
      }

      setError(errorMessage);
      throw new Error(errorMessage);
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
        paymentData,
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
          }),
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
const updateSale = async (id, formData) => {
  try {
    setLoading(true);
    setError("");

    const url = API_ENDPOINTS.updateSaleItem(id);
    console.log("=== UPDATING SALE ===");
    console.log("Update URL:", url);

    // Create FormData from the passed formData (should be FormData object)
    const requestData = new FormData();

    // Copy all entries from the formData to requestData
    if (formData.entries) {
      for (let [key, value] of formData.entries()) {
        requestData.append(key, value);
      }
    } else {
      // If formData is not FormData, convert it
      for (let key in formData) {
        if (formData[key] !== undefined && formData[key] !== null) {
          if (key === 'items' && Array.isArray(formData[key])) {
            requestData.append(key, JSON.stringify(formData[key]));
          } else if (formData[key] instanceof File) {
            requestData.append(key, formData[key]);
          } else {
            requestData.append(key, formData[key].toString());
          }
        }
      }
    }

    // DEBUG: Log what we're sending
    console.log("Sending FormData:");
    for (let [key, value] of requestData.entries()) {
      if (value instanceof File) {
        console.log(`${key}: [File: ${value.name}, size: ${value.size}]`);
      } else {
        console.log(`${key}:`, value);
      }
    }

    // Send the request
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000,
    };

    console.log("Sending update request...");
    const res = await axios.put(url, requestData, config);
    console.log("Update sale response:", res.data);

    if (res.data?.success) {
      const responseData = res.data.data || res.data;
      console.log("Response data:", responseData);

      // Update local state
      setSales((prev) =>
        prev.map((sale) =>
          sale._id === id ? { ...sale, ...responseData } : sale
        )
      );

      // Refresh data
      setTimeout(() => {
        fetchSales();
      }, 1000);

      return responseData;
    } else {
      throw new Error(res.data?.message || "Failed to update sale");
    }
  } catch (err) {
    console.error("Update sale error:", err);
    
    let errorMessage = "Failed to update sale";
    
    if (err.response) {
      console.error("Error response:", err.response.data);
      errorMessage = err.response.data?.message || 
                    err.response.data?.error || 
                    `Server error: ${err.response.status}`;
    } else if (err.request) {
      errorMessage = "No response from server. Please check your connection.";
    } else {
      errorMessage = err.message || "Failed to update sale";
    }
    
    setError(errorMessage);
    throw new Error(errorMessage);
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
        fetchEmployees(),
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
    employees,

    // Loading states
    loading,
    loadingCustomers,
    loadingItems,
    loadingUnits,
    loadingBranches,
    loadingEmployees,

    // Error
    error,

    // Functions
    fetchSales,
    fetchCustomers,
    fetchItems,
    fetchUnits,
    fetchEmployees,
    fetchBranches,
    addSale,
    updateSalePayment,
    updateSale,
    deleteSale,
  };
}
