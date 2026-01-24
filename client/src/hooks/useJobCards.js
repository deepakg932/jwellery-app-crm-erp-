// hooks/useJobCards.js
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "@/api/api";

export default function useJobCards() {
  const [jobCards, setJobCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [allQuotations, setAllQuotations] = useState([]);
  const [loadingQuotations, setLoadingQuotations] = useState(false);

  // Add products state to hook
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Fetch ALL quotations - simplified without searchParams
  const fetchAllQuotations = useCallback(async () => {
    try {
      setLoadingQuotations(true);
      setError("");

      const url = API_ENDPOINTS.getQuotations();
      console.log("Fetching all quotations from:", url);

      const res = await axios.get(url);
      console.log("Quotations API Response:", res.data);

      let allQuotationsData = [];

      // Extract data based on your API response structure
      if (res.data?.success && Array.isArray(res.data.data)) {
        allQuotationsData = res.data.data;
      } else if (Array.isArray(res.data)) {
        allQuotationsData = res.data;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        allQuotationsData = res.data.data;
      }

      console.log("Total quotations found:", allQuotationsData.length);

      // Simple mapping - no filtering here
      const mappedQuotations = allQuotationsData.map((quotation) => {
        const customer = quotation.customer_id || {};
        const customerName = customer.name || "Unknown Customer";
        const customerMobile = customer.mobile || "";
        const customerPhone = customer.phone || "";

        return {
          _id: quotation._id,
          quotation_number: quotation.quotation_number,
          customer_id: customer,
          customer_name: customerName,
          customer_mobile: customerMobile || customerPhone,
          customer_code: customer.customer_code || "",
          quotation_date:
            quotation.quotation_date ||
            quotation.createdAt ||
            new Date().toISOString(),
          expiry_date: quotation.expiry_date || null,
          items: quotation.items || [],
          status: quotation.status || "draft",
          note: quotation.note || quotation.quotation_note || "",
          shipping_cost: parseFloat(quotation.shipping_cost) || 0,
          discount: parseFloat(quotation.discount) || 0,
          tax_amount: parseFloat(quotation.tax_amount) || 0,
          subtotal: parseFloat(quotation.subtotal) || 0,
          total_amount: parseFloat(quotation.total_amount) || 0,
          grand_total:
            parseFloat(quotation.grand_total) ||
            parseFloat(quotation.total_amount) ||
            0,

          created_at: quotation.createdAt || new Date().toISOString(),
          updated_at: quotation.updatedAt || new Date().toISOString(),
          created_by: quotation.created_by || null,
          terms_conditions: quotation.terms_conditions || "",
          valid_days: quotation.valid_days || 30,
        };
      });

      console.log("Mapped quotations:", mappedQuotations);
      setAllQuotations(mappedQuotations);
      return mappedQuotations;
    } catch (err) {
      console.error("Fetch quotations error:", err);

      let errorMessage = "Failed to load quotations. Please try again.";

      if (err.response) {
        errorMessage =
          err.response.data?.message ||
          err.response.data?.error ||
          `Server error: ${err.response.status}`;
      } else if (err.request) {
        errorMessage = "Network error. Please check your connection.";
      }

      setError(errorMessage);
      setAllQuotations([]);
      return [];
    } finally {
      setLoadingQuotations(false);
    }
  }, []);

  // Fetch employees (for assigned to)
  const fetchEmployees = async () => {
    try {
      setLoadingEmployees(true);
      const res = await axios.get(API_ENDPOINTS.getEmployees());
      let employeesData = [];

      if (res.data?.success && Array.isArray(res.data.data)) {
        employeesData = res.data.data;
      } else if (res.data?.fetched && Array.isArray(res.data.fetched)) {
        employeesData = res.data.fetched;
      } else if (Array.isArray(res.data)) {
        employeesData = res.data;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        employeesData = res.data.data;
      }

      setEmployees(employeesData);
      return employeesData;
    } catch (err) {
      console.error("Error fetching employees:", err);
      setError("Failed to load employees");
      return [];
    } finally {
      setLoadingEmployees(false);
    }
  };

  // Fetch products from API - ADDED TO HOOK
  const fetchProducts = useCallback(async (search = "") => {
    try {
      setLoadingProducts(true);
      let url = API_ENDPOINTS.getAllItems();

      if (search.trim()) {
        url += `?search=${encodeURIComponent(search)}`;
      }

      const response = await axios.get(url);
      console.log("Fetch products response:", response.data);

      let productsData = [];

      if (response.data?.success && Array.isArray(response.data.data)) {
        productsData = response.data.data;
      } else if (Array.isArray(response.data)) {
        productsData = response.data;
      } else if (
        response.data?.products &&
        Array.isArray(response.data.products)
      ) {
        // Your API returns products in response.data.products
        productsData = response.data.products;
      } else if (
        response.data?.data?.products &&
        Array.isArray(response.data.data.products)
      ) {
        productsData = response.data.data.products;
      }

      // Log the first product to see its structure
      if (productsData.length > 0) {
        console.log("First product structure:", productsData[0]);
        console.log("Available price fields:", {
          selling_price_with_gst: productsData[0].selling_price_with_gst,
          selling_price: productsData[0].selling_price,
          unit_price: productsData[0].unit_price,
          grand_total: productsData[0].grand_total,
        });
      }

      setProducts(productsData);
      return productsData;
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to load products");
      return [];
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  // Fetch all job cards
  const fetchJobCards = async () => {
    try {
      setLoading(true);
      setError("");

      const url = API_ENDPOINTS.getJobCards();
      console.log("Fetching job cards from:", url);

      const res = await axios.get(url);
      console.log("Job Cards API Response:", res.data);

      let jobCardsData = [];

      if (res.data?.success && Array.isArray(res.data.data)) {
        jobCardsData = res.data.data;
      } else if (Array.isArray(res.data)) {
        jobCardsData = res.data;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        jobCardsData = res.data.data;
      }

      const mappedJobCards = jobCardsData.map((jobCard) => {
        const customer = jobCard.customer_id || jobCard.customer || {};
        const customerName =
          customer.name || customer.customer_name || "Unknown Customer";
        const customerMobile = customer.mobile || customer.phone || "";

        const assignedTo = jobCard.assigned_to || {};
        const assignedName =
          assignedTo.name || assignedTo.employee_name || "Unassigned";

        const totalAmount = parseFloat(jobCard.total_amount) || 0;
        const advanceAmount = parseFloat(jobCard.advance_amount) || 0;
        const balanceAmount = parseFloat(jobCard.balance_amount) || 0;

        return {
          _id: jobCard._id,
          job_card_number: jobCard.job_card_no,
          customer_id: customer,
          customer_name: customerName,
          customer_mobile: customerMobile,
          customer_code: customer.customer_code || "",
          job_card_date:
            jobCard.job_card_date ||
            jobCard.createdAt ||
            new Date().toISOString(),
          delivery_date: jobCard.delivery_date || null,
          expected_delivery_date: jobCard.expected_delivery_date || null,
          items: jobCard.items || [],
          status: jobCard.status?.toLowerCase() || "pending",
          priority: jobCard.priority || "medium",
          note: jobCard.note || jobCard.job_card_note || "",
          instructions: jobCard.instructions || "",
          stage:jobCard.stage,
          total_amount: totalAmount,
          advance_amount: advanceAmount,
          balance_amount: balanceAmount,
          assigned_to: assignedTo,
          assigned_name: assignedName,
          // ADD QUOTATION INFO
          quotation_id: jobCard.quotation_id || null,
          quotation_number: jobCard.quotation_number || null,
          created_at: jobCard.createdAt || new Date().toISOString(),
          updated_at: jobCard.updatedAt || new Date().toISOString(),
          created_by: jobCard.created_by || null,
        };
      });

      console.log(
        "Fetched job cards with quotation info:",
        mappedJobCards
          .filter((jc) => jc.quotation_id)
          .map((jc) => ({
            id: jc._id,
            quotation_id: jc.quotation_id,
            quotation_number: jc.quotation_number,
          }))
      );

      setJobCards(mappedJobCards);
      return mappedJobCards;
    } catch (err) {
      console.error("Fetch job cards error:", err);

      if (err.response) {
        const errorMessage =
          err.response.data?.message ||
          err.response.data?.error ||
          `Server error: ${err.response.status}`;
        setError(errorMessage);
      } else if (err.request) {
        setError("Network error. Please check your connection.");
      } else {
        setError("Failed to load job cards. Please try again.");
      }

      setJobCards([]);
    } finally {
      setLoading(false);
    }
  };

  // Add a new job card
  const addJobCard = async (jobCardData) => {
    try {
      setLoading(true);
      setError("");

      // Check if it's FormData (for file upload) or regular object
      const isFormData = jobCardData instanceof FormData;

      let transformedData;
      let url = API_ENDPOINTS.createJobCard();

      if (isFormData) {
        // If it's FormData, we'll send it directly
        console.log("Adding job card with FormData (for images) at:", url);

        const res = await axios.post(url, jobCardData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        console.log("Add job card response with FormData:", res.data);

        if (!res.data) {
          throw new Error("No response from server");
        }

        const responseData = res.data.data || res.data;

        if (!responseData) {
          throw new Error("Invalid response structure");
        }

        // Create new job card from FormData response
        const customer =
          responseData.customer_id ||
          (jobCardData.get("customer_id")
            ? { _id: jobCardData.get("customer_id") }
            : {});
        const customerName =
          customer?.name ||
          customer?.customer_name ||
          jobCardData.get("customer_name") ||
          "Unknown Customer";

        const assignedTo = responseData.assigned_to || {
          _id: jobCardData.get("assigned_to"),
        };
        const assignedName =
          assignedTo?.name || assignedTo?.employee_name || "Unassigned";

        const newJobCard = {
          _id: responseData._id || responseData.id || `temp-${Date.now()}`,
          customer_id: customer,
          customer_name: customerName,
          customer_mobile: customer?.mobile || customer?.phone || "",
          customer_code: customer?.customer_code || "",
          job_card_date:
            responseData.job_card_date || jobCardData.get("job_card_date"),
          expected_delivery_date:
            responseData.expected_delivery_date ||
            jobCardData.get("expected_delivery_date"),
          delivery_date:
            responseData.delivery_date || jobCardData.get("delivery_date"),
          items:
            responseData.items || JSON.parse(jobCardData.get("items") || "[]"),
          status: responseData.status || jobCardData.get("status") || "pending",
          priority:
            responseData.priority || jobCardData.get("priority") || "medium",
          note: responseData.note || jobCardData.get("note") || "",
          instructions:
            responseData.instructions || jobCardData.get("instructions") || "",
          total_amount:
            responseData.total_amount ||
            parseFloat(jobCardData.get("total_amount") || 0),
          advance_amount:
            responseData.advance_amount ||
            parseFloat(jobCardData.get("advance_amount") || 0),
          balance_amount:
            responseData.balance_amount ||
            parseFloat(jobCardData.get("balance_amount") || 0),
          assigned_to: assignedTo,
          assigned_name: assignedName,
          // Include images from response if available
          images: responseData.images || [],
          // ADD QUOTATION INFO TO LOCAL STATE
          quotation_id:
            responseData.quotation_id ||
            jobCardData.get("quotation_id") ||
            null,
          quotation_number:
            responseData.quotation_number ||
            jobCardData.get("quotation_number") ||
            null,
          created_at:
            responseData.createdAt ||
            responseData.created_at ||
            new Date().toISOString(),
          updated_at:
            responseData.updatedAt ||
            responseData.updated_at ||
            new Date().toISOString(),
        };

        console.log("Created job card with FormData:", {
          hasImages: newJobCard.images?.length > 0,
          imageCount: newJobCard.images?.length || 0,
          quotation_id: newJobCard.quotation_id,
          quotation_number: newJobCard.quotation_number,
        });

        setJobCards((prev) => [newJobCard, ...prev]);

        setTimeout(() => {
          fetchJobCards();
        }, 1000);

        return newJobCard;
      } else {
        // Regular JSON data (no images or images already as Base64 strings)
        transformedData = {
          customer_id: jobCardData.customer_id,
          job_card_date: jobCardData.job_card_date,
          expected_delivery_date: jobCardData.expected_delivery_date,
          delivery_date: jobCardData.delivery_date,
          items: Array.isArray(jobCardData.items)
            ? jobCardData.items.map((item) => ({
                product_id: item.product_id,
                article_no: item.article_no || "",
                description: item.description || "",
                quantity: parseFloat(item.quantity) || 1,
                unit_price: parseFloat(item.unit_price) || 0,
                total_amount: parseFloat(item.total_amount) || 0,
                notes: item.notes || "",
              }))
            : [],
          note: jobCardData.note || "",
          instructions: jobCardData.instructions || "",
          priority: jobCardData.priority || "medium",
          status: jobCardData.status || "pending",
          total_amount: parseFloat(jobCardData.total_amount) || 0,
          advance_amount: parseFloat(jobCardData.advance_amount) || 0,
          balance_amount: parseFloat(jobCardData.balance_amount) || 0,
          assigned_to: jobCardData.assigned_to,
          // ADD IMAGES if they exist as Base64 strings
          ...(jobCardData.images &&
            jobCardData.images.length > 0 && {
              images: jobCardData.images,
            }),
          // ADD QUOTATION INFO
          quotation_id: jobCardData.quotation_id || null,
          quotation_number: jobCardData.quotation_number || null,
        };

        console.log("Adding job card at:", url, "Data:", transformedData);

        const res = await axios.post(url, transformedData);
        console.log("Add job card response:", res.data);

        if (!res.data) {
          throw new Error("No response from server");
        }

        const responseData = res.data.data || res.data;

        if (!responseData) {
          throw new Error("Invalid response structure");
        }

        const customer =
          responseData.customer_id || transformedData.customer_id;
        const customerName =
          customer?.name || customer?.customer_name || "Unknown Customer";

        const assignedTo =
          responseData.assigned_to || transformedData.assigned_to;
        const assignedName =
          assignedTo?.name || assignedTo?.employee_name || "Unassigned";

        // Create new job card with quotation info
        const newJobCard = {
          _id: responseData._id || responseData.id || `temp-${Date.now()}`,
          customer_id: customer,
          customer_name: customerName,
          customer_mobile: customer?.mobile || customer?.phone || "",
          customer_code: customer?.customer_code || "",
          job_card_date:
            responseData.job_card_date || transformedData.job_card_date,
          expected_delivery_date:
            responseData.expected_delivery_date ||
            transformedData.expected_delivery_date,
          delivery_date:
            responseData.delivery_date || transformedData.delivery_date,
          items: responseData.items || transformedData.items,
          status: responseData.status || transformedData.status,
          priority: responseData.priority || transformedData.priority,
          note: responseData.note || transformedData.note,
          instructions:
            responseData.instructions || transformedData.instructions,
          total_amount:
            responseData.total_amount || transformedData.total_amount,
          advance_amount:
            responseData.advance_amount || transformedData.advance_amount,
          balance_amount:
            responseData.balance_amount || transformedData.balance_amount,
          // Include images from response if available
          images: responseData.images || transformedData.images || [],
          assigned_to: assignedTo,
          assigned_name: assignedName,
          // ADD QUOTATION INFO TO LOCAL STATE
          quotation_id:
            responseData.quotation_id || transformedData.quotation_id,
          quotation_number:
            responseData.quotation_number || transformedData.quotation_number,
          created_at:
            responseData.createdAt ||
            responseData.created_at ||
            new Date().toISOString(),
          updated_at:
            responseData.updatedAt ||
            responseData.updated_at ||
            new Date().toISOString(),
        };

        console.log("Created job card with quotation info:", {
          hasImages: newJobCard.images?.length > 0,
          imageCount: newJobCard.images?.length || 0,
          quotation_id: newJobCard.quotation_id,
          quotation_number: newJobCard.quotation_number,
        });

        setJobCards((prev) => [newJobCard, ...prev]);

        setTimeout(() => {
          fetchJobCards();
        }, 1000);

        return newJobCard;
      }
    } catch (err) {
      console.error("Add job card error:", err);

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
        setError("Failed to add job card. Please try again.");
        throw err;
      }
    } finally {
      setLoading(false);
    }
  };

// Update a job card
const updateJobCard = async (id, jobCardData) => {
  try {
    setLoading(true);
    setError("");

    // Check if jobCardData is FormData (for image uploads)
    const isFormData = jobCardData instanceof FormData;
    
    // Prepare the URL
    const url = API_ENDPOINTS.updateJobCard(id);
    
    let transformedData;
    
    if (isFormData) {
      // For FormData, we need to handle it differently
      // Extract data from FormData for logging/debugging
      const formDataObj = {};
      for (let [key, value] of jobCardData.entries()) {
        formDataObj[key] = value;
      }
      console.log("Updating job card with FormData at:", url, "Data keys:", Object.keys(formDataObj));
      
      // Add _id to FormData if not already present
      if (!jobCardData.has('_id')) {
        jobCardData.append('_id', id);
      }
      
      transformedData = jobCardData;
    } else {
      // For regular JSON data (backward compatibility)
      transformedData = {
        ...jobCardData,
        // Ensure quotation info is included
        quotation_id: jobCardData.quotation_id || null,
        quotation_number: jobCardData.quotation_number || null,
      };
      console.log("Updating job card at:", url, "Data:", transformedData);
    }

    // Determine which HTTP method and headers to use
    const config = isFormData 
      ? {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      : {
          headers: {
            'Content-Type': 'application/json',
          },
        };

    const res = isFormData 
      ? await axios.put(url, transformedData, config)
      : await axios.put(url, transformedData, config);
      
    console.log("Update job card response:", res.data);

    if (res.data?.success) {
      const responseData = res.data.data || res.data;
      
      // Create updated data object
      const updatedData = {
        _id: responseData._id || responseData.id || id,
        customer_id: responseData.customer_id || 
                     (jobCardData instanceof FormData ? jobCardData.get('customer_id') : jobCardData.customer_id),
        job_card_date: responseData.job_card_date || 
                       (jobCardData instanceof FormData ? jobCardData.get('job_card_date') : jobCardData.job_card_date),
        expected_delivery_date: responseData.expected_delivery_date || 
                                (jobCardData instanceof FormData ? jobCardData.get('expected_delivery_date') : jobCardData.expected_delivery_date),
        delivery_date: responseData.delivery_date || 
                       (jobCardData instanceof FormData ? jobCardData.get('delivery_date') : jobCardData.delivery_date),
        items: responseData.items || 
               (jobCardData instanceof FormData ? JSON.parse(jobCardData.get('items') || '[]') : jobCardData.items || []),
        status: responseData.status || 
                (jobCardData instanceof FormData ? jobCardData.get('status') : jobCardData.status) || "pending",
        priority: responseData.priority || 
                  (jobCardData instanceof FormData ? jobCardData.get('priority') : jobCardData.priority) || "medium",
        note: responseData.note || 
              (jobCardData instanceof FormData ? jobCardData.get('note') : jobCardData.note),
        instructions: responseData.instructions || 
                      (jobCardData instanceof FormData ? jobCardData.get('instructions') : jobCardData.instructions),
        total_amount: responseData.total_amount || 
                      parseFloat(jobCardData instanceof FormData ? jobCardData.get('total_amount') : jobCardData.total_amount) || 0,
        advance_amount: responseData.advance_amount || 
                        parseFloat(jobCardData instanceof FormData ? jobCardData.get('advance_amount') : jobCardData.advance_amount) || 0,
        balance_amount: responseData.balance_amount || 
                        parseFloat(jobCardData instanceof FormData ? jobCardData.get('balance_amount') : jobCardData.balance_amount) || 0,
        assigned_to: responseData.assigned_to || 
                     (jobCardData instanceof FormData ? jobCardData.get('assigned_to') : jobCardData.assigned_to),
        quotation_id: responseData.quotation_id || 
                      (jobCardData instanceof FormData ? jobCardData.get('quotation_id') : jobCardData.quotation_id),
        quotation_number: responseData.quotation_number || 
                          (jobCardData instanceof FormData ? jobCardData.get('quotation_number') : jobCardData.quotation_number),
        // Handle images
        images: responseData.images || [],
      };

      console.log("Updated job card with quotation and images:", {
        id: updatedData._id,
        quotation_id: updatedData.quotation_id,
        quotation_number: updatedData.quotation_number,
        imageCount: updatedData.images?.length || 0,
      });

      // Update local state
      setJobCards((prev) =>
        prev.map((item) => (item._id === id ? updatedData : item))
      );

      // Refresh the list after a short delay
      setTimeout(() => {
        fetchJobCards();
      }, 500);

      return updatedData;
    } else {
      throw new Error(res.data?.message || "Failed to update job card");
    }
  } catch (err) {
    console.error("Update job card error:", err);
    
    // More specific error handling
    if (err.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error("Response data:", err.response.data);
      console.error("Response status:", err.response.status);
      console.error("Response headers:", err.response.headers);
      
      if (err.response.status === 400) {
        setError("Bad request. Please check the data you entered.");
      } else if (err.response.status === 404) {
        setError("Job card not found.");
      } else if (err.response.status === 413) {
        setError("File too large. Please reduce image size.");
      } else if (err.response.status === 415) {
        setError("Unsupported media type. Please use valid image formats.");
      } else {
        setError(err.response.data?.message || "Failed to update job card");
      }
    } else if (err.request) {
      // The request was made but no response was received
      console.error("No response received:", err.request);
      setError("No response from server. Please check your connection.");
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Error:", err.message);
      setError("Failed to update job card: " + err.message);
    }
    
    throw err;
  } finally {
    setLoading(false);
  }
};

  // Delete a job card
  const deleteJobCard = async (id) => {
    try {
      setLoading(true);
      setError("");

      const url = API_ENDPOINTS.deleteJobCard(id);
      console.log("Deleting job card at:", url);

      const res = await axios.delete(url);
      console.log("Delete response:", res.data);

      if (res.data?.success) {
        setJobCards((prev) => prev.filter((item) => item._id !== id));
      } else {
        throw new Error(res.data?.message || "Failed to delete job card");
      }

      return res.data;
    } catch (err) {
      console.error("Delete job card error:", err);
      setError("Failed to delete job card");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update job card status
  const updateJobCardStatus = async (id, status) => {
    try {
      setLoading(true);
      setError("");

      const url = API_ENDPOINTS.updateJobCardStatus(id);
      const res = await axios.put(url, { status });

      if (res.data?.success) {
        setJobCards((prev) =>
          prev.map((jobCard) =>
            jobCard._id === id ? { ...jobCard, status } : jobCard
          )
        );
        return res.data;
      } else {
        throw new Error(res.data?.message || "Failed to update status");
      }
    } catch (err) {
      console.error("Update status error:", err);
      setError("Failed to update status");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Convert job card to sale
  const convertToSale = async (jobCardId) => {
    try {
      setLoading(true);
      setError("");

      const url = API_ENDPOINTS.convertJobCardToSale(jobCardId);
      console.log("Converting job card to sale:", url);

      const res = await axios.post(url);
      console.log("Convert to sale response:", res.data);

      if (res.data?.success) {
        setJobCards((prev) =>
          prev.map((jobCard) =>
            jobCard._id === jobCardId
              ? { ...jobCard, status: "completed", converted_to_sale: true }
              : jobCard
          )
        );

        return res.data;
      } else {
        throw new Error(res.data?.message || "Failed to convert job card");
      }
    } catch (err) {
      console.error("Convert to sale error:", err);
      setError("Failed to convert job card to sale");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Initialize data on mount
  useEffect(() => {
    const initializeData = async () => {
      await Promise.all([
        fetchEmployees(),
        fetchAllQuotations(), // Load quotations once on mount
        fetchProducts(), // Load products once on mount
      ]);
    };

    initializeData();
  }, [fetchAllQuotations, fetchProducts]);

  // Fetch job cards on mount
  useEffect(() => {
    fetchJobCards();
  }, []);

  return {
    // Data
    jobCards,
    employees,
    quotations: allQuotations, // Return allQuotations as quotations
    allQuotations,
    products, // Add products to return
    loadingProducts, // Add loadingProducts to return

    // Loading states
    loading,
    loadingEmployees,
    loadingQuotations,

    // Error
    error,

    // Functions
    fetchJobCards,
    fetchEmployees,
    fetchQuotations: fetchAllQuotations, // Simple function without searchParams
    fetchProducts, // Add fetchProducts to return
    addJobCard,
    updateJobCard,
    deleteJobCard,
    updateJobCardStatus,
    convertToSale,
  };
}
