import React, { useState, useEffect, useRef } from "react";
import { FiUpload, FiTrash2, FiSearch, FiX, FiPlus } from "react-icons/fi";
import useSales from "@/hooks/useSales";

const AddSaleForm = ({ onClose, onSave, loading = false }) => {
  const {
    customers,
    items,
    units,
    branches,
    loadingCustomers,
    loadingItems,
    loadingUnits,
    loadingBranches,
  } = useSales();

  const [formData, setFormData] = useState({
    customer_id: "",
    sale_date: new Date().toISOString().split("T")[0],
    reference_no: "",
    items: [
      {
        product_id: "",
        quantity: "",
        unit_id: "",
        rate: "",
        discount: 0,
        tax: 0,
        total: 0,
        product_name: "",
        product_code: "",
      },
    ],
    sale_note: "",
    shipping_cost: 0,
    discount: 0,
    vat: 0,
    subtotal: 0,
    total_amount: 0,
    grand_total: 0,
    branch_id: "",
    status: "draft",
    payment_status: "pending",
  });

  const [errors, setErrors] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef(null);

  // Sale status options
  const saleStatusOptions = [
    { value: "draft", label: "Draft", color: "secondary" },
    { value: "pending", label: "Pending", color: "warning" },
    { value: "approved", label: "Approved", color: "primary" },
    { value: "completed", label: "Completed", color: "success" },
    { value: "cancelled", label: "Cancelled", color: "danger" },
    { value: "shipped", label: "Shipped", color: "info" },
  ];

  // Payment status options
  const paymentStatusOptions = [
    { value: "pending", label: "Pending", color: "warning" },
    { value: "partial", label: "Partial", color: "info" },
    { value: "paid", label: "Paid", color: "success" },
    { value: "overdue", label: "Overdue", color: "danger" },
  ];

  // Helper function to get selected product details
  const getSelectedProductDetails = (productId) => {
    if (!productId) return null;
    return items.find((item) => item._id === productId);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.customer_id) {
      newErrors.customer_id = "Customer is required";
    }

    if (!formData.sale_date) {
      newErrors.sale_date = "Sale date is required";
    }

    if (!formData.branch_id) {
      newErrors.branch_id = "Branch is required";
    }

    if (!formData.status) {
      newErrors.status = "Sale status is required";
    }

    // Filter only items that have product_id (selected items)
    const selectedItems = formData.items.filter(
      (item) => item.product_id
    );

    if (selectedItems.length === 0) {
      newErrors.items = "At least one item is required";
    }

    selectedItems.forEach((item, index) => {
      const originalIndex = formData.items.findIndex(
        (i) => i.product_id === item.product_id
      );

      if (!item.quantity || parseFloat(item.quantity) <= 0) {
        newErrors[`items[${originalIndex}].quantity`] = "Valid quantity is required";
      }

      if (!item.unit_id) {
        newErrors[`items[${originalIndex}].unit_id`] = "Unit is required";
      }

      if (!item.rate || parseFloat(item.rate) <= 0) {
        newErrors[`items[${originalIndex}].rate`] = "Valid rate is required";
      }
    });

    // Validate shipping cost (can be 0)
    if (formData.shipping_cost < 0) {
      newErrors.shipping_cost = "Shipping cost cannot be negative";
    }

    // Validate discount (can be 0)
    if (formData.discount < 0) {
      newErrors.discount = "Discount cannot be negative";
    }

    // Validate VAT (can be 0)
    if (formData.vat < 0) {
      newErrors.vat = "VAT cannot be negative";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateItemTotal = (quantity, rate, discount, tax) => {
    const qty = parseFloat(quantity) || 0;
    const rt = parseFloat(rate) || 0;
    const disc = parseFloat(discount) || 0;
    const tx = parseFloat(tax) || 0;

    const subtotal = qty * rt;
    const total = subtotal - disc + tx;
    
    return total > 0 ? total : 0;
  };

  const calculateTotals = () => {
    // Calculate item totals
    const itemSubtotal = formData.items
      .filter((item) => item.product_id)
      .reduce((total, item) => {
        const qty = parseFloat(item.quantity) || 0;
        const rt = parseFloat(item.rate) || 0;
        return total + (qty * rt);
      }, 0);

    const itemDiscount = formData.items
      .filter((item) => item.product_id)
      .reduce((total, item) => {
        return total + (parseFloat(item.discount) || 0);
      }, 0);

    const itemTax = formData.items
      .filter((item) => item.product_id)
      .reduce((total, item) => {
        return total + (parseFloat(item.tax) || 0);
      }, 0);

    const itemTotal = itemSubtotal - itemDiscount + itemTax;

    // Calculate additional charges/discounts
    const shippingCost = parseFloat(formData.shipping_cost) || 0;
    const additionalDiscount = parseFloat(formData.discount) || 0;
    const vatAmount = (itemTotal * (parseFloat(formData.vat) || 0)) / 100;

    const subtotal = itemTotal;
    const grandTotal = itemTotal + shippingCost - additionalDiscount + vatAmount;

    setFormData((prev) => ({
      ...prev,
      subtotal: subtotal,
      total_amount: itemTotal,
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

    // Filter out items that are already selected
    const selectedProductIds = formData.items
      .filter((item) => item.product_id)
      .map((item) => item.product_id);

    const results = items.filter(
      (item) =>
        ((item.product_name && item.product_name.toLowerCase().includes(query.toLowerCase())) ||
         (item.product_code && item.product_code.toLowerCase().includes(query.toLowerCase())) ||
         (item.name && item.name.toLowerCase().includes(query.toLowerCase())) ||
         (item.code && item.code.toLowerCase().includes(query.toLowerCase()))) &&
        !selectedProductIds.includes(item._id)
    );

    setSearchResults(results);
    setShowSearchResults(true);
  };

  // Handle product selection from search results
  const handleProductSelect = (product) => {
    // Find the first empty item slot or add a new one
    let itemIndex = formData.items.findIndex((item) => !item.product_id);

    if (itemIndex === -1) {
      // Add new item row
      itemIndex = formData.items.length;
      setFormData((prev) => ({
        ...prev,
        items: [
          ...prev.items,
          {
            product_id: "",
            quantity: "",
            unit_id: "",
            rate: "",
            discount: 0,
            tax: 0,
            total: 0,
            product_name: "",
            product_code: "",
          },
        ],
      }));
    }

    // Update the item with data from the selected product
    const updatedItems = [...formData.items];
    updatedItems[itemIndex] = {
      ...updatedItems[itemIndex],
      product_id: product._id,
      product_code: product.product_code || product.code || "",
      product_name: product.product_name || product.name || "",
      rate: product.selling_price || product.price || 0,
      unit_id: product.unit_id || "",
      quantity: "",
      discount: 0,
      tax: 0,
      total: 0,
    };

    setFormData((prev) => ({
      ...prev,
      items: updatedItems,
    }));

    setSearchQuery("");
    setShowSearchResults(false);
    setSearchResults([]);
  };

  const handleQuantityChange = (index, value) => {
    const item = formData.items[index];
    const rate = parseFloat(item.rate) || 0;
    const discount = parseFloat(item.discount) || 0;
    const tax = parseFloat(item.tax) || 0;

    const updatedItems = [...formData.items];
    updatedItems[index] = {
      ...item,
      quantity: value,
      total: calculateItemTotal(value, rate, discount, tax),
    };

    setFormData((prev) => ({
      ...prev,
      items: updatedItems,
    }));

    calculateTotals();

    // Clear quantity error if any
    if (errors[`items[${index}].quantity`]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`items[${index}].quantity`];
        return newErrors;
      });
    }
  };

  const handleRateChange = (index, value) => {
    const item = formData.items[index];
    const quantity = parseFloat(item.quantity) || 0;
    const discount = parseFloat(item.discount) || 0;
    const tax = parseFloat(item.tax) || 0;

    const updatedItems = [...formData.items];
    updatedItems[index] = {
      ...item,
      rate: value,
      total: calculateItemTotal(quantity, value, discount, tax),
    };

    setFormData((prev) => ({
      ...prev,
      items: updatedItems,
    }));

    calculateTotals();

    // Clear rate error if any
    if (errors[`items[${index}].rate`]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`items[${index}].rate`];
        return newErrors;
      });
    }
  };

  const handleItemDiscountChange = (index, value) => {
    const item = formData.items[index];
    const quantity = parseFloat(item.quantity) || 0;
    const rate = parseFloat(item.rate) || 0;
    const tax = parseFloat(item.tax) || 0;

    const updatedItems = [...formData.items];
    updatedItems[index] = {
      ...item,
      discount: value,
      total: calculateItemTotal(quantity, rate, value, tax),
    };

    setFormData((prev) => ({
      ...prev,
      items: updatedItems,
    }));

    calculateTotals();
  };

  const handleItemTaxChange = (index, value) => {
    const item = formData.items[index];
    const quantity = parseFloat(item.quantity) || 0;
    const rate = parseFloat(item.rate) || 0;
    const discount = parseFloat(item.discount) || 0;

    const updatedItems = [...formData.items];
    updatedItems[index] = {
      ...item,
      tax: value,
      total: calculateItemTotal(quantity, rate, discount, value),
    };

    setFormData((prev) => ({
      ...prev,
      items: updatedItems,
    }));

    calculateTotals();
  };

  const handleUnitChange = (index, unitId) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = {
      ...updatedItems[index],
      unit_id: unitId,
    };

    setFormData((prev) => ({
      ...prev,
      items: updatedItems,
    }));

    // Clear unit error if any
    if (errors[`items[${index}].unit_id`]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`items[${index}].unit_id`];
        return newErrors;
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // Recalculate totals for numeric fields
    if (
      name === "shipping_cost" ||
      name === "discount" ||
      name === "vat"
    ) {
      setTimeout(() => calculateTotals(), 0);
    }
  };

  // Remove item row
  const removeItem = (index) => {
    if (formData.items.length > 1) {
      const updatedItems = formData.items.filter((_, i) => i !== index);
      setFormData((prev) => ({
        ...prev,
        items: updatedItems,
      }));

      calculateTotals();
    }
  };

  // Clear item data
  const clearItem = (index) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = {
      product_id: "",
      quantity: "",
      unit_id: "",
      rate: "",
      discount: 0,
      tax: 0,
      total: 0,
      product_name: "",
      product_code: "",
    };

    setFormData((prev) => ({
      ...prev,
      items: updatedItems,
    }));

    calculateTotals();
  };

  // Add new empty item row
  const addNewItemRow = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          product_id: "",
          quantity: "",
          unit_id: "",
          rate: "",
          discount: 0,
          tax: 0,
          total: 0,
          product_name: "",
          product_code: "",
        },
      ],
    }));
  };

  useEffect(() => {
    calculateTotals();
  }, [formData.items, formData.shipping_cost, formData.discount, formData.vat]);

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
      sale_date: formData.sale_date,
      reference_no: formData.reference_no,
      items: formData.items
        .filter((item) => item.product_id)
        .map((item) => ({
          product_id: item.product_id,
          quantity: parseFloat(item.quantity) || 0,
          unit_id: item.unit_id,
          rate: parseFloat(item.rate) || 0,
          discount: parseFloat(item.discount) || 0,
          tax: parseFloat(item.tax) || 0,
          total: parseFloat(item.total) || 0,
          product_name: item.product_name,
          product_code: item.product_code,
        })),
      sale_note: formData.sale_note,
      shipping_cost: parseFloat(formData.shipping_cost) || 0,
      discount: parseFloat(formData.discount) || 0,
      vat: parseFloat(formData.vat) || 0,
      subtotal: parseFloat(formData.subtotal) || 0,
      total_amount: parseFloat(formData.total_amount) || 0,
      grand_total: parseFloat(formData.grand_total) || 0,
      branch_id: formData.branch_id,
      status: formData.status,
      payment_status: formData.payment_status,
    };

    console.log("Submitting sale data:", payload);
    onSave(payload);
  };

  const handleClose = () => {
    setFormData({
      customer_id: "",
      sale_date: new Date().toISOString().split("T")[0],
      reference_no: "",
      items: [
        {
          product_id: "",
          quantity: "",
          unit_id: "",
          rate: "",
          discount: 0,
          tax: 0,
          total: 0,
          product_name: "",
          product_code: "",
        },
      ],
      sale_note: "",
      shipping_cost: 0,
      discount: 0,
      vat: 0,
      subtotal: 0,
      total_amount: 0,
      grand_total: 0,
      branch_id: "",
      status: "draft",
      payment_status: "pending",
    });
    setSearchQuery("");
    setSearchResults([]);
    setErrors({});
    onClose();
  };

  const isDisabled =
    loading ||
    loadingCustomers ||
    loadingItems ||
    loadingUnits ||
    loadingBranches;

  // Get unit name by ID
  const getUnitName = (unitId) => {
    if (!unitId) return "";
    const unit = units.find((u) => u._id === unitId);
    return unit ? unit.name || unit.code : "";
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
            <h5 className="modal-title fw-bold fs-5">Create New Sale</h5>
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
              {/* Top Row - Date, Customer, Branch, Status */}
              <div className="row mb-4">
                <div className="col-md-3 mb-3">
                  <label className="form-label fw-medium">
                    Sale Date <span className="text-danger">*</span>
                  </label>
                  <input
                    type="date"
                    name="sale_date"
                    className={`form-control ${
                      errors.sale_date ? "is-invalid" : ""
                    }`}
                    value={formData.sale_date}
                    onChange={handleChange}
                    disabled={isDisabled}
                  />
                  {errors.sale_date && (
                    <div className="invalid-feedback">{errors.sale_date}</div>
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
                          {customer.customer_code ? ` (${customer.customer_code})` : ""}
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
                        <option key={branch._id} value={branch._id}>
                          {branch.branch_name} ({branch.branch_code})
                          {branch.is_warehouse && " - Warehouse"}
                        </option>
                      ))
                    )}
                  </select>
                  {errors.branch_id && (
                    <div className="invalid-feedback">{errors.branch_id}</div>
                  )}
                </div>

                <div className="col-md-3 mb-3">
                  <label className="form-label fw-medium">
                    Sale Status <span className="text-danger">*</span>
                  </label>
                  <select
                    name="status"
                    className={`form-select ${
                      errors.status ? "is-invalid" : ""
                    }`}
                    value={formData.status}
                    onChange={handleChange}
                    disabled={isDisabled}
                  >
                    {saleStatusOptions.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                  {errors.status && (
                    <div className="invalid-feedback">{errors.status}</div>
                  )}
                </div>
              </div>

              {/* Second Row - Reference No, Payment Status, Shipping Cost */}
              <div className="row mb-4">
                <div className="col-md-3 mb-3">
                  <label className="form-label fw-medium">Reference No.</label>
                  <input
                    type="text"
                    className="form-control"
                    name="reference_no"
                    value={formData.reference_no}
                    onChange={handleChange}
                    disabled={isDisabled}
                    placeholder="SALE-REF-001"
                  />
                </div>

                <div className="col-md-3 mb-3">
                  <label className="form-label fw-medium">Payment Status</label>
                  <select
                    name="payment_status"
                    className="form-select"
                    value={formData.payment_status}
                    onChange={handleChange}
                    disabled={isDisabled}
                  >
                    {paymentStatusOptions.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-3 mb-3">
                  <label className="form-label fw-medium">Shipping Cost</label>
                  <div className="input-group">
                    <span className="input-group-text">₹</span>
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
                  <label className="form-label fw-medium">Sale Note</label>
                  <input
                    type="text"
                    className="form-control"
                    name="sale_note"
                    value={formData.sale_note}
                    onChange={handleChange}
                    disabled={isDisabled}
                    placeholder="Additional notes..."
                  />
                </div>
              </div>

              {/* Order Table Section */}
              <div className="border rounded-3 p-3 mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-bold mb-0">Sale Items</h6>
                  {/* <button
                    type="button"
                    className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                    onClick={addNewItemRow}
                    disabled={isDisabled}
                  >
                    <FiPlus size={14} />
                    Add Item
                  </button> */}
                </div>

                {/* Search Bar Section */}
                <div className="mb-4">
                  <label className="form-label fw-medium">Search Products</label>
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
                        disabled={isDisabled}
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
                        style={{ maxHeight: "300px", overflowY: "auto" }}
                      >
                        {searchResults.map((product) => (
                          <div
                            key={product._id}
                            className="p-3 border-bottom cursor-pointer hover-bg-light"
                            onClick={() => handleProductSelect(product)}
                            style={{ cursor: "pointer" }}
                          >
                            <div className="fw-medium">
                              {product.product_name || product.name}
                            </div>
                            <div className="small text-muted">
                              Code: {product.product_code || product.code} | 
                              Price: ₹{product.selling_price || product.price || "0.00"}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {!showSearchResults &&
                      searchQuery &&
                      searchResults.length === 0 && (
                        <div className="text-muted small mt-1">
                          No products found. Try a different search term.
                        </div>
                      )}
                  </div>
                </div>

                {/* Sale Items Table */}
                <div
                  className="table-responsive"
                  style={{ maxHeight: "400px", overflowY: "auto" }}
                >
                  <table className="table table-bordered align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th style={{ minWidth: "250px" }}>Product</th>
                        <th style={{ minWidth: "100px" }}>Quantity</th>
                        <th style={{ minWidth: "120px" }}>Unit</th>
                        <th style={{ minWidth: "120px" }}>Rate</th>
                        <th style={{ minWidth: "100px" }}>Discount</th>
                        <th style={{ minWidth: "100px" }}>Tax</th>
                        <th style={{ minWidth: "120px" }}>Total</th>
                        <th style={{ minWidth: "60px" }}>Action</th>
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
                                      {item.product_code || "No code"}
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
                                  placeholder="Quantity"
                                  value={item.quantity}
                                  onChange={(e) =>
                                    handleQuantityChange(originalIndex, e.target.value)
                                  }
                                  disabled={isDisabled}
                                  min="0"
                                  step="0.001"
                                />
                                {errors[`items[${originalIndex}].quantity`] && (
                                  <div className="invalid-feedback d-block">
                                    {errors[`items[${originalIndex}].quantity`]}
                                  </div>
                                )}
                              </td>
                              <td>
                                <select
                                  className={`form-select ${
                                    errors[`items[${originalIndex}].unit_id`]
                                      ? "is-invalid"
                                      : ""
                                  }`}
                                  value={item.unit_id}
                                  onChange={(e) =>
                                    handleUnitChange(originalIndex, e.target.value)
                                  }
                                  disabled={isDisabled}
                                >
                                  <option value="">Select Unit</option>
                                  {units?.map((unit) => (
                                    <option key={unit._id} value={unit._id}>
                                      {unit.name || unit.code}
                                    </option>
                                  ))}
                                </select>
                                {errors[`items[${originalIndex}].unit_id`] && (
                                  <div className="invalid-feedback d-block small">
                                    {errors[`items[${originalIndex}].unit_id`]}
                                  </div>
                                )}
                              </td>
                              <td>
                                <div className="input-group">
                                  <span className="input-group-text">₹</span>
                                  <input
                                    type="number"
                                    className={`form-control ${
                                      errors[`items[${originalIndex}].rate`]
                                        ? "is-invalid"
                                        : ""
                                    }`}
                                    placeholder="Rate"
                                    value={item.rate}
                                    onChange={(e) =>
                                      handleRateChange(originalIndex, e.target.value)
                                    }
                                    disabled={isDisabled}
                                    min="0"
                                    step="0.01"
                                  />
                                </div>
                                {errors[`items[${originalIndex}].rate`] && (
                                  <div className="invalid-feedback d-block small">
                                    {errors[`items[${originalIndex}].rate`]}
                                  </div>
                                )}
                              </td>
                              <td>
                                <div className="input-group">
                                  <span className="input-group-text">₹</span>
                                  <input
                                    type="number"
                                    className="form-control"
                                    placeholder="Discount"
                                    value={item.discount}
                                    onChange={(e) =>
                                      handleItemDiscountChange(originalIndex, e.target.value)
                                    }
                                    disabled={isDisabled}
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
                                    placeholder="Tax"
                                    value={item.tax}
                                    onChange={(e) =>
                                      handleItemTaxChange(originalIndex, e.target.value)
                                    }
                                    disabled={isDisabled}
                                    min="0"
                                    step="0.01"
                                  />
                                </div>
                              </td>
                              <td>
                                <div className="input-group">
                                  <span className="input-group-text">₹</span>
                                  <input
                                    type="text"
                                    className="form-control bg-light fw-medium"
                                    value={parseFloat(item.total || 0).toFixed(2)}
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
                                    formData.items.filter(
                                      (i) => i.product_id
                                    ).length === 1
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
                            colSpan="8"
                            className="text-center py-5 text-muted"
                          >
                            <div className="d-flex flex-column align-items-center">
                              <FiSearch className="mb-2" size={32} />
                              <span className="fs-6">
                                Search and select products from above to add
                                them to the sale
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
                      <label className="form-label fw-medium">Additional Discount</label>
                      <div className="input-group">
                        <span className="input-group-text">₹</span>
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

                    <div className="mb-3">
                      <label className="form-label fw-medium">VAT (%)</label>
                      <div className="input-group">
                        <input
                          type="number"
                          className={`form-control ${
                            errors.vat ? "is-invalid" : ""
                          }`}
                          name="vat"
                          value={formData.vat}
                          onChange={handleChange}
                          disabled={isDisabled}
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                        />
                        <span className="input-group-text">%</span>
                      </div>
                      {errors.vat && (
                        <div className="invalid-feedback">{errors.vat}</div>
                      )}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="bg-light p-3 rounded-3">
                      <div className="row">
                        <div className="col-6">
                          <div className="mb-2">
                            <span className="text-muted">Items Total:</span>
                            <span className="float-end fw-medium">
                              ₹{parseFloat(formData.total_amount || 0).toFixed(2)}
                            </span>
                          </div>
                          <div className="mb-2">
                            <span className="text-muted">Shipping Cost:</span>
                            <span className="float-end fw-medium">
                              ₹{parseFloat(formData.shipping_cost || 0).toFixed(2)}
                            </span>
                          </div>
                          <div className="mb-2">
                            <span className="text-muted">
                              VAT ({formData.vat || 0}%):
                            </span>
                            <span className="float-end fw-medium">
                              ₹{(
                                (formData.total_amount *
                                  (parseFloat(formData.vat) || 0)) /
                                100
                              ).toFixed(2)}
                            </span>
                          </div>
                          <div className="mb-2">
                            <span className="text-muted">Discount:</span>
                            <span className="float-end fw-medium text-danger">
                              -₹{parseFloat(formData.discount || 0).toFixed(2)}
                            </span>
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="mb-2">
                            <span className="fw-bold fs-5">Grand Total:</span>
                            <span className="float-end fw-bold fs-5 text-primary">
                              ₹{parseFloat(formData.grand_total || 0).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Notes Section */}
              <div className="border rounded-3 p-3 mb-4">
                <h6 className="fw-bold mb-3">Additional Notes</h6>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Any additional notes or instructions..."
                  value={formData.sale_note}
                  onChange={handleChange}
                  name="sale_note"
                  disabled={isDisabled}
                ></textarea>
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
                    Creating Sale...
                  </>
                ) : (
                  <>
                    <FiUpload size={16} />
                    Create Sale
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

export default AddSaleForm;