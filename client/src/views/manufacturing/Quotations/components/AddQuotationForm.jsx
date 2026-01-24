// components/quotations/AddQuotationForm.jsx
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
} from "react-icons/fi";
import useQuotations from "@/hooks/useQuotations";

const AddQuotationForm = ({
  onClose,
  onSave,
  loading = false,
  initialCustomerId = "",
}) => {
  const {
    customers,
    items,
    branches,
    loadingCustomers,
    loadingItems,
    loadingBranches,
  } = useQuotations();

  const [formData, setFormData] = useState({
    customer_id: initialCustomerId || "",
    quotation_date: new Date().toISOString().split("T")[0],
    expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    items: [
      {
        product_id: "",
        product_code: "",
        product_name: "",
        quantity: "0",
        unit_price: 0,
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

  // Status options
  const statusOptions = [
    { value: "draft", label: "Draft" },
    { value: "sent", label: "Sent" },
  ];

  // Helper function to extract product display info - FIXED
  const getProductDisplayInfo = (product) => {
    if (!product) return { 
      name: "", 
      code: "", 
      unit_price: 0,
    };

    // DEBUG: Log the product structure
    console.log("Product data in getProductDisplayInfo:", product);

    // Extract selling price - FIXED
    const sellingPrice = parseFloat(product.selling_price_with_gst) || 
                        parseFloat(product.selling_price_before_tax) || 
                        0;

    // Extract product code - FIXED
    const productCode = product.article_no || 
                       product.product_code || 
                       product.code || 
                       "";

    // Extract product name - FIXED
    const productName = product.product_name || 
                       product.name || 
                       "Unnamed Product";

    return {
      name: productName,
      code: productCode,
      unit_price: sellingPrice, // Use selling_price_with_gst
      description: product.description || "",
      category: product.product_category || product.category?.name || "",
      brand: product.product_brand || product.brand?.name || "",
      stock: product.quantity || product.stock_quantity || 0,
      image: product.images?.[0] || null,
      // Additional info for display
      metal_cost: product.total_metals_cost || 0,
      stone_cost: product.total_stones_cost || 0,
      material_cost: product.total_materials_cost || 0,
      making_cost: product.total_price_making_costs || 0,
      gst_amount: product.gst_amount || 0,
      base_total: product.base_total || 0,
      grand_total: product.grand_total || 0,
      gst_rate: product.gst_rate || "0%",
      _id: product._id || product.id,
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
      newErrors.branch_id = "branch is required";
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

  // Calculate item totals - simplified since unit_price already includes tax
  const calculateItemTotal = (item) => {
    const quantity = parseFloat(item.quantity) || 0;
    const unitPrice = parseFloat(item.unit_price) || 0;
    
    // Since unit_price is selling_price_with_gst (already includes GST),
    // we just multiply quantity * unit_price
    const subtotal = unitPrice * quantity;

    return {
      subtotal: subtotal,
      // No separate tax calculation since it's already in the price
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

    // Sum of all item subtotals
    const itemSubtotal = itemsCalculated.reduce(
      (total, item) => total + (item.subtotal || 0),
      0
    );

    // Shipping and discount
    const shippingCost = parseFloat(formData.shipping_cost) || 0;
    const additionalDiscount = parseFloat(formData.discount) || 0;

    // Calculate totals
    const subtotal = itemSubtotal;
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
      tax_amount: 0, // Tax is already included in item prices
      total_amount: grandTotal > 0 ? grandTotal : 0,
      grand_total: grandTotal > 0 ? grandTotal : 0,
    }));
  };

  // Handle search input - FIXED
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

    // DEBUG: Log items array
    console.log("Items array in search:", items);
    console.log("Items length:", items.length);

    if (!items || items.length === 0) {
      console.log("No items available for search");
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const results = items.filter((product) => {
      if (!product) return false;
      
      const displayInfo = getProductDisplayInfo(product);
      
      // Check if already selected
      if (selectedProductIds.includes(product._id)) {
        return false;
      }

      // Search in name and code
      const searchLower = query.toLowerCase();
      const nameMatch = displayInfo.name && 
                       displayInfo.name.toLowerCase().includes(searchLower);
      
      const codeMatch = displayInfo.code && 
                       displayInfo.code.toLowerCase().includes(searchLower);
      
      const articleNoMatch = product.article_no && 
                           product.article_no.toLowerCase().includes(searchLower);

      return nameMatch || codeMatch || articleNoMatch;
    });

    console.log("Search results:", results);
    setSearchResults(results.slice(0, 10));
    setShowSearchResults(results.length > 0);
  };

  // Handle product selection - FIXED
  const handleProductSelect = (product) => {
    console.log("Selected product:", product);
    
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
            subtotal: 0,
          },
        ],
      }));
    }

    const displayInfo = getProductDisplayInfo(product);
    console.log("Display info for selected product:", displayInfo);

    const updatedItems = [...formData.items];
    updatedItems[itemIndex] = {
      ...updatedItems[itemIndex],
      product_id: product._id,
      product_code: displayInfo.code,
      product_name: displayInfo.name,
      unit_price: displayInfo.unit_price,
      // No tax_rate since it's included in the price
    };

    console.log("Updated item at index", itemIndex, ":", updatedItems[itemIndex]);

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

    // Recalculate for this item
    const item = updatedItems[index];
    if (item.product_id && item.quantity && item.unit_price) {
      const calculated = calculateItemTotal(item);

      updatedItems[index] = {
        ...item,
        subtotal: calculated.subtotal,
      };
    }

    setFormData((prev) => ({
      ...prev,
      items: updatedItems,
    }));
  };

  // Handle item changes with immediate calculation for better UX
  const handleItemChangeWithCalculation = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    };

    if (["quantity", "unit_price"].includes(field)) {
      const item = updatedItems[index];

      if (item.product_id) {
        const calculated = calculateItemTotal(item);

        updatedItems[index] = {
          ...updatedItems[index],
          subtotal: calculated.subtotal,
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

    const payload = {
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
          // No discount or tax_rate at item level since included in price
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
      branch_id: formData.branch_id,
      status: formData.status,
      valid_days: parseInt(formData.valid_days) || 30,
    };

    console.log("Submitting quotation data:", payload);
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
    onClose();
  };

  const isDisabled =
    loading || loadingCustomers || loadingItems || loadingBranches;

  // Format currency
  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

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
            <h5 className="modal-title fw-bold fs-5">Create New Quotation</h5>
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
                      disabled={isDisabled}
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
                      disabled={isDisabled}
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
                    disabled={isDisabled || loadingCustomers}
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
                          {customer.customer_code
                            ? ` (${customer.customer_code})`
                            : ""}
                        </option>
                      ))
                    )}
                  </select>
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
                    disabled={isDisabled || loadingBranches}
                  >
                    <option value="">Select Branch</option>
                    {loadingBranches ? (
                      <option value="" disabled>
                        Loading branches...
                      </option>
                    ) : (
                      branches?.map((branch) => (
                        <option key={branch._id} value={branch.id}>
                          {branch.branch_name} ({branch.branch_code})
                        </option>
                      ))
                    )}
                  </select>
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
                    disabled={isDisabled}
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
                      disabled={isDisabled}
                      min="1"
                    />
                  </div>
                </div>

                <div className="col-md-3 mb-3">
                  <label className="form-label fw-medium">Shipping Cost</label>
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
                      disabled={isDisabled}
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
                  <label className="form-label fw-medium">Discount</label>
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
                      disabled={isDisabled}
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
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                    onClick={addNewItemRow}
                    disabled={isDisabled}
                  >
                    <FiPlus size={14} />
                    Add Item Row
                  </button>
                </div>

                {/* Search Bar Section */}
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

                    {/* Search Results Dropdown - FIXED */}
                    {showSearchResults && searchResults.length > 0 && (
                      <div
                        className="position-absolute w-100 bg-white border rounded shadow-lg mt-1 z-3"
                        style={{ maxHeight: "400px", overflowY: "auto" }}
                      >
                        {searchResults.map((product) => {
                          const displayInfo = getProductDisplayInfo(product);
                          console.log("Rendering product:", displayInfo);

                          return (
                            <div
                              key={product._id || Math.random()}
                              className="p-3 border-bottom hover-bg-light cursor-pointer"
                              onClick={() => handleProductSelect(product)}
                              style={{ cursor: 'pointer' }}
                            >
                              <div className="d-flex justify-content-between align-items-start">
                                <div className="flex-grow-1">
                                  <div className="fw-medium">
                                    {displayInfo.name || "No Name"}
                                  </div>
                                  <div className="small text-muted">
                                    Code: {displayInfo.code || "No Code"}
                                    {displayInfo.stock > 0 && (
                                      <> | Stock: {displayInfo.stock}</>
                                    )}
                                  </div>
                                  <div className="small text-muted mt-1">
                                    Price (incl. GST):{" "}
                                    {formatCurrency(displayInfo.unit_price || 0)}
                                  </div>
                                  {displayInfo.gst_rate && (
                                    <div className="small text-success">
                                      GST Rate: {displayInfo.gst_rate}
                                    </div>
                                  )}
                                  {displayInfo.category && (
                                    <div className="small text-muted">
                                      Category: {displayInfo.category}
                                    </div>
                                  )}
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

                    {/* Show loading or no results message */}
                    {loadingItems && (
                      <div className="position-absolute w-100 bg-white border rounded shadow-lg mt-1 z-3 p-3">
                        <div className="text-center">
                          <div className="spinner-border spinner-border-sm me-2"></div>
                          Loading products...
                        </div>
                      </div>
                    )}

                    {!loadingItems && searchQuery && searchResults.length === 0 && (
                      <div className="position-absolute w-100 bg-white border rounded shadow-lg mt-1 z-3 p-3">
                        <div className="text-center text-muted">
                          No products found for "{searchQuery}"
                        </div>
                        <div className="small text-center mt-2">
                          Try searching by product name or article number
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Items Table - Simplified without tax rate and discount columns */}
                <div
                  className="table-responsive"
                  style={{ maxHeight: "400px", overflowY: "auto" }}
                >
                  <table className="table table-bordered align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th style={{ width: "35%" }}>Product</th>
                        <th style={{ width: "15%" }}>Quantity</th>
                        <th style={{ width: "20%" }}>Unit Price (incl. GST)</th>
                        <th style={{ width: "20%" }}>Subtotal</th>
                        <th style={{ width: "10%" }}>Action</th>
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
                                      {item.product_name || "Unnamed Product"}
                                    </div>
                                    <div className="small text-muted">
                                      {item.product_code || "No Code"}
                                    </div>
                                    <div className="small text-success">
                                      Price includes GST
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-secondary ms-2 flex-shrink-0"
                                    onClick={() => clearItem(originalIndex)}
                                    disabled={isDisabled}
                                    title="Clear item"
                                  >
                                    <FiX size={14} />
                                  </button>
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
                                  disabled={isDisabled}
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
                                    disabled={isDisabled}
                                    min="0"
                                    step="0.01"
                                    readOnly // Price is fixed from product
                                  />
                                </div>
                                <div className="small text-success mt-1">
                                  GST included
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
                              </td>
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
                            </tr>
                          );
                        })}

                      {/* Empty state */}
                      {formData.items.filter((item) => item.product_id)
                        .length === 0 && (
                        <tr>
                          <td
                            colSpan="5"
                            className="text-center py-5 text-muted"
                          >
                            <div className="d-flex flex-column align-items-center">
                              <FiSearch className="mb-2" size={32} />
                              <span className="fs-6">
                                Search and select products from above to add
                                them to the quotation
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
                        disabled={isDisabled}
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
                        disabled={isDisabled}
                      ></textarea>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="bg-light p-4 rounded-3">
                      <h6 className="fw-bold mb-3">Summary</h6>
                      <div className="mb-3">
                        <div className="d-flex justify-content-between mb-2">
                          <span className="text-muted">Items Subtotal (incl. GST):</span>
                          <span className="fw-medium">
                            {formatCurrency(formData.subtotal || 0)}
                          </span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                          <span className="text-muted">Shipping Cost:</span>
                          <span className="fw-medium">
                            {formatCurrency(formData.shipping_cost || 0)}
                          </span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                          <span className="text-muted">Additional Discount:</span>
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
                          All prices include GST
                        </div>
                        <div className="small text-muted">
                          Valid until: {formData.expiry_date}
                        </div>
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
                    Creating Quotation...
                  </>
                ) : (
                  <>
                    <FiUpload size={16} />
                    Create Quotation
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddQuotationForm;