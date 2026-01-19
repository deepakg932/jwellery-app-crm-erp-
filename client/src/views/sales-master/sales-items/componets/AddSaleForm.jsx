import React, { useState, useEffect, useRef } from "react";
import {
  FiUpload,
  FiTrash2,
  FiSearch,
  FiX,
  FiPlus,
  FiInfo,
  FiRefreshCw,
} from "react-icons/fi";
import useSales from "@/hooks/useSales";

const AddSaleForm = ({ onClose, onSave, loading = false }) => {
  const {
    customers,
    items,
    branches,
    employees,
    loadingCustomers,
    loadingItems,
    loadingBranches,
    loadingEmployees,
  } = useSales();

  const [formData, setFormData] = useState({
    customer_id: "",
    sale_date: new Date().toISOString().split("T")[0],
    sold_by: "",
    items: [
      {
        product_id: "",
        quantity: "",
        price_before_tax: 0,
        gst_rate: 0,
        gst_amount: 0,
        selling_total: 0,
        final_total: 0,
        product_name: "",
        product_code: "",
      },
    ],
    is_exchange: false,
    exchange_amount: 0, // New field for exchange amount
    exchange_note: "",
    sale_note: "",
    shipping_cost: 0,
    discount: 0,
    subtotal: 0,
    total_tax: 0,
    total_amount: 0,
    branch_id: "",
    status: "draft",
    payment_status: "pending",
  });

  const [errors, setErrors] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedProductDetails, setSelectedProductDetails] = useState(null);
  const [showProductDetails, setShowProductDetails] = useState(false);
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

  // Helper function to extract product display info
  const getProductDisplayInfo = (product) => {
    if (!product)
      return {
        name: "",
        code: "",
        price_before_tax: 0,
        gst_rate: 0,
        gst_amount: 0,
      };

    // Parse GST rate from string (e.g., "14%" -> 14)
    const gstRateStr = product.gst_rate || "0%";
    const gstRate = parseFloat(gstRateStr.replace("%", "")) || 0;

    return {
      name: product.product_name || "Unnamed Product",
      code: product.product_code || "",
      price_before_tax: product.selling_price_before_tax || 0,
      gst_rate: gstRate,
      gst_amount: product.gst_amount || 0,
      selling_total:
        (product.selling_price_before_tax || 0) + (product.gst_amount || 0),
      category: product.product_category || product.product_category_id?.name,
      brand: product.product_brand || product.product_brand_id?.name,
      metalWeight: product.total_metals_cost
        ? `${product.metals?.[0]?.weight || 0}g`
        : "0g",
      stoneCount: product.stones?.length || 0,
      image: product.images?.[0] || null,
    };
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
    });

    // Validate shipping cost (can be 0)
    if (formData.shipping_cost < 0) {
      newErrors.shipping_cost = "Shipping cost cannot be negative";
    }

    // Validate discount (can be 0)
    if (formData.discount < 0) {
      newErrors.discount = "Discount cannot be negative";
    }

    // Validate exchange amount if exchange is enabled
    if (formData.is_exchange) {
      const exchangeAmount = parseFloat(formData.exchange_amount) || 0;
      if (exchangeAmount < 0) {
        newErrors.exchange_amount = "Exchange amount cannot be negative";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateItemTotal = (quantity, selling_total) => {
    const qty = parseFloat(quantity) || 0;
    const sellingTotal = parseFloat(selling_total) || 0;

    const subtotal = sellingTotal * qty;
    const finalTotal = subtotal;

    return {
      subtotal: subtotal,
      final_total: finalTotal > 0 ? finalTotal : 0,
    };
  };

  const calculateTotals = () => {
    // Calculate item totals
    const itemsCalculated = formData.items
      .filter((item) => item.product_id)
      .map((item) => {
        const { subtotal, final_total } = calculateItemTotal(
          item.quantity,
          item.selling_total
        );
        return { ...item, subtotal, final_total };
      });

    const itemSubtotal = itemsCalculated.reduce(
      (total, item) => total + (item.subtotal || 0),
      0
    );
    const itemGstTotal = itemsCalculated.reduce((total, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const gstAmount = parseFloat(item.gst_amount) || 0;
      return total + gstAmount * quantity;
    }, 0);
    const itemTotal = itemsCalculated.reduce(
      (total, item) => total + (item.final_total || 0),
      0
    );

    // Calculate additional charges/discounts
    const shippingCost = parseFloat(formData.shipping_cost) || 0;
    const additionalDiscount = parseFloat(formData.discount) || 0;
    const exchangeAmount = formData.is_exchange ? parseFloat(formData.exchange_amount) || 0 : 0;

    const subtotal = itemSubtotal;
    const totalTax = itemGstTotal;
    
    // Calculate: Grand Total = (Item Total + Shipping Cost - Discount) - Exchange Amount
    const beforeExchangeTotal = itemTotal + shippingCost - additionalDiscount;
    const grandTotal = beforeExchangeTotal - exchangeAmount;

    // Update form data with calculated totals
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item, index) => {
        const calculatedItem = itemsCalculated.find(
          (calc) => calc.product_id === item.product_id
        );
        return calculatedItem ? calculatedItem : item;
      }),
      subtotal: subtotal,
      total_tax: totalTax,
      total_amount: grandTotal > 0 ? grandTotal : 0,
    }));
  };

  // Handle search for main products
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

  // Toggle exchange checkbox
  const toggleExchange = () => {
    setFormData((prev) => ({
      ...prev,
      is_exchange: !prev.is_exchange,
      exchange_amount: !prev.is_exchange ? 0 : prev.exchange_amount, // Reset amount when disabling
      exchange_note: !prev.is_exchange ? "" : prev.exchange_note, // Clear note when disabling
    }));
  };

  // Show product details modal
  const showProductDetailModal = (product) => {
    setSelectedProductDetails(product);
    setShowProductDetails(true);
  };

  // Handle product selection from search results
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
            quantity: "",
            price_before_tax: 0,
            gst_rate: 0,
            gst_amount: 0,
            selling_total: 0,
            final_total: 0,
            product_name: "",
            product_code: "",
          },
        ],
      }));
    }

    const displayInfo = getProductDisplayInfo(product);

    // Update the item with data from the selected product
    const updatedItems = [...formData.items];
    updatedItems[itemIndex] = {
      ...updatedItems[itemIndex],
      product_id: product._id,
      product_code: displayInfo.code,
      product_name: displayInfo.name,
      price_before_tax: displayInfo.price_before_tax,
      gst_rate: displayInfo.gst_rate,
      gst_amount: displayInfo.gst_amount,
      selling_total: displayInfo.selling_total,
      quantity: "1", // Set default quantity to 1
    };

    setFormData((prev) => ({
      ...prev,
      items: updatedItems,
    }));

    setSearchQuery("");
    setShowSearchResults(false);
    setSearchResults([]);

    // Recalculate totals immediately after adding product
    setTimeout(() => calculateTotals(), 100);
  };

  const handleQuantityChange = (index, value) => {
    const updatedItems = [...formData.items];
    const item = updatedItems[index];
    
    // Update quantity
    item.quantity = value;
    
    // Calculate total only if valid quantity
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      const selling_total = parseFloat(item.selling_total) || 0;
      const calculated = calculateItemTotal(numValue, selling_total);
      item.final_total = calculated.final_total;
    } else {
      item.final_total = 0;
    }
    
    setFormData((prev) => ({ ...prev, items: updatedItems }));
    
    // Clear error if exists
    if (errors[`items[${index}].quantity`]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`items[${index}].quantity`];
        return newErrors;
      });
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // Recalculate totals for numeric fields
    if (name === "shipping_cost" || name === "discount" || name === "exchange_amount") {
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

      setTimeout(() => calculateTotals(), 0);
    }
  };

  // Clear item data
  const clearItem = (index) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = {
      product_id: "",
      quantity: "",
      price_before_tax: 0,
      gst_rate: 0,
      gst_amount: 0,
      selling_total: 0,
      final_total: 0,
      product_name: "",
      product_code: "",
    };

    setFormData((prev) => ({
      ...prev,
      items: updatedItems,
    }));

    setTimeout(() => calculateTotals(), 0);
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
          price_before_tax: 0,
          gst_rate: 0,
          gst_amount: 0,
          selling_total: 0,
          final_total: 0,
          product_name: "",
          product_code: "",
        },
      ],
    }));
  };

  // Calculate totals whenever items or other fields change
  useEffect(() => {
    calculateTotals();
  }, [formData.items, formData.shipping_cost, formData.discount, formData.exchange_amount, formData.is_exchange]);

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
      sold_by: formData.sold_by,
      items: formData.items
        .filter((item) => item.product_id)
        .map((item) => ({
          product_id: item.product_id,
          quantity: parseFloat(item.quantity) || 1,
          price_before_tax: parseFloat(item.price_before_tax) || 0,
          gst_rate: parseFloat(item.gst_rate) || 0,
          gst_amount: parseFloat(item.gst_amount) || 0,
          selling_total: parseFloat(item.selling_total) || 0,
          final_total: parseFloat(item.final_total) || 0,
          product_name: item.product_name,
          product_code: item.product_code,
        })),
      is_exchange: formData.is_exchange,
      exchange_amount: parseFloat(formData.exchange_amount) || 0, // Include exchange amount
      exchange_note: formData.exchange_note || "",
      sale_note: formData.sale_note,
      shipping_cost: parseFloat(formData.shipping_cost) || 0,
      discount: parseFloat(formData.discount) || 0,
      subtotal: parseFloat(formData.subtotal) || 0,
      total_tax: parseFloat(formData.total_tax) || 0,
      total_amount: parseFloat(formData.total_amount) || 0,
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
      sold_by: "",
      items: [
        {
          product_id: "",
          quantity: "",
          price_before_tax: 0,
          gst_rate: 0,
          gst_amount: 0,
          selling_total: 0,
          final_total: 0,
          product_name: "",
          product_code: "",
        },
      ],
      is_exchange: false,
      exchange_amount: 0,
      exchange_note: "",
      sale_note: "",
      shipping_cost: 0,
      discount: 0,
      subtotal: 0,
      total_tax: 0,
      total_amount: 0,
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
    loading || loadingCustomers || loadingItems || loadingBranches || loadingEmployees;

  // Format currency
  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Calculate the total before exchange for display
  const calculateBeforeExchangeTotal = () => {
    const itemTotal = formData.items
      .filter((item) => item.product_id)
      .reduce((total, item) => total + (item.final_total || 0), 0);
    
    const shippingCost = parseFloat(formData.shipping_cost) || 0;
    const discount = parseFloat(formData.discount) || 0;
    
    return itemTotal + shippingCost - discount;
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
              {/* Top Row - Date, Customer, Branch, Status, Sold By */}
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

                <div className="col-md-2 mb-3">
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
                          {branch.is_warehouse && " - Warehouse"}
                        </option>
                      ))
                    )}
                  </select>
                  {errors.branch_id && (
                    <div className="invalid-feedback">{errors.branch_id}</div>
                  )}
                </div>

                <div className="col-md-2 mb-3">
                  <label className="form-label fw-medium">
                    Sold By
                  </label>
                  <select
                    name="sold_by"
                    className="form-select"
                    value={formData.sold_by}
                    onChange={handleChange}
                    disabled={isDisabled || loadingEmployees}
                  >
                    <option value="">Select Employee</option>
                    {loadingEmployees ? (
                      <option value="" disabled>
                        Loading employees...
                      </option>
                    ) : (
                      employees?.map((employee) => (
                        <option key={employee._id} value={employee._id}>
                          {employee.name}
                          {employee.employee_code
                            ? ` (${employee.employee_code})`
                            : ""}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div className="col-md-2 mb-3">
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

              {/* Second Row - Payment Status, Shipping Cost, Discount, Exchange Checkbox */}
              <div className="row mb-4">
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
                  <label className="form-label fw-medium">
                    Additional Discount
                  </label>
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

                <div className="col-md-3 mb-3 d-flex align-items-end">
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      role="switch"
                      id="is_exchange"
                      name="is_exchange"
                      checked={formData.is_exchange}
                      onChange={toggleExchange}
                      disabled={isDisabled}
                      style={{ width: "3em", height: "1.5em" }}
                    />
                    <label className="form-check-label fw-medium ms-2" htmlFor="is_exchange">
                      <FiRefreshCw className="me-1" />
                      Exchange Sale
                    </label>
                  </div>
                </div>
              </div>

              {/* Exchange Amount Section - Conditional */}
              {formData.is_exchange && (
                <div className="border rounded-3 p-3 mb-4 bg-warning bg-opacity-10">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="fw-bold mb-0 text-warning">
                      <FiRefreshCw className="me-2" />
                      Exchange Details
                    </h6>
                  </div>
                  
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-medium">
                        Exchange Amount <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text">₹</span>
                        <input
                          type="number"
                          className={`form-control ${
                            errors.exchange_amount ? "is-invalid" : ""
                          }`}
                          name="exchange_amount"
                          value={formData.exchange_amount}
                          onChange={handleChange}
                          disabled={isDisabled}
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                        />
                      </div>
                      {errors.exchange_amount && (
                        <div className="invalid-feedback">{errors.exchange_amount}</div>
                      )}
                      <div className="form-text">
                        Amount to be deducted for customer's old item
                      </div>
                    </div>
                    
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-medium">
                        Exchange Note (Optional)
                      </label>
                      <textarea
                        className="form-control"
                        rows={2}
                        placeholder="Add notes about the exchange (e.g., old item details, condition, etc.)..."
                        value={formData.exchange_note}
                        onChange={handleChange}
                        name="exchange_note"
                        disabled={isDisabled}
                      ></textarea>
                    </div>
                  </div>
                  
                  <div className="alert alert-info mb-0">
                    <div className="d-flex align-items-center">
                      <FiInfo className="me-2" size={18} />
                      <div>
                        <strong>Calculation:</strong> Grand Total = (Item Total + Shipping - Discount) - Exchange Amount
                        <br />
                        <small>Exchange amount will be deducted from the final total.</small>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Order Table Section */}
              <div className="border rounded-3 p-3 mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-bold mb-0">Sale Items</h6>
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
                              className="p-3 border-bottom hover-bg-light"
                            >
                              <div className="d-flex justify-content-between align-items-start">
                                <div className="flex-grow-1">
                                  <div className="fw-medium">
                                    {displayInfo.name}
                                  </div>
                                  <div className="small text-muted">
                                    Code: {displayInfo.code} | Category:{" "}
                                    {displayInfo.category || "N/A"}
                                  </div>
                                  <div className="small text-muted mt-1">
                                    Price:{" "}
                                    {formatCurrency(
                                      displayInfo.price_before_tax
                                    )}{" "}
                                    + GST:{" "}
                                    {formatCurrency(displayInfo.gst_amount)} =
                                    Total:{" "}
                                    {formatCurrency(displayInfo.selling_total)}
                                  </div>
                                </div>
                                <div className="d-flex gap-2">
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-info"
                                    onClick={() => {
                                      showProductDetailModal(product);
                                    }}
                                    title="View Details"
                                  >
                                    <FiInfo size={14} />
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-primary"
                                    onClick={() => {
                                      handleProductSelect(product);
                                    }}
                                  >
                                    Select
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
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
                        <th style={{ minWidth: "120px" }}>
                          Price (before tax)
                        </th>
                        <th style={{ minWidth: "100px" }}>GST Amount</th>
                        <th style={{ minWidth: "120px" }}>Selling Total</th>
                        <th style={{ minWidth: "120px" }}>Final Total</th>
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

                          // Calculate per unit GST and Selling Total
                          const perUnitGST = item.gst_amount || 0;
                          const perUnitSellingTotal = item.selling_total || 0;

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
                                    handleQuantityChange(
                                      originalIndex,
                                      e.target.value
                                    )
                                  }
                                  onBlur={(e) => {
                                    // Auto-correct on blur if empty or invalid
                                    const value = e.target.value;
                                    if (!value || parseFloat(value) <= 0) {
                                      handleQuantityChange(originalIndex, "1");
                                    }
                                  }}
                                  disabled={!item.product_id || isDisabled}
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
                                    type="text"
                                    className="form-control bg-light"
                                    value={formatCurrency(
                                      item.price_before_tax
                                    )}
                                    readOnly
                                    disabled
                                  />
                                </div>
                              </td>
                              <td>
                                <div className="input-group">
                                  <span className="input-group-text">₹</span>
                                  <input
                                    type="text"
                                    className="form-control bg-light"
                                    value={formatCurrency(perUnitGST)}
                                    readOnly
                                    disabled
                                  />
                                </div>
                                <div className="small text-muted text-center">
                                  (Per unit)
                                </div>
                              </td>
                              <td>
                                <div className="input-group">
                                  <span className="input-group-text">₹</span>
                                  <input
                                    type="text"
                                    className="form-control bg-light"
                                    value={formatCurrency(perUnitSellingTotal)}
                                    readOnly
                                    disabled
                                  />
                                </div>
                                <div className="small text-muted text-center">
                                  Price + GST
                                </div>
                              </td>

                              <td>
                                <div className="input-group">
                                  <span className="input-group-text">₹</span>
                                  <input
                                    type="text"
                                    className="form-control bg-light fw-medium"
                                    value={formatCurrency(
                                      item.final_total || 0
                                    )}
                                    readOnly
                                  />
                                </div>
                                <div className="small text-muted text-center">
                                  (Selling Total × Qty)
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
                      <label className="form-label fw-medium">Sale Note</label>
                      <textarea
                        className="form-control"
                        rows={2}
                        placeholder="Any additional notes or instructions..."
                        value={formData.sale_note}
                        onChange={handleChange}
                        name="sale_note"
                        disabled={isDisabled}
                      ></textarea>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="bg-light p-3 rounded-3">
                      <div className="row">
                        <div className="col-6">
                          <div className="mb-2">
                            <span className="text-muted">
                              Subtotal (Selling Total × Qty):
                            </span>
                            <span className="float-end fw-medium">
                              {formatCurrency(formData.subtotal || 0)}
                            </span>
                          </div>
                          <div className="mb-2">
                            <span className="text-muted">
                              Total GST (Per unit × Qty):
                            </span>
                            <span className="float-end fw-medium">
                              {formatCurrency(formData.total_tax || 0)}
                            </span>
                          </div>
                          <div className="mb-2">
                            <span className="text-muted">Shipping Cost:</span>
                            <span className="float-end fw-medium">
                              {formatCurrency(formData.shipping_cost || 0)}
                            </span>
                          </div>
                          <div className="mb-2">
                            <span className="text-muted">Discount:</span>
                            <span className="float-end fw-medium text-danger">
                              -{formatCurrency(formData.discount || 0)}
                            </span>
                          </div>
                          
                          {/* Exchange Amount Line - Only show if exchange is enabled */}
                          {formData.is_exchange && (
                            <div className="mb-2">
                              <span className="text-muted">Exchange Amount:</span>
                              <span className="float-end fw-medium text-warning">
                                -{formatCurrency(formData.exchange_amount || 0)}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="col-6">
                          <div className="mb-2">
                            <span className="fw-bold fs-5">Grand Total:</span>
                            <span className="float-end fw-bold fs-5 text-primary">
                              {formatCurrency(formData.total_amount || 0)}
                            </span>
                          </div>
                          
                          {/* Show breakdown if exchange is enabled */}
                          {formData.is_exchange && (
                            <div className="mt-3 pt-2 border-top">
                              <div className="small text-muted mb-1">
                                <span>Before Exchange:</span>
                                <span className="float-end">
                                  {formatCurrency(calculateBeforeExchangeTotal())}
                                </span>
                              </div>
                              <div className="small text-muted">
                                <span>Less Exchange:</span>
                                <span className="float-end text-warning">
                                  -{formatCurrency(formData.exchange_amount || 0)}
                                </span>
                              </div>
                            </div>
                          )}
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