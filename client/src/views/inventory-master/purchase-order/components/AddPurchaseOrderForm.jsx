import React, { useState, useEffect, useRef } from "react";
import { FiUpload, FiTrash2, FiSearch, FiX, FiPlus } from "react-icons/fi";
import usePurchaseOrders from "@/hooks/usePurchaseOrders";

const AddPurchaseOrderForm = ({ onClose, onSave, loading = false }) => {
  const {
    suppliers,
    inventoryItems,
    units,
    branches,
    loadingSuppliers,
    loadingInventoryItems,
    loadingUnits,
    loadingBranches,
  } = usePurchaseOrders();

  const [formData, setFormData] = useState({
    supplier_id: "",
    order_date: new Date().toISOString().split("T")[0],
    items: [
      {
        inventory_item_id: "",
        quantity: "",
        weight: "",
        unit_id: "",
        rate: "",
        total: 0,
        expected_date: "",
        item_code: "",
        item_name: "",
        purchase_price: 0,
        profit_margin: 0,
        discount: 0,
        tax: 0,
        selling_price: 0,
        discount_amount: 0,
        tax_amount: 0,
        final_price: 0,
      },
    ],
    notes: "",
    total_amount: 0,
    vat: 0,
    discount: 0,
    shipping_cost: 0, // Add shipping cost
    subtotal: 0,
    grand_total: 0,
    payment_status: "pending",
    reference_no: "",
    exchange_rate: 1,
    currency: "INR",
    branch_id: "",
  });

  const [errors, setErrors] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef(null);

  // Currency options
  const currencies = [
    { code: "INR", name: "Indian Rupee", symbol: "₹" },
    { code: "USD", name: "US Dollar", symbol: "$" },
    { code: "EUR", name: "Euro", symbol: "€" },
    { code: "GBP", name: "British Pound", symbol: "£" },
  ];

  // Helper function to get selected item details
  const getSelectedItemDetails = (itemId) => {
    if (!itemId) return null;
    return inventoryItems.find((item) => item._id === itemId);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.supplier_id) {
      newErrors.supplier_id = "Supplier is required";
    }

    if (!formData.order_date) {
      newErrors.order_date = "Order date is required";
    }

    if (!formData.branch_id) {
      newErrors.branch_id = "Branch is required";
    }

    if (!formData.currency) {
      newErrors.currency = "Currency is required";
    }

    if (!formData.exchange_rate || parseFloat(formData.exchange_rate) <= 0) {
      newErrors.exchange_rate = "Valid exchange rate is required";
    }

    // Filter only items that have inventory_item_id (selected items)
    const selectedItems = formData.items.filter(
      (item) => item.inventory_item_id
    );

    if (selectedItems.length === 0) {
      newErrors.items = "At least one item is required";
    }

    selectedItems.forEach((item, index) => {
      const originalIndex = formData.items.findIndex(
        (i) => i.inventory_item_id === item.inventory_item_id
      );

      // Check for either quantity or weight field
      const hasQuantity = item.quantity && parseFloat(item.quantity) > 0;
      const hasWeight = item.weight && parseFloat(item.weight) > 0;
      const hasUnit = item.unit_id;

      if (!hasQuantity && !hasWeight) {
        newErrors[`items[${originalIndex}].quantity_weight`] =
          "Quantity or Weight is required";
      }

      if (!hasUnit) {
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getUnitConversionFactor = (unitId) => {
    if (!unitId) return 1;
    const unit = units.find((u) => u._id === unitId);
    return unit?.conversion_factor || 1;
  };

  const calculateItemTotal = (quantity, weight, rate, unitId) => {
    const qty = parseFloat(quantity) || 0;
    const wt = parseFloat(weight) || 0;
    const rt = parseFloat(rate) || 0;
    const conversionFactor = getUnitConversionFactor(unitId);

    // Return 0 if no quantity/weight OR no unit selected
    if ((qty <= 0 && wt <= 0) || !unitId) {
      return 0;
    }

    // Use whichever has value: quantity or weight
    let amount = qty > 0 ? qty : wt;

    // Apply unit conversion factor
    amount = amount * conversionFactor;

    return amount * rt;
  };

  const calculateTotals = () => {
    // Calculate item total based on quantity or weight, rate, and unit conversion
    const itemTotal = formData.items
      .filter((item) => item.inventory_item_id)
      .reduce((total, item) => {
        return (
          total +
          calculateItemTotal(
            item.quantity,
            item.weight,
            item.rate,
            item.unit_id
          )
        );
      }, 0);

    // Calculate VAT, Discount, and Shipping Cost
    const vatAmount = (itemTotal * (parseFloat(formData.vat) || 0)) / 100;
    const discountAmount = parseFloat(formData.discount) || 0;
    const shippingCost = parseFloat(formData.shipping_cost) || 0;

    const subtotal = itemTotal;
    const grandTotal = itemTotal + vatAmount - discountAmount + shippingCost;

    setFormData((prev) => ({
      ...prev,
      total_amount: itemTotal,
      subtotal: subtotal,
      grand_total: grandTotal,
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
    const selectedItemIds = formData.items
      .filter((item) => item.inventory_item_id)
      .map((item) => item.inventory_item_id);

    const results = inventoryItems.filter(
      (item) =>
        ((item.name && item.name.toLowerCase().includes(query.toLowerCase())) ||
          (item.item_code &&
            item.item_code.toLowerCase().includes(query.toLowerCase()))) &&
        !selectedItemIds.includes(item._id)
    );

    setSearchResults(results);
    setShowSearchResults(true);
  };

  // Handle item selection from search results
  const handleItemSelect = (item) => {
    // Find the first empty item slot or add a new one
    let itemIndex = formData.items.findIndex((item) => !item.inventory_item_id);

    if (itemIndex === -1) {
      // Add new item row
      itemIndex = formData.items.length;
      setFormData((prev) => ({
        ...prev,
        items: [
          ...prev.items,
          {
            inventory_item_id: "",
            quantity: "",
            weight: "",
            unit_id: "",
            rate: "",
            total: 0,
            expected_date: "",
            item_code: "",
            item_name: "",
            purchase_price: 0,
            profit_margin: 0,
            discount: 0,
            tax: 0,
            selling_price: 0,
            discount_amount: 0,
            tax_amount: 0,
            final_price: 0,
          },
        ],
      }));
    }

    // Safely extract values with null checks
    const inventoryData = {
      purchase_price: parseFloat(item.purchase_price) || 0,
      profit_margin: parseFloat(item.profit_margin) || 0,
      discount: parseFloat(item.discount) || 0,
      tax: parseFloat(item.tax) || 0,
      selling_price: parseFloat(item.selling_price) || 0,
      discount_amount: parseFloat(item.discount_amount) || 0,
      tax_amount: parseFloat(item.tax_amount) || 0,
      final_price: parseFloat(item.final_price) || 0,
    };

    // Update the item with data from the selected inventory item
    const updatedItems = [...formData.items];
    updatedItems[itemIndex] = {
      ...updatedItems[itemIndex],
      inventory_item_id: item._id,
      item_code: item.item_code || "",
      item_name: item.name || "",
      purchase_price: inventoryData.purchase_price,
      profit_margin: inventoryData.profit_margin,
      discount: inventoryData.discount,
      tax: inventoryData.tax,
      selling_price: inventoryData.selling_price,
      discount_amount: inventoryData.discount_amount,
      tax_amount: inventoryData.tax_amount,
      final_price: inventoryData.final_price,
      rate: inventoryData.purchase_price,
      quantity: "",
      weight: "",
      unit_id: "",
      total: 0, // Set total to 0 initially
    };

    setFormData((prev) => ({
      ...prev,
      items: updatedItems,
    }));

    setSearchQuery("");
    setShowSearchResults(false);
    setSearchResults([]);

    // Recalculate totals
    calculateTotals();
  };

  const handleUnitChange = (index, unitId) => {
    const updatedItems = [...formData.items];
    const currentItem = updatedItems[index];

    // Only calculate if quantity/weight is entered
    const hasQuantity = parseFloat(currentItem.quantity) > 0;
    const hasWeight = parseFloat(currentItem.weight) > 0;

    updatedItems[index] = {
      ...currentItem,
      unit_id: unitId,
    };

    // Recalculate total for this item only if quantity/weight exists
    if (
      (hasQuantity || hasWeight) &&
      unitId &&
      parseFloat(currentItem.rate) > 0
    ) {
      updatedItems[index].total = calculateItemTotal(
        currentItem.quantity,
        currentItem.weight,
        currentItem.rate,
        unitId
      );
    } else {
      updatedItems[index].total = 0;
    }

    setFormData((prev) => ({
      ...prev,
      items: updatedItems,
    }));

    // Recalculate all totals
    calculateTotals();

    // Clear unit error if any
    if (errors[`items[${index}].unit_id`]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`items[${index}].unit_id`];
        return newErrors;
      });
    }
  };

  const handleQuantityWeightChange = (index, value) => {
    const item = formData.items[index];

    // Update quantity field (we'll use quantity as the single input)
    const updatedItems = [...formData.items];
    updatedItems[index] = {
      ...item,
      quantity: value,
      weight: "", // Clear weight field when using quantity
    };

    // Only calculate total if unit is selected
    if (value && item.unit_id && parseFloat(item.rate) > 0) {
      updatedItems[index].total = calculateItemTotal(
        value,
        "",
        item.rate,
        item.unit_id
      );
    } else {
      updatedItems[index].total = 0;
    }

    setFormData((prev) => ({
      ...prev,
      items: updatedItems,
    }));

    calculateTotals();

    // Clear quantity/weight error if any
    if (errors[`items[${index}].quantity_weight`]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`items[${index}].quantity_weight`];
        return newErrors;
      });
    }
  };

  useEffect(() => {
    if (units && units.length > 0) {
      calculateTotals();
    }
  }, [units]);

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    const currentItem = updatedItems[index];

    updatedItems[index] = {
      ...currentItem,
      [field]: value,
    };

    // For rate changes, check if we can calculate total
    if (field === "rate") {
      const hasQuantity = parseFloat(currentItem.quantity) > 0;
      const hasWeight = parseFloat(currentItem.weight) > 0;
      const hasUnit = currentItem.unit_id;

      // Calculate total only if we have (quantity OR weight) AND unit AND rate
      if ((hasQuantity || hasWeight) && hasUnit && parseFloat(value) > 0) {
        updatedItems[index].total = calculateItemTotal(
          currentItem.quantity,
          currentItem.weight,
          value,
          currentItem.unit_id
        );
      } else {
        updatedItems[index].total = 0;
      }
    }

    setFormData((prev) => ({
      ...prev,
      items: updatedItems,
    }));

    calculateTotals();

    // Clear specific errors when field is updated
    if (errors[`items[${index}].${field}`]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`items[${index}].${field}`];
        return newErrors;
      });
    }
    if (errors[`items[${index}].quantity_weight`]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`items[${index}].quantity_weight`];
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

    // Recalculate totals for VAT, Discount, Shipping Cost, or Exchange Rate changes
    if (
      name === "vat" ||
      name === "discount" ||
      name === "shipping_cost" ||
      name === "exchange_rate"
    ) {
      setTimeout(() => calculateTotals(), 0);
    }
  };

  // Add new item row manually
  // const addItem = () => {
  //   setFormData((prev) => ({
  //     ...prev,
  //     items: [
  //       ...prev.items,
  //       {
  //         inventory_item_id: "",
  //         quantity: "",
  //         weight: "",
  //         unit_id: "",
  //         rate: "",
  //         total: 0,
  //         expected_date: "",
  //         item_code: "",
  //         item_name: "",
  //         purchase_price: 0,
  //         profit_margin: 0,
  //         discount: 0,
  //         tax: 0,
  //         selling_price: 0,
  //         discount_amount: 0,
  //         tax_amount: 0,
  //         final_price: 0,
  //       },
  //     ],
  //   }));
  // };

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
      inventory_item_id: "",
      quantity: "",
      weight: "",
      unit_id: "",
      rate: "",
      total: 0,
      expected_date: "",
      item_code: "",
      item_name: "",
      purchase_price: 0,
      profit_margin: 0,
      discount: 0,
      tax: 0,
      selling_price: 0,
      discount_amount: 0,
      tax_amount: 0,
      final_price: 0,
    };

    setFormData((prev) => ({
      ...prev,
      items: updatedItems,
    }));

    calculateTotals();
  };

  useEffect(() => {
    calculateTotals();
  }, [formData.vat, formData.discount, formData.shipping_cost, formData.items, formData.exchange_rate]);

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
      supplier_id: formData.supplier_id,
      order_date: formData.order_date,
      items: formData.items
        .filter((item) => item.inventory_item_id)
        .map((item) => ({
          inventory_item_id: item.inventory_item_id,
          quantity: parseFloat(item.quantity) || 0,
          weight: parseFloat(item.weight) || 0,
          unit_id: item.unit_id,
          rate: parseFloat(item.rate) || 0,
          total: parseFloat(item.total) || 0,
          expected_date: item.expected_date || null,
          item_code: item.item_code,
          item_name: item.item_name,
          purchase_price: parseFloat(item.purchase_price) || 0,
          profit_margin: parseFloat(item.profit_margin) || 0,
          discount: parseFloat(item.discount) || 0,
          tax: parseFloat(item.tax) || 0,
          selling_price: parseFloat(item.selling_price) || 0,
          discount_amount: parseFloat(item.discount_amount) || 0,
          tax_amount: parseFloat(item.tax_amount) || 0,
          final_price: parseFloat(item.final_price) || 0,
        })),
      notes: formData.notes,
      total_amount: parseFloat(formData.total_amount) || 0,
      vat: parseFloat(formData.vat) || 0,
      discount: parseFloat(formData.discount) || 0,
      shipping_cost: parseFloat(formData.shipping_cost) || 0,
      subtotal: parseFloat(formData.subtotal) || 0,
      grand_total: parseFloat(formData.grand_total) || 0,
      payment_status: formData.payment_status,
      reference_no: formData.reference_no,
      exchange_rate: parseFloat(formData.exchange_rate) || 1,
      currency: formData.currency,
      branch_id: formData.branch_id,
    };

    console.log("Submitting purchase order data:", payload);
    onSave(payload);

    // Reset form
    setFormData({
      supplier_id: "",
      order_date: new Date().toISOString().split("T")[0],
      items: [
        {
          inventory_item_id: "",
          quantity: "",
          weight: "",
          unit_id: "",
          rate: "",
          total: 0,
          expected_date: "",
          item_code: "",
          item_name: "",
          purchase_price: 0,
          profit_margin: 0,
          discount: 0,
          tax: 0,
          selling_price: 0,
          discount_amount: 0,
          tax_amount: 0,
          final_price: 0,
        },
      ],
      notes: "",
      total_amount: 0,
      vat: 0,
      discount: 0,
      shipping_cost: 0,
      subtotal: 0,
      grand_total: 0,
      payment_status: "pending",
      reference_no: "",
      exchange_rate: 1,
      currency: "INR",
      branch_id: "",
    });
    setSearchQuery("");
    setSearchResults([]);
    setErrors({});
  };

  const handleClose = () => {
    setFormData({
      supplier_id: "",
      order_date: new Date().toISOString().split("T")[0],
      items: [
        {
          inventory_item_id: "",
          quantity: "",
          weight: "",
          unit_id: "",
          rate: "",
          total: 0,
          expected_date: "",
          item_code: "",
          item_name: "",
          purchase_price: 0,
          profit_margin: 0,
          discount: 0,
          tax: 0,
          selling_price: 0,
          discount_amount: 0,
          tax_amount: 0,
          final_price: 0,
        },
      ],
      notes: "",
      total_amount: 0,
      vat: 0,
      discount: 0,
      shipping_cost: 0,
      subtotal: 0,
      grand_total: 0,
      payment_status: "pending",
      reference_no: "",
      exchange_rate: 1,
      currency: "INR",
      branch_id: "",
    });
    setSearchQuery("");
    setSearchResults([]);
    setErrors({});
    onClose();
  };

  const isDisabled =
    loading ||
    loadingSuppliers ||
    loadingInventoryItems ||
    loadingUnits ||
    loadingBranches;

  // Get currency symbol
  const getCurrencySymbol = () => {
    const currency = currencies.find((c) => c.code === formData.currency);
    return currency ? currency.symbol : "₹";
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
            <h5 className="modal-title fw-bold fs-5">Add Purchase Order</h5>
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
              {/* Top Row - New Fields */}
              <div className="row mb-4">
                <div className="col-md-3 mb-3">
                  <label className="form-label fw-medium">
                    Order Date <span className="text-danger">*</span>
                  </label>
                  <input
                    type="date"
                    name="order_date"
                    className={`form-control ${
                      errors.order_date ? "is-invalid" : ""
                    }`}
                    value={formData.order_date}
                    onChange={handleChange}
                    disabled={isDisabled}
                  />
                  {errors.order_date && (
                    <div className="invalid-feedback">{errors.order_date}</div>
                  )}
                </div>

                <div className="col-md-3 mb-3">
                  <label className="form-label fw-medium">
                    Currency <span className="text-danger">*</span>
                  </label>
                  <select
                    name="currency"
                    className={`form-select ${
                      errors.currency ? "is-invalid" : ""
                    }`}
                    value={formData.currency}
                    onChange={handleChange}
                    disabled={isDisabled}
                  >
                    <option value="">Select Currency</option>
                    {currencies.map((currency) => (
                      <option key={currency.code} value={currency.code}>
                        {currency.name} ({currency.symbol})
                      </option>
                    ))}
                  </select>
                  {errors.currency && (
                    <div className="invalid-feedback">{errors.currency}</div>
                  )}
                </div>

                <div className="col-md-3 mb-3">
                  <label className="form-label fw-medium">
                    Exchange Rate <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    name="exchange_rate"
                    className={`form-control ${
                      errors.exchange_rate ? "is-invalid" : ""
                    }`}
                    value={formData.exchange_rate}
                    onChange={handleChange}
                    disabled={isDisabled}
                    min="0"
                    step="0.01"
                    placeholder="1.0"
                  />
                  <small className="text-muted">
                    Rate to convert to base currency (INR)
                  </small>
                  {errors.exchange_rate && (
                    <div className="invalid-feedback">
                      {errors.exchange_rate}
                    </div>
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
                        <option key={branch.id} value={branch.id}>
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
              </div>

              {/* Second Row - Supplier and Amount Fields */}
              <div className="row mb-4">
                <div className="col-md-4 mb-3">
                  <label className="form-label fw-medium">
                    Supplier <span className="text-danger">*</span>
                  </label>
                  <select
                    name="supplier_id"
                    className={`form-select ${
                      errors.supplier_id ? "is-invalid" : ""
                    }`}
                    value={formData.supplier_id}
                    onChange={handleChange}
                    disabled={isDisabled}
                  >
                    <option value="">Select Supplier</option>
                    {suppliers?.map((supplier) => (
                      <option key={supplier._id} value={supplier._id}>
                        {supplier.name || supplier.supplier_name}
                      </option>
                    ))}
                  </select>
                  {errors.supplier_id && (
                    <div className="invalid-feedback">{errors.supplier_id}</div>
                  )}
                </div>

                {/* Discount Field */}
                <div className="col-md-4 mb-3">
                  <label className="form-label fw-medium">Discount</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      {getCurrencySymbol()}
                    </span>
                    <input
                      type="number"
                      className="form-control"
                      name="discount"
                      value={formData.discount}
                      onChange={handleChange}
                      disabled={isDisabled}
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>
                  <small className="text-muted">Flat discount amount</small>
                </div>

                {/* Shipping Cost Field */}
                <div className="col-md-4 mb-3">
                  <label className="form-label fw-medium">Shipping Cost</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      {getCurrencySymbol()}
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
                  <small className="text-muted">Additional shipping charges</small>
                  {errors.shipping_cost && (
                    <div className="invalid-feedback">{errors.shipping_cost}</div>
                  )}
                </div>
              </div>

              {/* Third Row - Totals and Reference */}
              <div className="row mb-4">
                <div className="col-md-4 mb-3">
                  <label className="form-label fw-medium">VAT (%)</label>
                  <div className="input-group">
                    <input
                      type="number"
                      className="form-control"
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
                  <small className="text-muted">Value Added Tax percentage</small>
                </div>

                <div className="col-md-4 mb-3">
                  <label className="form-label fw-medium">Grand Total</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      {getCurrencySymbol()}
                    </span>
                    <input
                      type="text"
                      className="form-control bg-light fw-bold"
                      value={formData.grand_total.toFixed(2)}
                      readOnly
                    />
                    <span className="input-group-text bg-light">
                      ≈ ₹
                      {(formData.grand_total * formData.exchange_rate).toFixed(
                        2
                      )}
                    </span>
                  </div>
                  <small className="text-muted">
                    Converted to base currency at {formData.exchange_rate}:1
                  </small>
                </div>

                <div className="col-md-4 mb-3">
                  <label className="form-label fw-medium">Reference No.</label>
                  <input
                    type="text"
                    className="form-control"
                    name="reference_no"
                    value={formData.reference_no}
                    onChange={handleChange}
                    disabled={isDisabled}
                    placeholder="PO-REF-001"
                  />
                </div>
              </div>

              {/* Order Table Section */}
              <div className="border rounded-3 p-3 mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-bold mb-0">Order Table</h6>
                  {/* <button
                    type="button"
                    className="btn btn-sm btn-primary d-flex align-items-center gap-1"
                    onClick={addItem}
                    disabled={isDisabled}
                  >
                    <FiPlus size={16} />
                    Add Item
                  </button> */}
                </div>

                {/* Search Bar Section */}
                <div className="mb-4">
                  <label className="form-label fw-medium">Select Product</label>
                  <div className="position-relative" ref={searchRef}>
                    <div className="input-group">
                      <span className="input-group-text">
                        <FiSearch size={16} />
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Please type product code and select"
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
                        {searchResults.map((item) => (
                          <div
                            key={item._id}
                            className="p-3 border-bottom cursor-pointer hover-bg-light"
                            onClick={() => handleItemSelect(item)}
                            style={{ cursor: "pointer" }}
                          >
                            <div className="fw-medium">{item.name}</div>
                            <div className="small text-muted">
                              Code: {item.item_code} | Category:{" "}
                              {item.category?.name || "N/A"}
                            </div>
                            <div className="mt-1">
                              <span className="text-primary fw-medium">
                                Purchase Price: {getCurrencySymbol()}
                                {parseFloat(item.purchase_price || 0).toFixed(
                                  2
                                )}
                              </span>
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

                {/* Order Table - Fixed CSS */}
                <div
                  className="table-responsive"
                  style={{ maxHeight: "400px", overflowY: "auto" }}
                >
                  <table className="table table-bordered align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th style={{ minWidth: "250px" }}>Product</th>
                        <th style={{ minWidth: "100px" }}>Qty/Weight</th>
                        <th style={{ minWidth: "120px" }}>Unit</th>
                        <th style={{ minWidth: "120px" }}>Net Unit Cost</th>
                        <th style={{ minWidth: "100px" }}>Profit Margin</th>
                        <th style={{ minWidth: "120px" }}>Product Price</th>
                        <th style={{ minWidth: "100px" }}>Discount</th>
                        <th style={{ minWidth: "100px" }}>Tax</th>
                        <th style={{ minWidth: "120px" }}>Subtotal</th>
                        <th style={{ minWidth: "60px" }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.items
                        .filter((item) => item.inventory_item_id)
                        .map((item, index) => {
                          const originalIndex = formData.items.findIndex(
                            (i) =>
                              i.inventory_item_id === item.inventory_item_id
                          );

                          return (
                            <tr key={originalIndex}>
                              <td>
                                <div className="d-flex align-items-center">
                                  <div className="flex-grow-1">
                                    <div className="fw-medium">
                                      {item.item_name || "Unnamed Product"}
                                    </div>
                                    <div className="small text-muted">
                                      {item.item_code || "No code"}
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
                                    errors[
                                      `items[${originalIndex}].quantity_weight`
                                    ]
                                      ? "is-invalid"
                                      : ""
                                  }`}
                                  placeholder="Enter Qty/Weight"
                                  value={item.quantity || item.weight || ""}
                                  onChange={(e) =>
                                    handleQuantityWeightChange(
                                      originalIndex,
                                      e.target.value
                                    )
                                  }
                                  disabled={isDisabled}
                                  min="0"
                                  step="0.001"
                                />
                                {errors[
                                  `items[${originalIndex}].quantity_weight`
                                ] && (
                                  <div className="invalid-feedback d-block">
                                    {
                                      errors[
                                        `items[${originalIndex}].quantity_weight`
                                      ]
                                    }
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
                                    handleUnitChange(
                                      originalIndex,
                                      e.target.value
                                    )
                                  }
                                  disabled={isDisabled}
                                >
                                  <option value="">Select Unit</option>
                                  {units?.map((unit) => (
                                    <option key={unit._id} value={unit._id}>
                                      {unit.code}
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
                                <input
                                  type="number"
                                  className={`form-control ${
                                    errors[`items[${originalIndex}].rate`]
                                      ? "is-invalid"
                                      : ""
                                  }`}
                                  placeholder="Cost"
                                  value={item.rate}
                                  onChange={(e) =>
                                    handleItemChange(
                                      originalIndex,
                                      "rate",
                                      e.target.value
                                    )
                                  }
                                  disabled={isDisabled}
                                  min="0"
                                  step="0.01"
                                />
                                {errors[`items[${originalIndex}].rate`] && (
                                  <div className="invalid-feedback d-block small">
                                    {errors[`items[${originalIndex}].rate`]}
                                  </div>
                                )}
                              </td>
                              <td>
                                <input
                                  type="text"
                                  className="form-control bg-light"
                                  value={`${parseFloat(
                                    item.profit_margin || 0
                                  ).toFixed(2)}%`}
                                  readOnly
                                />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  className="form-control bg-light"
                                  value={`${getCurrencySymbol()}${parseFloat(
                                    item.selling_price || 0
                                  ).toFixed(2)}`}
                                  readOnly
                                />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  className="form-control bg-light"
                                  value={`${getCurrencySymbol()}${parseFloat(
                                    item.discount_amount || 0
                                  ).toFixed(2)}`}
                                  readOnly
                                />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  className="form-control bg-light"
                                  value={`${getCurrencySymbol()}${parseFloat(
                                    item.tax_amount || 0
                                  ).toFixed(2)}`}
                                  readOnly
                                />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  className="form-control bg-light fw-medium"
                                  value={`${getCurrencySymbol()}${parseFloat(
                                    item.total || 0
                                  ).toFixed(2)}`}
                                  readOnly
                                />
                              </td>
                              <td className="text-center">
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => removeItem(originalIndex)}
                                  disabled={
                                    isDisabled ||
                                    formData.items.filter(
                                      (i) => i.inventory_item_id
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
                      {formData.items.filter((item) => item.inventory_item_id)
                        .length === 0 && (
                        <tr>
                          <td
                            colSpan="10"
                            className="text-center py-5 text-muted"
                          >
                            <div className="d-flex flex-column align-items-center">
                              <FiSearch className="mb-2" size={32} />
                              <span className="fs-6">
                                Search and select products from above to add
                                them to the order
                              </span>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Summary Section - Updated with Shipping Cost */}
                <div className="row mt-4">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label fw-medium">
                        Payment Status
                      </label>
                      <select
                        className="form-select"
                        value={formData.payment_status}
                        onChange={(e) => handleChange(e)}
                        name="payment_status"
                        disabled={isDisabled}
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="partial">Partial</option>
                      </select>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="bg-light p-3 rounded-3">
                      <div className="row">
                        <div className="col-6">
                          <div className="mb-2">
                            <span className="text-muted">
                              Total Qty/Weight:
                            </span>
                            <span className="float-end fw-medium">
                              {(() => {
                                const firstItemWithUnit = formData.items
                                  .filter(
                                    (item) =>
                                      item.inventory_item_id && item.unit_id
                                  )
                                  .find((item) => item.unit_id);

                                if (!firstItemWithUnit) return "0";

                                const unit = units.find(
                                  (u) => u._id === firstItemWithUnit.unit_id
                                );
                                const unitName = unit?.code || unit?.name || "";

                                const total = formData.items
                                  .filter((item) => item.inventory_item_id)
                                  .reduce((sum, item) => {
                                    const qty = parseFloat(item.quantity) || 0;
                                    const wt = parseFloat(item.weight) || 0;
                                    return sum + (qty > 0 ? qty : wt);
                                  }, 0);

                                return `${total} ${unitName}`;
                              })()}
                            </span>
                          </div>
                          <div className="mb-2">
                            <span className="text-muted">Subtotal:</span>
                            <span className="float-end fw-medium">
                              {getCurrencySymbol()}
                              {parseFloat(formData.subtotal || 0).toFixed(2)}
                            </span>
                          </div>
                          <div className="mb-2">
                            <span className="text-muted">
                              VAT ({formData.vat || 0}%):
                            </span>
                            <span className="float-end fw-medium">
                              {getCurrencySymbol()}
                              {(
                                (formData.subtotal *
                                  (parseFloat(formData.vat) || 0)) /
                                100
                              ).toFixed(2)}
                            </span>
                          </div>
                          <div className="mb-2">
                            <span className="text-muted">Discount:</span>
                            <span className="float-end fw-medium text-danger">
                              -{getCurrencySymbol()}
                              {parseFloat(formData.discount || 0).toFixed(2)}
                            </span>
                          </div>
                          <div className="mb-2">
                            <span className="text-muted">Shipping Cost:</span>
                            <span className="float-end fw-medium">
                              {getCurrencySymbol()}
                              {parseFloat(formData.shipping_cost || 0).toFixed(2)}
                            </span>
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="mb-2">
                            <span className="fw-bold fs-5">Grand Total:</span>
                            <span className="float-end fw-bold fs-5 text-primary">
                              {getCurrencySymbol()}
                              {parseFloat(formData.grand_total || 0).toFixed(2)}
                            </span>
                          </div>
                          <div className="mb-2">
                            <span className="text-muted">Exchange Rate:</span>
                            <span className="float-end fw-medium">
                              {formData.exchange_rate}:1
                            </span>
                          </div>
                          <div className="mb-2">
                            <span className="text-muted">In INR:</span>
                            <span className="float-end fw-medium">
                              ₹
                              {(
                                formData.grand_total * formData.exchange_rate
                              ).toFixed(2)}
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
                <h6 className="fw-bold mb-3">Notes (Amounts)</h6>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Additional notes about amounts..."
                  value={formData.notes}
                  onChange={handleChange}
                  name="notes"
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
                    Saving...
                  </>
                ) : (
                  <>
                    <FiUpload size={16} />
                    Create Purchase Order
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

export default AddPurchaseOrderForm;