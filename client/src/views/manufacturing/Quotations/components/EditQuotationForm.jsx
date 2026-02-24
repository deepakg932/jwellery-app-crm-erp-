// components/quotations/EditQuotationForm.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  FiUpload,
  FiTrash2,
  FiSearch,
  FiX,
  FiPlus,
  FiInfo,
  FiCalendar,
  FiFileText,
  FiDollarSign,
  FiPercent,
  FiPackage,
  FiSave,
} from "react-icons/fi";
import useQuotations from "@/hooks/useQuotations";

const EditQuotationForm = ({ quotation, onClose, onSave, loading = false }) => {
  const {
    customers,
    items,
    branches,
    loadingCustomers,
    loadingItems,
    loadingBranches,
  } = useQuotations();

  console.log("Quotation data received:", quotation);

  const [formData, setFormData] = useState({
    customer_id: "",
    quotation_date: new Date().toISOString().split("T")[0],
    expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    items: [
      {
        product_id: "",
        product_code: "",
        product_name: "",
        quantity: "1",
        unit_price: 0,
        discount: 0,
        tax_rate: 18,
        tax_amount: 0,
        net_price: 0,
        subtotal: 0,
      },
    ],
    note: "",
    terms_conditions: "",
    shipping_cost: 0,
    discount: 0,
    tax_amount: 0,
    subtotal: 0,
    total_amount: 0,
    grand_total: 0,
    branch_id: "",
    status: "draft",
    valid_days: 30,
  });

  const [errors, setErrors] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef(null);
  const [needsRecalculation, setNeedsRecalculation] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Status options
  const statusOptions = [
    { value: "draft", label: "Draft" },
    { value: "sent", label: "Sent" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
    { value: "expired", label: "Expired" },
    { value: "converted", label: "Converted to Order" },
  ];

  // Initialize form with quotation data
  useEffect(() => {
    if (quotation && !isInitialized) {
      console.log("Initializing form with quotation:", quotation);

      // Extract customer ID (it might be an object with _id)
      const customerId =
        quotation.customer_id?._id || quotation.customer_id || "";


        

      // // Extract branch ID (it might be an object with _id)
      // const branchId = quotation.branch_id?._id || quotation.branch_id || "";

let branchId = "";
    if (quotation.branch_id) {
      if (typeof quotation.branch_id === 'object' && quotation.branch_id._id) {
        branchId = quotation.branch_id._id; // Extract just the ID from object
      } else if (typeof quotation.branch_id === 'string') {
        branchId = quotation.branch_id;
      }
    }
    console.log("Extracted branch ID:", branchId);

    console.log("Extracted branch ID:", branchId);
      // Format dates from API response
      const formatDateForInput = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toISOString().split("T")[0];
      };

      const quotationDate = formatDateForInput(quotation.quotation_date);
      const expiryDate = formatDateForInput(quotation.expiry_date);

      // Process items
      const processedItems =
        quotation.items && quotation.items.length > 0
          ? quotation.items.map((item) => ({
              product_id: item.product_id || "",
              product_code: item.product_code || "",
              product_name: item.product_name || "",
              quantity: item.quantity?.toString() || "1",
              unit_price: item.unit_price || 0,
              discount: item.discount || 0,
              tax_rate: item.tax_rate || 18,
              tax_amount: item.tax_amount || 0,
              net_price: item.net_price || 0,
              subtotal: item.subtotal || 0,
            }))
          : [
              {
                product_id: "",
                product_code: "",
                product_name: "",
                quantity: "1",
                unit_price: 0,
                discount: 0,
                tax_rate: 18,
                tax_amount: 0,
                net_price: 0,
                subtotal: 0,
              },
            ];

      const initialFormData = {
        customer_id: customerId,
        quotation_date: quotationDate || new Date().toISOString().split("T")[0],
        expiry_date:
          expiryDate ||
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
        items: processedItems,
        note: quotation.note || "",
        terms_conditions: quotation.terms_conditions || "",
        shipping_cost: quotation.shipping_cost || 0,
        discount: quotation.discount || 0,
        tax_amount: quotation.tax_amount || 0,
        subtotal: quotation.subtotal || 0,
        total_amount: quotation.total_amount || 0,
        grand_total: quotation.grand_total || 0,
          branch_id: branchId, // Use the extracted branch ID
        // branch_id: branchId,
        status: quotation.status || "draft",
        valid_days: quotation.valid_days || 30,
      };

      console.log("Initial form data:", initialFormData);
      setFormData(initialFormData);
      setIsInitialized(true);

      // Trigger calculation after data is loaded
      setTimeout(() => setNeedsRecalculation(true), 100);
    }
  }, [quotation, isInitialized]);

  // Helper function to extract product display info
  const getProductDisplayInfo = (product) => {
    if (!product) return { name: "", code: "", unit_price: 0, tax_rate: 18 };

    return {
      name: product.product_name || product.name || "Unnamed Product",
      code: product.product_code || product.code || "",
      unit_price: product.selling_price || product.unit_price || 0,
      tax_rate: product.tax_rate || product.gst_rate || 18,
      description: product.description || "",
      category: product.product_category || product.category?.name,
      brand: product.product_brand || product.brand?.name,
      stock: product.quantity || product.stock_quantity || 0,
      image: product.images?.[0] || null,
    };
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.customer_id) {
      newErrors.customer_id = "Customer is required";
    }

    if (!formData.quotation_date) {
      newErrors.quotation_date = "Quotation date is required";
    }

    if (!formData.expiry_date) {
      newErrors.expiry_date = "Expiry date is required";
    } else if (
      new Date(formData.expiry_date) < new Date(formData.quotation_date)
    ) {
      newErrors.expiry_date = "Expiry date must be after quotation date";
    }

    if (!formData.branch_id) {
      newErrors.branch_id = "Branch is required";
    }

    // Validate items
    const selectedItems = formData.items.filter((item) => item.product_id);
    if (selectedItems.length === 0) {
      newErrors.items = "At least one item is required";
    }

    selectedItems.forEach((item, index) => {
      const originalIndex = formData.items.findIndex(
        (i) => i.product_id === item.product_id
      );

      const quantity = parseFloat(item.quantity);
      if (!item.quantity || isNaN(quantity) || quantity <= 0) {
        newErrors[`items[${originalIndex}].quantity`] =
          "Valid quantity is required";
      }

      const unitPrice = parseFloat(item.unit_price);
      if (isNaN(unitPrice) || unitPrice < 0) {
        newErrors[`items[${originalIndex}].unit_price`] =
          "Valid unit price is required";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Calculate item totals
  const calculateItemTotal = (item) => {
    const quantity = parseFloat(item.quantity) || 0;
    const unitPrice = parseFloat(item.unit_price) || 0;
    const itemDiscount = parseFloat(item.discount) || 0;
    const taxRate = parseFloat(item.tax_rate) || 0;

    const subtotalBeforeDiscount = unitPrice * quantity;
    const discountAmount = itemDiscount;
    const subtotalAfterDiscount = subtotalBeforeDiscount - discountAmount;
    const taxAmount = (subtotalAfterDiscount * taxRate) / 100;
    const netPrice = subtotalAfterDiscount + taxAmount;

    return {
      subtotal: netPrice,
      tax_amount: taxAmount,
      net_price: netPrice,
    };
  };

  // Calculate all totals
  const calculateTotals = () => {
    const itemsCalculated = formData.items
      .filter((item) => item.product_id)
      .map((item) => {
        const calculated = calculateItemTotal(item);
        return { ...item, ...calculated };
      });

    const itemSubtotal = itemsCalculated.reduce(
      (total, item) => total + (item.subtotal || 0),
      0
    );

    const itemTaxTotal = itemsCalculated.reduce(
      (total, item) => total + (item.tax_amount || 0),
      0
    );

    const shippingCost = parseFloat(formData.shipping_cost) || 0;
    const additionalDiscount = parseFloat(formData.discount) || 0;

    const subtotal = itemSubtotal;
    const totalTax = itemTaxTotal;
    const grandTotal = subtotal + shippingCost - additionalDiscount;

    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item) => {
        const calculatedItem = itemsCalculated.find(
          (calc) => calc.product_id === item.product_id
        );
        return calculatedItem ? calculatedItem : item;
      }),
      subtotal: subtotal,
      tax_amount: totalTax,
      total_amount: grandTotal > 0 ? grandTotal : 0,
      grand_total: grandTotal > 0 ? grandTotal : 0,
    }));
  };

  // Handle search input
  const handleSearch = (query) => {
    setSearchQuery(query);

    if (query.trim() === "") {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const selectedProductIds = formData.items
      .filter((item) => item.product_id)
      .map((item) => item.product_id);

    const results = items.filter((product) => {
      const displayInfo = getProductDisplayInfo(product);
      return (
        ((displayInfo.name &&
          displayInfo.name.toLowerCase().includes(query.toLowerCase())) ||
          (displayInfo.code &&
            displayInfo.code.toLowerCase().includes(query.toLowerCase())) ||
          (product.product_code &&
            product.product_code
              .toLowerCase()
              .includes(query.toLowerCase()))) &&
        !selectedProductIds.includes(product._id)
      );
    });

    setSearchResults(results.slice(0, 10));
    setShowSearchResults(true);
  };

  // Handle product selection
  const handleProductSelect = (product) => {
    let itemIndex = formData.items.findIndex((item) => !item.product_id);

    if (itemIndex === -1) {
      itemIndex = formData.items.length;
      setFormData((prev) => ({
        ...prev,
        items: [
          ...prev.items,
          {
            product_id: "",
            product_code: "",
            product_name: "",
            quantity: "1",
            unit_price: 0,
            discount: 0,
            tax_rate: 18,
            tax_amount: 0,
            net_price: 0,
            subtotal: 0,
          },
        ],
      }));
    }

    const displayInfo = getProductDisplayInfo(product);

    const updatedItems = [...formData.items];
    updatedItems[itemIndex] = {
      ...updatedItems[itemIndex],
      product_id: product._id,
      product_code: displayInfo.code,
      product_name: displayInfo.name,
      unit_price: displayInfo.unit_price,
      tax_rate: displayInfo.tax_rate,
    };

    setFormData((prev) => ({
      ...prev,
      items: updatedItems,
    }));

    setSearchQuery("");
    setShowSearchResults(false);
    setSearchResults([]);

    // Recalculate after product selection
    setTimeout(calculateTotals, 0);
  };

  // Simple handleChange for form fields
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error if exists
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // Mark for recalculation if it's a field that affects totals
    if (name === "shipping_cost" || name === "discount") {
      setNeedsRecalculation(true);
    }
  };

  // Handle item field changes
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    };

    setFormData((prev) => ({
      ...prev,
      items: updatedItems,
    }));

    // Mark for recalculation
    setNeedsRecalculation(true);
  };

  // Handle item changes with immediate calculation for better UX
  const handleItemChangeWithCalculation = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    };

    if (["quantity", "unit_price", "discount", "tax_rate"].includes(field)) {
      const item = updatedItems[index];

      if (item.product_id) {
        const calculated = calculateItemTotal(item);

        updatedItems[index] = {
          ...updatedItems[index],
          subtotal: calculated.subtotal,
          tax_amount: calculated.tax_amount,
          net_price: calculated.net_price,
        };
      }
    }

    setFormData((prev) => ({
      ...prev,
      items: updatedItems,
    }));
  };

  // Remove item row
  const removeItem = (index) => {
    if (formData.items.length > 1) {
      const updatedItems = formData.items.filter((_, i) => i !== index);
      setFormData((prev) => ({
        ...prev,
        items: updatedItems,
      }));

      setNeedsRecalculation(true);
    }
  };

  // Clear item data
  const clearItem = (index) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = {
      product_id: "",
      product_code: "",
      product_name: "",
      quantity: "1",
      unit_price: 0,
      discount: 0,
      tax_rate: 18,
      tax_amount: 0,
      net_price: 0,
      subtotal: 0,
    };

    setFormData((prev) => ({
      ...prev,
      items: updatedItems,
    }));

    setNeedsRecalculation(true);
  };

  // Add new empty item row
  const addNewItemRow = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          product_id: "",
          product_code: "",
          product_name: "",
          quantity: "1",
          unit_price: 0,
          discount: 0,
          tax_rate: 18,
          tax_amount: 0,
          net_price: 0,
          subtotal: 0,
        },
      ],
    }));
  };

  // Calculate totals when needed (debounced for performance)
  useEffect(() => {
    if (needsRecalculation) {
      const timeoutId = setTimeout(() => {
        calculateTotals();
        setNeedsRecalculation(false);
      }, 300); // Debounce for better performance

      return () => clearTimeout(timeoutId);
    }
  }, [needsRecalculation]);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

const handleSubmit = (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  // // Clean the branch_id - extract just the ID if it contains extra text
  // let cleanBranchId = formData.branch_id;
  
  // // If branch_id contains parentheses or extra text, extract just the ID part
  // if (formData.branch_id && typeof formData.branch_id === 'string') {
  //   // Check if it contains parentheses (like "343ergdf (IND9047)")
  //   const match = formData.branch_id.match(/^([a-f0-9]+)/i);
  //   if (match) {
  //     cleanBranchId = match[1]; // Extract just the hex ID
  //   }
  // }


  let cleanBranchId = formData.branch_id;

if (
  cleanBranchId &&
  typeof cleanBranchId === "string" &&
  cleanBranchId.includes("(")
) {
  // if user mistakenly selected label text
  const branch = branches.find(
    (b) =>
      `${b.branch_name} (${b.branch_code})` === formData.branch_id
  );

  if (branch) {
    cleanBranchId = branch._id;
  }
}

  const payload = {
    _id: quotation._id,
    quotation_number: quotation.quotation_number,
    customer_id: formData.customer_id,
    quotation_date: formData.quotation_date,
    expiry_date: formData.expiry_date,
    items: formData.items
      .filter((item) => item.product_id)
      .map((item) => ({
        product_id: item.product_id,
        product_code: item.product_code,
        product_name: item.product_name,
        quantity: parseFloat(item.quantity) || 1,
        unit_price: parseFloat(item.unit_price) || 0,
        discount: parseFloat(item.discount) || 0,
        tax_rate: parseFloat(item.tax_rate) || 0,
        tax_amount: parseFloat(item.tax_amount) || 0,
        net_price: parseFloat(item.net_price) || 0,
        subtotal: parseFloat(item.subtotal) || 0,
      })),
    note: formData.note,
    terms_conditions: formData.terms_conditions,
    shipping_cost: parseFloat(formData.shipping_cost) || 0,
    discount: parseFloat(formData.discount) || 0,
    tax_amount: parseFloat(formData.tax_amount) || 0,
    subtotal: parseFloat(formData.subtotal) || 0,
    total_amount: parseFloat(formData.total_amount) || 0,
    grand_total: parseFloat(formData.grand_total) || 0,
    branch_id: cleanBranchId, // Use the cleaned branch ID
    status: formData.status,
    valid_days: parseInt(formData.valid_days) || 30,
  };

  console.log("Updating quotation data with cleaned branch_id:", payload.branch_id);
  onSave(payload);
};

  const handleClose = () => {
    setFormData({
      customer_id: "",
      quotation_date: new Date().toISOString().split("T")[0],
      expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      items: [
        {
          product_id: "",
          product_code: "",
          product_name: "",
          quantity: "1",
          unit_price: 0,
          discount: 0,
          tax_rate: 18,
          tax_amount: 0,
          net_price: 0,
          subtotal: 0,
        },
      ],
      note: "",
      terms_conditions: "",
      shipping_cost: 0,
      discount: 0,
      tax_amount: 0,
      subtotal: 0,
      total_amount: 0,
      grand_total: 0,
      branch_id: "",
      status: "draft",
      valid_days: 30,
    });
    setSearchQuery("");
    setSearchResults([]);
    setErrors({});
    setNeedsRecalculation(false);
    setIsInitialized(false);
    onClose();
  };

  const isDisabled =
    loading ||
    loadingCustomers ||
    loadingItems ||
    loadingBranches ||
    !isInitialized;

  // Format currency
  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Check if quotation is editable
  const isEditable =
    quotation?.status === "draft" || quotation?.status === "sent";

  // Get customer name for display
  const getCustomerName = () => {
    if (!quotation?.customer_id) return "Select Customer";

    if (typeof quotation.customer_id === "object") {
      return quotation.customer_id.name || "Unknown Customer";
    }

    // Find customer from customers list
    const customer = customers?.find((c) => c._id === quotation.customer_id);
    return customer?.name || customer?.customer_name || "Unknown Customer";
  };

  // Get branch name for display
  const getBranchName = () => {
    if (!quotation?.branch_id) return "Select Branch";

    if (typeof quotation.branch_id === "object") {
      return quotation.branch_id.branch_name || "Unknown Branch";
    }

    // Find branch from branches list
    const branch = branches?.find((b) => b._id === quotation.branch_id);
    return branch?.branch_name || "Unknown Branch";
  };

  if (!quotation) {
    return (
      <div
        className="modal fade show d-block"
        style={{
          backgroundColor: "rgba(0,0,0,0.5)",
          overflowY: "auto",
          maxHeight: "100vh",
        }}
        tabIndex="-1"
      >
        <div className="modal-dialog modal-dialog-centered modal-xl">
          <div
            className="modal-content rounded-3"
            style={{ maxHeight: "95vh", overflow: "hidden" }}
          >
            <div className="modal-header border-bottom pb-3">
              <h5 className="modal-title fw-bold fs-5">Edit Quotation</h5>
              <button
                type="button"
                className="btn-close"
                onClick={handleClose}
                disabled={isDisabled}
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Loading quotation data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="modal fade show d-block"
      style={{
        backgroundColor: "rgba(0,0,0,0.5)",
        overflowY: "auto",
        maxHeight: "100vh",
      }}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-dialog-centered modal-xl">
        <div
          className="modal-content rounded-3"
          style={{ maxHeight: "95vh", overflow: "hidden" }}
        >
          <div
            className="modal-header border-bottom pb-3 sticky-top bg-white"
            style={{ zIndex: 1020 }}
          >
            <div>
              <h5 className="modal-title fw-bold fs-5">Edit Quotation</h5>
              {quotation?.quotation_number && (
                <div className="small text-muted">
                  Quotation #: {quotation.quotation_number}
                  {quotation.status && (
                    <span
                      className={`badge ms-2 ${
                        quotation.status === "draft"
                          ? "bg-secondary"
                          : quotation.status === "sent"
                          ? "bg-info"
                          : quotation.status === "accepted"
                          ? "bg-success"
                          : quotation.status === "rejected"
                          ? "bg-danger"
                          : quotation.status === "converted"
                          ? "bg-primary"
                          : "bg-warning"
                      }`}
                    >
                      {quotation.status.charAt(0).toUpperCase() +
                        quotation.status.slice(1)}
                    </span>
                  )}
                </div>
              )}
            </div>
            <button
              type="button"
              className="btn-close"
              onClick={handleClose}
              disabled={isDisabled}
              aria-label="Close"
            ></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div
              className="modal-body"
              style={{ overflowY: "auto", maxHeight: "calc(90vh - 130px)" }}
            >
              {/* Read-only status info for non-editable quotations */}
              {!isEditable && (
                <div className="alert alert-warning mb-4">
                  <FiInfo className="me-2" />
                  This quotation is <strong>{quotation?.status}</strong> and can
                  only be viewed, not edited.
                </div>
              )}

              {/* Quotation Number Display */}
              <div className="alert alert-info mb-4">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <strong>Quotation Number:</strong>{" "}
                    {quotation.quotation_number}
                  </div>
                  <div>
                    <strong>Created:</strong> {formatDate(quotation.createdAt)}
                  </div>
                </div>
              </div>

              {/* Basic Information */}
              <div className="row mb-4">
                <div className="col-md-3 mb-3">
                  <label className="form-label fw-medium">
                    Quotation Date <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <FiCalendar size={14} />
                    </span>
                    <input
                      type="date"
                      name="quotation_date"
                      className={`form-control ${
                        errors.quotation_date ? "is-invalid" : ""
                      }`}
                      value={formData.quotation_date}
                      onChange={handleChange}
                      disabled={isDisabled || !isEditable}
                    />
                  </div>
                  {errors.quotation_date && (
                    <div className="invalid-feedback">
                      {errors.quotation_date}
                    </div>
                  )}
                </div>

                <div className="col-md-3 mb-3">
                  <label className="form-label fw-medium">
                    Expiry Date <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <FiCalendar size={14} />
                    </span>
                    <input
                      type="date"
                      name="expiry_date"
                      className={`form-control ${
                        errors.expiry_date ? "is-invalid" : ""
                      }`}
                      value={formData.expiry_date}
                      onChange={handleChange}
                      disabled={isDisabled || !isEditable}
                      min={formData.quotation_date}
                    />
                  </div>
                  {errors.expiry_date && (
                    <div className="invalid-feedback">{errors.expiry_date}</div>
                  )}
                </div>

                <div className="col-md-3 mb-3">
                  <label className="form-label fw-medium">
                    Customer <span className="text-danger">*</span>
                  </label>
                  <select
                    name="customer_id"
                    className={`form-select ${
                      errors.customer_id ? "is-invalid" : ""
                    }`}
                    value={formData.customer_id}
                    onChange={handleChange}
                    disabled={isDisabled || loadingCustomers || !isEditable}
                  >
                    <option value="">Select Customer</option>
                    {loadingCustomers ? (
                      <option value="" disabled>
                        Loading customers...
                      </option>
                    ) : (
                      customers?.map((customer) => (
                        <option key={customer._id} value={customer._id}>
                          {customer.name || customer.customer_name}
                          {customer.mobile ? ` (${customer.mobile})` : ""}
                          {customer.customer_code
                            ? ` - ${customer.customer_code}`
                            : ""}
                        </option>
                      ))
                    )}
                  </select>
                  <div className="form-text">Current: {getCustomerName()}</div>
                  {errors.customer_id && (
                    <div className="invalid-feedback">{errors.customer_id}</div>
                  )}
                </div>

                <div className="col-md-3 mb-3">
                  <label className="form-label fw-medium">
                    Branch <span className="text-danger">*</span>
                  </label>
                  <select
                    name="branch_id"
                    className={`form-select ${
                      errors.branch_id ? "is-invalid" : ""
                    }`}
                    value={formData.branch_id}
                    onChange={handleChange}
                    disabled={isDisabled || loadingBranches || !isEditable}
                  >
                    <option value="">Select Branch</option>
                    {loadingBranches ? (
                      <option value="" disabled>
                        Loading branches...
                      </option>
                    ) : (
                      branches?.map((branch) => (
                        <option key={branch._id} value={branch._id}>
                          {branch.branch_name} ({branch.branch_code})
                        </option>
                      ))
                    )}
                  </select>
                  <div className="form-text">Current: {getBranchName()}</div>
                  {errors.branch_id && (
                    <div className="invalid-feedback">{errors.branch_id}</div>
                  )}
                </div>
              </div>

              {/* Additional Information */}
              <div className="row mb-4">
                <div className="col-md-3 mb-3">
                  <label className="form-label fw-medium">Status</label>
                  <select
                    name="status"
                    className="form-select"
                    value={formData.status}
                    onChange={handleChange}
                    disabled={isDisabled || !isEditable}
                  >
                    {statusOptions.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-3 mb-3">
                  <label className="form-label fw-medium">Valid Days</label>
                  <div className="input-group">
                    <span className="input-group-text">Days</span>
                    <input
                      type="number"
                      className="form-control"
                      name="valid_days"
                      value={formData.valid_days}
                      onChange={handleChange}
                      disabled={isDisabled || !isEditable}
                      min="1"
                    />
                  </div>
                </div>

                <div className="col-md-3 mb-3">
                  <label className="form-label fw-medium">
                    Shipping Cost (₹)
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <FiDollarSign size={14} />
                    </span>
                    <input
                      type="number"
                      className={`form-control ${
                        errors.shipping_cost ? "is-invalid" : ""
                      }`}
                      name="shipping_cost"
                      value={formData.shipping_cost}
                      onChange={handleChange}
                      disabled={isDisabled || !isEditable}
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>
                  {errors.shipping_cost && (
                    <div className="invalid-feedback">
                      {errors.shipping_cost}
                    </div>
                  )}
                </div>

                <div className="col-md-3 mb-3">
                  <label className="form-label fw-medium">Discount (₹)</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <FiPercent size={14} />
                    </span>
                    <input
                      type="number"
                      className={`form-control ${
                        errors.discount ? "is-invalid" : ""
                      }`}
                      name="discount"
                      value={formData.discount}
                      onChange={handleChange}
                      disabled={isDisabled || !isEditable}
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>
                  {errors.discount && (
                    <div className="invalid-feedback">{errors.discount}</div>
                  )}
                </div>
              </div>

              {/* Order Table Section */}
              <div className="border rounded-3 p-3 mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-bold mb-0">Quotation Items</h6>
                  {isEditable && (
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                      onClick={addNewItemRow}
                      disabled={isDisabled}
                    >
                      <FiPlus size={14} />
                      Add Item Row
                    </button>
                  )}
                </div>

                {/* Search Bar Section - Only show for editable quotations */}
                {isEditable && (
                  <div className="mb-4">
                    <label className="form-label fw-medium">
                      Search Products
                    </label>
                    <div className="position-relative" ref={searchRef}>
                      <div className="input-group">
                        <span className="input-group-text">
                          <FiSearch size={16} />
                        </span>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search by product name or code..."
                          value={searchQuery}
                          onChange={(e) => handleSearch(e.target.value)}
                          disabled={isDisabled || loadingItems}
                        />
                        {searchQuery && (
                          <button
                            type="button"
                            className="input-group-text"
                            onClick={() => {
                              setSearchQuery("");
                              setSearchResults([]);
                              setShowSearchResults(false);
                            }}
                          >
                            <FiX size={16} />
                          </button>
                        )}
                      </div>

                      {/* Search Results Dropdown */}
                      {showSearchResults && searchResults.length > 0 && (
                        <div
                          className="position-absolute w-100 bg-white border rounded shadow-lg mt-1 z-3"
                          style={{ maxHeight: "400px", overflowY: "auto" }}
                        >
                          {searchResults.map((product) => {
                            const displayInfo = getProductDisplayInfo(product);

                            return (
                              <div
                                key={product._id}
                                className="p-3 border-bottom hover-bg-light cursor-pointer"
                                onClick={() => handleProductSelect(product)}
                              >
                                <div className="d-flex justify-content-between align-items-start">
                                  <div className="flex-grow-1">
                                    <div className="fw-medium">
                                      {displayInfo.name}
                                    </div>
                                    <div className="small text-muted">
                                      Code: {displayInfo.code} | Stock:{" "}
                                      {displayInfo.stock}
                                    </div>
                                    <div className="small text-muted mt-1">
                                      Price:{" "}
                                      {formatCurrency(displayInfo.unit_price)} |
                                      Tax: {displayInfo.tax_rate}%
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-primary"
                                  >
                                    Add
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Items Table */}
                <div
                  className="table-responsive"
                  style={{ maxHeight: "400px", overflowY: "auto" }}
                >
                  <table className="table table-bordered align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th style={{ width: "30%" }}>Product</th>
                        <th style={{ width: "10%" }}>Quantity</th>
                        <th style={{ width: "15%" }}>Unit Price (₹)</th>
                        <th style={{ width: "10%" }}>Discount (₹)</th>
                        <th style={{ width: "10%" }}>Tax Rate %</th>
                        <th style={{ width: "15%" }}>Subtotal (₹)</th>
                        {isEditable && <th style={{ width: "10%" }}>Action</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {formData.items
                        .filter((item) => item.product_id)
                        .map((item, index) => {
                          const originalIndex = formData.items.findIndex(
                            (i) => i.product_id === item.product_id
                          );

                          return (
                            <tr key={originalIndex}>
                              <td>
                                <div className="d-flex align-items-center">
                                  <div className="flex-grow-1">
                                    <div className="fw-medium">
                                      {item.product_name}
                                    </div>
                                    <div className="small text-muted">
                                      {item.product_code}
                                    </div>
                                  </div>
                                  {isEditable && (
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-outline-secondary ms-2 flex-shrink-0"
                                      onClick={() => clearItem(originalIndex)}
                                      disabled={isDisabled}
                                      title="Clear item"
                                    >
                                      <FiX size={14} />
                                    </button>
                                  )}
                                </div>
                              </td>
                              <td>
                                <input
                                  type="number"
                                  className={`form-control ${
                                    errors[`items[${originalIndex}].quantity`]
                                      ? "is-invalid"
                                      : ""
                                  }`}
                                  value={item.quantity}
                                  onChange={(e) =>
                                    handleItemChangeWithCalculation(
                                      originalIndex,
                                      "quantity",
                                      e.target.value
                                    )
                                  }
                                  disabled={isDisabled || !isEditable}
                                  min="1"
                                  step="1"
                                />
                                {errors[`items[${originalIndex}].quantity`] && (
                                  <div className="invalid-feedback d-block">
                                    {errors[`items[${originalIndex}].quantity`]}
                                  </div>
                                )}
                              </td>
                              <td>
                                <div className="input-group">
                                  <span className="input-group-text">₹</span>
                                  <input
                                    type="number"
                                    className={`form-control ${
                                      errors[
                                        `items[${originalIndex}].unit_price`
                                      ]
                                        ? "is-invalid"
                                        : ""
                                    }`}
                                    value={item.unit_price}
                                    onChange={(e) =>
                                      handleItemChangeWithCalculation(
                                        originalIndex,
                                        "unit_price",
                                        e.target.value
                                      )
                                    }
                                    disabled={isDisabled || !isEditable}
                                    min="0"
                                    step="0.01"
                                  />
                                </div>
                              </td>
                              <td>
                                <div className="input-group">
                                  <span className="input-group-text">₹</span>
                                  <input
                                    type="number"
                                    className="form-control"
                                    value={item.discount}
                                    onChange={(e) =>
                                      handleItemChangeWithCalculation(
                                        originalIndex,
                                        "discount",
                                        e.target.value
                                      )
                                    }
                                    disabled={isDisabled || !isEditable}
                                    min="0"
                                    step="0.01"
                                  />
                                </div>
                              </td>
                              <td>
                                <div className="input-group">
                                  <input
                                    type="number"
                                    className="form-control"
                                    value={item.tax_rate}
                                    onChange={(e) =>
                                      handleItemChangeWithCalculation(
                                        originalIndex,
                                        "tax_rate",
                                        e.target.value
                                      )
                                    }
                                    disabled={isDisabled || !isEditable}
                                    min="0"
                                    step="0.1"
                                  />
                                  <span className="input-group-text">%</span>
                                </div>
                              </td>
                              <td>
                                <div className="input-group">
                                  <span className="input-group-text">₹</span>
                                  <input
                                    type="text"
                                    className="form-control bg-light fw-medium"
                                    value={formatCurrency(item.subtotal || 0)}
                                    readOnly
                                  />
                                </div>
                                <div className="small text-muted">
                                  Tax: {formatCurrency(item.tax_amount || 0)}
                                </div>
                              </td>
                              {isEditable && (
                                <td className="text-center">
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => removeItem(originalIndex)}
                                    disabled={
                                      isDisabled ||
                                      formData.items.filter((i) => i.product_id)
                                        .length === 1
                                    }
                                    title="Remove item"
                                  >
                                    <FiTrash2 size={14} />
                                  </button>
                                </td>
                              )}
                            </tr>
                          );
                        })}

                      {/* Empty state */}
                      {formData.items.filter((item) => item.product_id)
                        .length === 0 && (
                        <tr>
                          <td
                            colSpan={isEditable ? "7" : "6"}
                            className="text-center py-5 text-muted"
                          >
                            <div className="d-flex flex-column align-items-center">
                              <FiSearch className="mb-2" size={32} />
                              <span className="fs-6">
                                {isEditable
                                  ? "Search and select products from above to add them to the quotation"
                                  : "No items in this quotation"}
                              </span>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Summary Section */}
                <div className="row mt-4">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label fw-medium">Notes</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        placeholder="Any additional notes or instructions..."
                        value={formData.note}
                        onChange={handleChange}
                        name="note"
                        disabled={isDisabled || !isEditable}
                      ></textarea>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-medium">
                        Terms & Conditions
                      </label>
                      <textarea
                        className="form-control"
                        rows={3}
                        placeholder="Terms and conditions for this quotation..."
                        value={formData.terms_conditions}
                        onChange={handleChange}
                        name="terms_conditions"
                        disabled={isDisabled || !isEditable}
                      ></textarea>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="bg-light p-4 rounded-3">
                      <h6 className="fw-bold mb-3">Summary</h6>
                      <div className="mb-3">
                        <div className="d-flex justify-content-between mb-2">
                          <span className="text-muted">Items Subtotal:</span>
                          <span className="fw-medium">
                            {formatCurrency(formData.subtotal || 0)}
                          </span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                          <span className="text-muted">Total Tax:</span>
                          <span className="fw-medium">
                            {formatCurrency(formData.tax_amount || 0)}
                          </span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                          <span className="text-muted">Shipping Cost:</span>
                          <span className="fw-medium">
                            {formatCurrency(formData.shipping_cost || 0)}
                          </span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                          <span className="text-muted">Discount:</span>
                          <span className="fw-medium text-danger">
                            -{formatCurrency(formData.discount || 0)}
                          </span>
                        </div>
                        <hr />
                        <div className="d-flex justify-content-between">
                          <span className="fw-bold fs-5">Grand Total:</span>
                          <span className="fw-bold fs-5 text-primary">
                            {formatCurrency(formData.grand_total || 0)}
                          </span>
                        </div>
                        <div className="small text-muted mt-2">
                          Valid until: {formatDate(formData.expiry_date)}
                        </div>
                        {quotation?.createdAt && (
                          <div className="small text-muted">
                            Created: {formatDate(quotation.createdAt)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer border-top pt-3 bg-white">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={handleClose}
                disabled={isDisabled}
              >
                Cancel
              </button>
              {isEditable && (
                <button
                  type="submit"
                  className="btn btn-primary d-flex align-items-center gap-2"
                  disabled={isDisabled}
                >
                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm"
                        aria-hidden="true"
                      ></span>
                      Updating Quotation...
                    </>
                  ) : (
                    <>
                      <FiSave size={16} />
                      Update Quotation
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditQuotationForm;
