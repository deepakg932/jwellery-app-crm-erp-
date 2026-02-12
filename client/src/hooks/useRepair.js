// hooks/useRepair.js
import { useState, useEffect } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "@/api/api";

export default function useRepair() {
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [customerGroups, setCustomerGroups] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [saleItems, setSaleItems] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [loadingSaleItems, setLoadingSaleItems] = useState(false);
  const [loadingRepairs, setLoadingRepairs] = useState(false);

  // Status options for repair
  const statusOptions = [
    { value: "pending", label: "Pending" },
    { value: "received", label: "Received" },
    { value: "in_progress", label: "In Progress" },
    { value: "ready_for_delivery", label: "Ready for Delivery" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
  ];

  // Account options
  const accountOptions = [
    { value: "cash", label: "Cash" },
    { value: "card", label: "Card" },
    { value: "upi", label: "UPI" },
    { value: "bank_transfer", label: "Bank Transfer" },
    { value: "credit", label: "Credit" },
    { value: "multiple", label: "Multiple Payment" },
  ];

  // Fetch sale items with proper extraction from nested structure
  const fetchSaleItems = async () => {
    try {
      setLoadingSaleItems(true);
      const res = await axios.get(API_ENDPOINTS.getSaleItems());
      console.log("Sale Items API Response:", res.data);

      let itemsData = [];

      if (res.data?.success && Array.isArray(res.data.data)) {
        // Extract all items from sales
        res.data.data.forEach((sale) => {
          if (sale.items && Array.isArray(sale.items)) {
            sale.items.forEach((item) => {
              // Create a unique item object with sale info
              const saleItem = {
                _id: item._id || `${sale._id}_${item.product_id}`,
                product_id: item.product_id,
                product_name: item.product_name,
                product_code: item.product_code,
                sale_id: sale._id,
                sale_reference_no: sale.reference_no,
                sale_date: sale.sale_date,
                invoice_number: sale.invoice_number,
                customer_name:
                  sale.customer_id?.name ||
                  sale.customer_id?.customer_name ||
                  "Walk-in Customer",
                customer_id: sale.customer_id?._id || sale.customer_id,
                quantity: item.quantity,
                price: item.selling_total || item.final_total,
                // Add any other fields you need
              };
              itemsData.push(saleItem);
            });
          }
        });
      } else if (Array.isArray(res.data)) {
        // Handle different response structure
        res.data.forEach((sale) => {
          if (sale.items && Array.isArray(sale.items)) {
            sale.items.forEach((item) => {
              const saleItem = {
                _id: item._id || `${sale._id}_${item.product_id}`,
                product_id: item.product_id,
                product_name: item.product_name,
                product_code: item.product_code,
                sale_id: sale._id,
                sale_reference_no: sale.reference_no,
                sale_date: sale.sale_date,
                customer_name: sale.customer_id?.name || "Unknown",
                customer_id: sale.customer_id,
                quantity: item.quantity,
                price: item.selling_total || item.price,
              };
              itemsData.push(saleItem);
            });
          }
        });
      }

      console.log("Processed Sale Items for repair:", itemsData);
      setSaleItems(itemsData);
      return itemsData;
    } catch (err) {
      console.error("Error fetching sale items:", err);
      setError("Failed to load sale items");
      return [];
    } finally {
      setLoadingSaleItems(false);
    }
  };

  // Fetch customer groups
  const fetchCustomerGroups = async () => {
    try {
      const res = await axios.get(API_ENDPOINTS.getCustomerGroups());
      let groupsData = [];

      if (res.data?.data && Array.isArray(res.data.data)) {
        groupsData = res.data.data;
      } else if (res.data?.fetched && Array.isArray(res.data.fetched)) {
        groupsData = res.data.fetched;
      } else if (Array.isArray(res.data)) {
        groupsData = res.data;
      }

      const mappedGroups = groupsData.map((group) => ({
        _id: group._id || group.id,
        customer_group: group.customer_group || group.name || "",
        status: group.status || "active",
      }));

      setCustomerGroups(mappedGroups);
      return mappedGroups;
    } catch (err) {
      console.error("Fetch customer groups error:", err);
      return [];
    }
  };

  // Fetch customers
  const fetchCustomers = async () => {
    try {
      setLoadingCustomers(true);
      const res = await axios.get(API_ENDPOINTS.getCustomers());
      let customersData = [];

      if (res.data?.success && Array.isArray(res.data.data)) {
        customersData = res.data.data;
      } else if (Array.isArray(res.data)) {
        customersData = res.data;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        customersData = res.data.data;
      }

      console.log("Customers for repair:", customersData);
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

  // Fetch employees
  const fetchEmployees = async () => {
    try {
      setLoadingEmployees(true);
      const res = await axios.get(API_ENDPOINTS.getEmployees());
      let employeesData = [];

      if (res.data?.success && Array.isArray(res.data.data)) {
        employeesData = res.data.data;
      } else if (Array.isArray(res.data)) {
        employeesData = res.data;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        employeesData = res.data.data;
      }

      console.log("Employees for repair:", employeesData);
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

  // Fetch all repair quotations - using specific repair endpoint

const fetchRepairs = async () => {
  try {
    setLoadingRepairs(true);
    setError("");

    let url = API_ENDPOINTS.getRepairs();

    console.log("Fetching repairs from:", url);

    const res = await axios.get(url);
    console.log("Repairs API Response:", res.data);

    let repairsData = [];

    // Extract repairs data from response based on your API structure
    if (res.data?.success && Array.isArray(res.data.data)) {
      repairsData = res.data.data;
    } else if (Array.isArray(res.data)) {
      repairsData = res.data;
    } else if (res.data?.data && Array.isArray(res.data.data)) {
      repairsData = res.data.data;
    }

    // Map to repair format according to your response
    const mappedRepairs = repairsData.map((repair) => {
      const customer = repair.customer_id || {};
      const employee = repair.employee_id || {};
      const invoice = repair.invoice || {};

      // Get repair images - handle both array of strings and array of objects
      let repairImages = [];
      if (repair.repair_images && Array.isArray(repair.repair_images)) {
        repairImages = repair.repair_images.map(img => {
          if (typeof img === 'string') {
            return {
              url: img,
              filename: img.split('/').pop() || 'repair_image',
              isExisting: true
            };
          } else if (typeof img === 'object') {
            return {
              url: img.url || img,
              filename: img.filename || img.originalname || 'repair_image',
              mimetype: img.mimetype,
              size: img.size,
              isExisting: true,
              _id: img._id || img.id
            };
          }
          return img;
        });
      }

      // Calculate due amount - use repair.due_amount from response
      const repairCharge = parseFloat(repair.repair_charge) || 0;
      const paidAmount = parseFloat(repair.paid_amount) || 0;
      const dueAmount = repair.due_amount || invoice.due_amount || repairCharge - paidAmount;

      return {
        _id: repair._id || repair.id,
        repair_number: repair.repair_number || `RP-${repair._id?.slice(-6) || Date.now()}`,
        product_name: repair.product_name || "Unnamed Product",
        product_module: repair.product_module || "",
        problem_description: repair.problem_description || repair.note || "",
        repair_charge: repairCharge,
        paid_amount: paidAmount,
        due_amount: parseFloat(dueAmount) > 0 ? parseFloat(dueAmount) : 0,
        customer_id: customer._id || customer,
        customer_name: customer.name || "Unknown Customer",
        customer_mobile: customer.mobile || "",
        customer_email: customer.email || "",
        customer_address: customer.address || "",
        delivery_date: repair.delivery_date || null,
        receiving_date: repair.receiving_date || repair.createdAt || new Date().toISOString(),
        employee_id: employee._id || employee,
        employee_name: employee.name || "",
        employee_designation: employee.designation || "",
        status: repair.status || "pending",
        account: repair.account || "cash",
        note: repair.note || "",
        product_type: repair.product_type || (repair.product_id ? "existing" : "manual"),
        product_id: repair.product_id || null,
        product_code: repair.product_code || "",
        is_custom_product: repair.is_custom_product || false,
        
        // Images data
        repair_images: repairImages,
        
        // Sale item reference
        sale_item_id: repair.sale_item_id,
        
        // Invoice data
        invoice_id: invoice._id,
        invoice_number: invoice.invoice_number || "",
        invoice_total_amount: invoice.total_amount || repairCharge,
        
        // Payment status - use payment_status from repair or invoice
        payment_status: repair.payment_status || invoice.payment_status || "unpaid",
        
        // Dates
        created_at: repair.createdAt || repair.created_at || new Date().toISOString(),
        updated_at: repair.updatedAt || repair.updated_at || new Date().toISOString(),
        
        // Additional fields from your response
        __v: repair.__v || 0,
        id: repair.id || repair._id,
        
        // Calculate status badge class
        status_class: repair.status === "pending" ? "bg-warning" :
                     repair.status === "in_progress" ? "bg-primary" :
                     repair.status === "ready_for_delivery" ? "bg-info" :
                     repair.status === "delivered" ? "bg-success" :
                     repair.status === "cancelled" ? "bg-danger" : "bg-secondary",
        
        // Format dates for display
        formatted_receiving_date: repair.receiving_date ? 
          new Date(repair.receiving_date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          }) : "",
        
        formatted_delivery_date: repair.delivery_date ? 
          new Date(repair.delivery_date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          }) : "",
        
        formatted_created_at: repair.createdAt ? 
          new Date(repair.createdAt).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }) : "",
        
        // Payment status badge
        payment_status_class: (repair.payment_status || invoice.payment_status) === "paid" ? "bg-success" :
                             (repair.payment_status || invoice.payment_status) === "partial" ? "bg-warning" :
                             "bg-danger",
        
        // Payment status text
        payment_status_text: (repair.payment_status || invoice.payment_status) === "paid" ? "Paid" :
                            (repair.payment_status || invoice.payment_status) === "partial" ? "Partial" :
                            "Unpaid"
      };
    });

    console.log("Mapped repairs with images and invoice:", mappedRepairs);
    setRepairs(mappedRepairs);
    return mappedRepairs;
  } catch (err) {
    console.error("Fetch repairs error:", err);

    if (err.response) {
      const errorMessage =
        err.response.data?.message || `Server error: ${err.response.status}`;
      setError(errorMessage);
    } else if (err.request) {
      setError("Network error. Please check your connection.");
    } else {
      setError("Failed to load repairs. Please try again.");
    }

    setRepairs([]);
    return [];
  } finally {
    setLoadingRepairs(false);
  }
};

  // Add a new customer
  const addCustomer = async (customerData) => {
    try {
      setLoading(true);
      setError("");

      const url = API_ENDPOINTS.createCustomer();

      // Format data for API
      const apiData = {
        ...customerData,
        name: customerData.name || customerData.customer_name || "",
        mobile: customerData.mobile || "",
        customer_group_id: customerData.customer_group_id,
        status: customerData.status ? "active" : "inactive",
      };

      console.log("Adding customer from repair form:", apiData);

      const res = await axios.post(url, apiData);
      console.log("Add customer response:", res.data);

      if (res.data?.success && res.data.data) {
        const responseData = res.data.data;

        const newCustomer = {
          _id: responseData._id,
          name: responseData.name || customerData.name || "",
          customer_group_id:
            responseData.customer_group_id || customerData.customer_group_id,
          mobile: responseData.mobile || customerData.mobile || "",
          email: responseData.email || customerData.email || "",
          address: responseData.address || customerData.address || "",
          city: responseData.city || customerData.city || "",
          state: responseData.state || customerData.state || "",
          country: responseData.country || customerData.country || "",
          pincode: responseData.pincode || customerData.pincode || "",
          status: responseData.status === "active",
          createdAt: responseData.createdAt || new Date().toISOString(),
        };

        // Update customers list
        setCustomers((prev) => [...prev, newCustomer]);

        // Refetch customers to ensure consistency
        setTimeout(() => {
          fetchCustomers();
        }, 500);

        return newCustomer;
      } else {
        throw new Error(res.data?.message || "Failed to add customer");
      }
    } catch (err) {
      console.error("Add customer error:", err);
      setError(err.response?.data?.message || "Failed to add customer");
      throw err;
    } finally {
      setLoading(false);
    }
  };


const addRepair = async (repairData) => {
  try {
    setLoading(true);
    setError("");

    // Create FormData to handle file uploads
    const formData = new FormData();

    // Add all form fields
    formData.append('repair_type', 'repair');
    formData.append('product_name', repairData.product_name);
    formData.append('product_module', repairData.product_module || '');
    formData.append('problem_description', repairData.problem_description);
    formData.append('repair_charge', parseFloat(repairData.repair_charge) || 0);
    formData.append('paid_amount', parseFloat(repairData.paid_amount) || 0);
    formData.append('due_amount', parseFloat(repairData.due_amount) || 0);
    formData.append('customer_id', repairData.customer_id);
    formData.append('delivery_date', repairData.delivery_date || '');
    formData.append('receiving_date', repairData.receiving_date || new Date().toISOString());
    formData.append('employee_id', repairData.employee_id);
    formData.append('status', repairData.status || 'pending');
    formData.append('account', repairData.account || 'cash');
    formData.append('note', repairData.note || '');
    formData.append('product_type', repairData.product_type || 'manual');
    formData.append('product_id', repairData.product_id || '');
    formData.append('product_code', repairData.product_code || '');
    formData.append('is_custom_product', repairData.is_custom_product || false);
    formData.append('sale_item_id', repairData.sale_item_id || '');

    // Add images if present
    if (repairData.repair_images && repairData.repair_images.length > 0) {
      repairData.repair_images.forEach((file, index) => {
        formData.append('repair_images', file);
      });
    }

    console.log("Adding repair with images:", repairData.repair_images?.length || 0, "images");

    // Use createRepair endpoint if available, otherwise use quotation
    let url =  API_ENDPOINTS.createRepair()
  

    const res = await axios.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log("Add repair response:", res.data);

    if (res.data?.success) {
      const newRepair = res.data.data || res.data;

      // Fetch updated list
      await fetchRepairs();
      return newRepair;
    } else {
      throw new Error(res.data?.message || "Failed to add repair");
    }
  } catch (err) {
    console.error("Add repair error:", err);

    if (err.response) {
      const errorMessage =
        err.response.data?.message || `Server error: ${err.response.status}`;
      setError(errorMessage);
      throw new Error(errorMessage);
    } else if (err.request) {
      setError("Network error. Please check your connection.");
      throw new Error("Network error");
    } else {
      setError("Failed to add repair. Please try again.");
      throw err;
    }
  } finally {
    setLoading(false);
  }
};

  // Update a repair

const updateRepair = async (id, repairData) => {
  try {
    setLoading(true);
    setError("");

    // Check if there are new images to upload
    const hasNewImages = repairData.repair_images && repairData.repair_images.length > 0;

    // If there are new images or deleted images, use FormData
    if (hasNewImages) {
      const formData = new FormData();

      // Add all basic form fields
      formData.append('product_name', repairData.product_name);
      formData.append('product_module', repairData.product_module || '');
      formData.append('problem_description', repairData.problem_description);
      formData.append('repair_charge', parseFloat(repairData.repair_charge) || 0);
      formData.append('paid_amount', parseFloat(repairData.paid_amount) || 0);
      formData.append('due_amount', parseFloat(repairData.due_amount) || 0);
      formData.append('customer_id', repairData.customer_id);
      formData.append('delivery_date', repairData.delivery_date || '');
      formData.append('receiving_date', repairData.receiving_date);
      formData.append('employee_id', repairData.employee_id);
      formData.append('status', repairData.status);
      formData.append('account', repairData.account);
      formData.append('note', repairData.note || '');
      formData.append('product_type', repairData.product_type || 'manual');
      formData.append('product_id', repairData.product_id || '');
      formData.append('product_code', repairData.product_code || '');
      formData.append('is_custom_product', repairData.is_custom_product || false);
      formData.append('sale_item_id', repairData.sale_item_id || '');

      // Add new images if present
      if (hasNewImages) {
        repairData.repair_images.forEach((file, index) => {
          formData.append('repair_images', file);
        });
      }

      const url = API_ENDPOINTS.updateRepair(id);
      
      const res = await axios.put(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log("Update repair with images response:", res.data);

      if (res.data?.success) {
        await fetchRepairs();
        return res.data.data || res.data;
      } else {
        throw new Error(res.data?.message || "Failed to update repair");
      }
    } else {
      // No images to upload, use regular JSON
      const transformedData = {
        product_name: repairData.product_name,
        product_module: repairData.product_module,
        problem_description: repairData.problem_description,
        repair_charge: parseFloat(repairData.repair_charge) || 0,
        paid_amount: parseFloat(repairData.paid_amount) || 0,
        due_amount: parseFloat(repairData.due_amount) || 0,
        customer_id: repairData.customer_id,
        delivery_date: repairData.delivery_date,
        receiving_date: repairData.receiving_date,
        employee_id: repairData.employee_id,
        status: repairData.status,
        account: repairData.account,
        note: repairData.note,
        product_type: repairData.product_type,
        product_id: repairData.product_id,
        product_code: repairData.product_code,
        is_custom_product: repairData.is_custom_product,
        sale_item_id: repairData.sale_item_id || null,
      };

      console.log("Updating repair without images:", id, transformedData);

      const url = API_ENDPOINTS.updateRepair(id);
      
      const res = await axios.put(url, transformedData);
      console.log("Update repair response:", res.data);

      if (res.data?.success) {
        await fetchRepairs();
        return res.data.data || res.data;
      } else {
        throw new Error(res.data?.message || "Failed to update repair");
      }
    }
  } catch (err) {
    console.error("Update repair error:", err);
    
    if (err.response) {
      const errorMessage =
        err.response.data?.message || `Server error: ${err.response.status}`;
      setError(errorMessage);
      throw new Error(errorMessage);
    } else if (err.request) {
      setError("Network error. Please check your connection.");
      throw new Error("Network error");
    } else {
      setError("Failed to update repair. Please try again.");
      throw err;
    }
  } finally {
    setLoading(false);
  }
};

  // Delete a repair
  const deleteRepair = async (id) => {
    try {
      setLoading(true);
      setError("");

      // Use deleteRepair endpoint if available, otherwise use quotation
      let url = API_ENDPOINTS.deleteRepair(id)
   
      console.log("Deleting repair:", url);

      const res = await axios.delete(url);
      console.log("Delete repair response:", res.data);

      if (res.data?.success) {
        setRepairs((prev) => prev.filter((item) => item._id !== id));
        return res.data;
      } else {
        throw new Error(res.data?.message || "Failed to delete repair");
      }
    } catch (err) {
      console.error("Delete repair error:", err);
      setError("Failed to delete repair");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update payment for a repair
  const updateRepairPayment = async (id, paymentData) => {
    try {
      setLoading(true);
      setError("");

      const url = `${API_ENDPOINTS.updateQuotation(id)}/payment`;
      console.log("Updating repair payment:", url, paymentData);

      const res = await axios.put(url, paymentData);
      console.log("Update payment response:", res.data);

      if (res.data?.success) {
        await fetchRepairs();
        return res.data.data || res.data;
      } else {
        throw new Error(res.data?.message || "Failed to update payment");
      }
    } catch (err) {
      console.error("Update payment error:", err);
      setError("Failed to update payment");
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
        fetchEmployees(),
        fetchSaleItems(),
        fetchCustomerGroups(),
      ]);
    };

    initializeData();
  }, []);

  // Fetch repairs on mount
  useEffect(() => {
    fetchRepairs();
  }, []);

  return {
    // Data
    repairs,
    customerGroups,
    customers,
    employees,
    saleItems,

    // Options
    statusOptions,
    accountOptions,

    // Loading states
    loading,
    loadingCustomers,
    loadingEmployees,
    loadingRepairs,
    loadingSaleItems,

    // Error
    error,

    // Functions
    fetchCustomerGroups,
    fetchRepairs,
    fetchCustomers,
    fetchEmployees,
    fetchSaleItems,
    addCustomer,
    addRepair,
    updateRepair,
    deleteRepair,
    updateRepairPayment,
  };
}
