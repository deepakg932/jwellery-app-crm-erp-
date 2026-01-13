import React, { useState, useEffect, useRef } from "react";
import { FiUpload, FiCalendar, FiSearch, FiX, FiTrash2 } from "react-icons/fi";
import useStockIn from "@/hooks/useStockIn";

const EditPurchaseReceived = ({ onClose, onSave, stockIn, loading = false }) => {
  const { purchaseOrders, loadingPurchaseOrders } = useStockIn();

  const currencies = [
    { code: "INR", name: "Indian Rupee", symbol: "₹" },
    { code: "USD", name: "US Dollar", symbol: "$" },
    { code: "EUR", name: "Euro", symbol: "€" },
    { code: "GBP", name: "British Pound", symbol: "£" },
  ];

  const [formData, setFormData] = useState({
    po_id: "",
    supplier_id: "",
    supplier_name: "",
    branch_id: "",
    branch_name: "",
    received_date: new Date().toISOString().split("T")[0],
    items: [],
    remarks: "",
    total_cost: 0,
    status: "received",
  });

  console.log("Editing stock in:", stockIn);
  console.log("Purchase Orders:", purchaseOrders);

  const [errors, setErrors] = useState({});
  const [selectedPO, setSelectedPO] = useState(null);
  const [poSearchQuery, setPoSearchQuery] = useState("");
  const [poSearchResults, setPoSearchResults] = useState([]);
  const [showPoSearchResults, setShowPoSearchResults] = useState(false);
  const poSearchRef = useRef(null);

  // Initialize form data when stockIn prop changes
  useEffect(() => {
    if (stockIn) {
      console.log("Initializing form with stockIn:", stockIn);
      
      // Get supplier name
      let supplierName = "";
      if (stockIn.supplier_id) {
        if (typeof stockIn.supplier_id === 'object') {
          supplierName = stockIn.supplier_id.supplier_name || stockIn.supplier_id.name || "";
        }
      }
      
      // Get branch name
      let branchName = "";
      if (stockIn.branch_id) {
        if (typeof stockIn.branch_id === 'object') {
          branchName = stockIn.branch_id.name || "";
        }
      }
      
      // Format items data
      const itemsData = stockIn.items?.map(item => {
        const inventoryItem = item.inventory_item_id || {};
        const unit = item.unit_id || {};
        
        return {
          po_item_id: item.po_item_id || null,
          inventory_item_id: inventoryItem._id || item.inventory_item_id || "",
          inventory_item_name: inventoryItem.name || "Unknown Item",
          sku_code: inventoryItem.item_code || "N/A",
          ordered_quantity: item.ordered_quantity || 0,
          ordered_weight: item.ordered_weight || 0,
          unit_id: unit._id || item.unit_id || "",
          unit_name: unit.name || "pcs",
          unit_code: unit.code || "",
          rate: item.cost || 0,
          total: item.total_cost || 0,

          // Only received fields (removed quantity and weight)
          received_quantity: item.received_quantity || "",
          received_weight: item.received_weight || "",
          cost: item.cost || 0,
        };
      }) || [];

      console.log("Initialized items:", itemsData);

      setFormData({
        po_id: stockIn.po_id?._id || stockIn.po_id || "",
        supplier_id: stockIn.supplier_id?._id || stockIn.supplier_id || "",
        supplier_name: supplierName,
        branch_id: stockIn.branch_id?._id || stockIn.branch_id || "",
        branch_name: branchName,
        received_date: stockIn.received_date ? 
                      new Date(stockIn.received_date).toISOString().split('T')[0] : 
                      new Date().toISOString().split('T')[0],
        items: itemsData,
        remarks: stockIn.remarks || "",
        total_cost: stockIn.total_cost || 0,
        status: stockIn.status || "received",
      });

      // Find and set the selected PO if exists
      if (stockIn.po_id) {
        const poId = stockIn.po_id._id || stockIn.po_id;
        const foundPO = purchaseOrders.find(p => p._id === poId);
        if (foundPO) {
          console.log("Found PO for editing:", foundPO);
          setSelectedPO(foundPO);
        }
      }
    }
  }, [stockIn, purchaseOrders]);

  // Handle purchase order search
  const handlePOSearch = (query) => {
    setPoSearchQuery(query);

    if (query.trim() === "") {
      setPoSearchResults([]);
      setShowPoSearchResults(false);
      return;
    }

    // Filter purchase orders by PO number or supplier name
    const results = purchaseOrders.filter(
      (po) =>
        (po.po_number &&
          po.po_number.toLowerCase().includes(query.toLowerCase())) ||
        (po.reference_no &&
          po.reference_no.toLowerCase().includes(query.toLowerCase())) ||
        (po.supplier?.name &&
          po.supplier.name.toLowerCase().includes(query.toLowerCase())) ||
        (po.supplier?.supplier_name &&
          po.supplier.supplier_name.toLowerCase().includes(query.toLowerCase()))
    );

    // Only show approved or draft POs
    const filteredResults = results.filter(
      (po) => po.status === "approved" || po.status === "draft"
    );

    setPoSearchResults(filteredResults);
    setShowPoSearchResults(true);
  };

  // Handle purchase order selection
  const handlePOSelect = (po) => {
    setSelectedPO(po);

    // Extract supplier and branch from PO response
    const supplierId = po.supplier?._id || "";
    const supplierName = po.supplier?.name || po.supplier?.supplier_name || "";
    const branchId = po.branch?._id || "";
    const branchName = po.branch?.name || "";

    setFormData((prev) => ({
      ...prev,
      po_id: po._id,
      supplier_id: supplierId,
      supplier_name: supplierName,
      branch_id: branchId,
      branch_name: branchName,
    }));

    // Auto-populate items from PO
    const poItems =
      po.items?.map((item) => {
        const inventoryItem = item.inventory_item;
        const unit = item.unit;

        return {
          po_item_id: item._id,
          inventory_item_id: inventoryItem?._id || "",
          inventory_item_name: inventoryItem?.name || "Unknown Item",
          sku_code: inventoryItem?.item_code || "N/A",
          ordered_quantity: item.quantity || 0,
          ordered_weight: item.weight || 0,
          unit_id: unit?._id || "",
          unit_name: unit?.name || "pcs",
          unit_code: unit?.code || "",
          rate: item.rate || 0,
          total: item.total || 0,

          // Only received fields (removed quantity and weight)
          received_quantity: "",
          received_weight: "",
          cost: item.rate || 0,
        };
      }) || [];

    setFormData((prev) => ({
      ...prev,
      items: poItems,
      total_cost: calculateTotalCost(poItems),
    }));

    setPoSearchQuery("");
    setShowPoSearchResults(false);
    setPoSearchResults([]);
  };

  // Clear selected PO
  const handleClearPO = () => {
    setSelectedPO(null);
    setFormData((prev) => ({
      ...prev,
      po_id: "",
      supplier_id: "",
      supplier_name: "",
      branch_id: "",
      branch_name: "",
      items: [],
      total_cost: 0,
    }));
    setPoSearchQuery("");
  };

  // Status options for purchase
  const purchaseStatusOptions = [
    { value: "pending", label: "Pending", color: "bg-warning" },
    {
      value: "partially_received",
      label: "Partially Received",
      color: "bg-info",
    },
    { value: "received", label: "Received", color: "bg-success" },
    { value: "cancelled", label: "Cancelled", color: "bg-danger" },
  ];

  const calculateItemTotalCost = (item) => {
    const receivedQty = parseFloat(item.received_quantity) || 0;
    const receivedWeight = parseFloat(item.received_weight) || 0;
    const cost = parseFloat(item.cost) || 0;

    // Use whichever has value: received_quantity or received_weight
    let amount = receivedQty > 0 ? receivedQty : receivedWeight;
    return amount * cost;
  };

  const calculateTotalCost = (items) => {
    return items.reduce((total, item) => {
      return total + (parseFloat(item.total) || 0);
    }, 0);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.supplier_id) {
      newErrors.supplier_id = "Supplier is required";
    }

    if (!formData.branch_id) {
      newErrors.branch_id = "Branch is required";
    }

    if (!formData.received_date) {
      newErrors.received_date = "Received Date is required";
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

      // Check for either received_quantity or received_weight field
      const hasReceivedQty = item.received_quantity && parseFloat(item.received_quantity) > 0;
      const hasReceivedWeight = item.received_weight && parseFloat(item.received_weight) > 0;
      const hasUnit = item.unit_id;

      if (!hasReceivedQty && !hasReceivedWeight) {
        newErrors[`items[${originalIndex}].received_qty_weight`] =
          "Received Quantity or Received Weight is required";
      }

      if (!hasUnit) {
        newErrors[`items[${originalIndex}].unit_id`] = "Unit is required";
      }

      if (!item.cost || parseFloat(item.cost) <= 0) {
        newErrors[`items[${originalIndex}].rate`] = "Valid rate is required";
      }

      // Validate received quantity/weight against ordered
      if (item.received_quantity !== undefined && item.received_quantity !== "") {
        const rq = parseFloat(item.received_quantity);
        if (Number.isNaN(rq) || rq < 0) {
          newErrors[`items[${originalIndex}].received_quantity`] =
            "Received quantity must be a non-negative number";
        }
        if (item.ordered_quantity && rq > parseFloat(item.ordered_quantity)) {
          newErrors[
            `items[${originalIndex}].received_quantity`
          ] = `Cannot exceed ordered quantity (${item.ordered_quantity})`;
        }
      }

      if (item.received_weight !== undefined && item.received_weight !== "") {
        const rw = parseFloat(item.received_weight);
        if (Number.isNaN(rw) || rw < 0) {
          newErrors[`items[${originalIndex}].received_weight`] =
            "Received weight must be a non-negative number";
        }
        if (item.ordered_weight && rw > parseFloat(item.ordered_weight)) {
          newErrors[
            `items[${originalIndex}].received_weight`
          ] = `Cannot exceed ordered weight (${item.ordered_weight})`;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    const currentItem = updatedItems[index];

    updatedItems[index] = {
      ...currentItem,
      [field]: value,
    };

    // For rate changes, recalculate total
    if (field === "rate" || field === "cost") {
      const hasReceivedQty = parseFloat(currentItem.received_quantity) > 0;
      const hasReceivedWeight = parseFloat(currentItem.received_weight) > 0;
      const hasUnit = currentItem.unit_id;

      // Calculate total only if we have (received_quantity OR received_weight) AND unit AND rate
      if ((hasReceivedQty || hasReceivedWeight) && hasUnit && parseFloat(value) > 0) {
        const receivedQty = parseFloat(currentItem.received_quantity) || 0;
        const receivedWeight = parseFloat(currentItem.received_weight) || 0;
        const amount = receivedQty > 0 ? receivedQty : receivedWeight;
        updatedItems[index].total = amount * parseFloat(value);
      } else {
        updatedItems[index].total = 0;
      }
    }

    // For received_quantity/received_weight changes, recalculate total
    if (field === "received_quantity" || field === "received_weight") {
      const hasUnit = currentItem.unit_id;
      const hasRate = parseFloat(currentItem.rate) > 0;
      const hasValue = parseFloat(value) > 0;

      if (hasUnit && hasRate && hasValue) {
        const amount = parseFloat(value);
        updatedItems[index].total = amount * parseFloat(currentItem.rate);
      } else {
        updatedItems[index].total = 0;
      }
    }

    setFormData((prev) => ({
      ...prev,
      items: updatedItems,
      total_cost: calculateTotalCost(updatedItems),
    }));

    // Clear specific errors when field is updated
    if (errors[`items[${index}].${field}`]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`items[${index}].${field}`];
        return newErrors;
      });
    }
    if (errors[`items[${index}].received_qty_weight`]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`items[${index}].received_qty_weight`];
        return newErrors;
      });
    }
  };

  const handleReceivedQtyWeightChange = (index, value, isQuantity = true) => {
    const item = formData.items[index];
    const field = isQuantity ? "received_quantity" : "received_weight";
    const otherField = isQuantity ? "received_weight" : "received_quantity";

    // Update the appropriate field and clear the other
    const updatedItems = [...formData.items];
    updatedItems[index] = {
      ...item,
      [field]: value,
      [otherField]: "", // Clear the other field
    };

    // Only calculate total if unit is selected and rate exists
    if (value && item.unit_id && parseFloat(item.rate) > 0) {
      updatedItems[index].total = parseFloat(value) * parseFloat(item.rate);
    } else {
      updatedItems[index].total = 0;
    }

    setFormData((prev) => ({
      ...prev,
      items: updatedItems,
      total_cost: calculateTotalCost(updatedItems),
    }));

    // Clear quantity/weight error if any
    if (errors[`items[${index}].received_qty_weight`]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`items[${index}].received_qty_weight`];
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
  };

  // Remove item row
  const removeItem = (index) => {
    if (formData.items.length > 1) {
      const updatedItems = formData.items.filter((_, i) => i !== index);
      setFormData((prev) => ({
        ...prev,
        items: updatedItems,
        total_cost: calculateTotalCost(updatedItems),
      }));
    }
  };

  // Clear item data
  const clearItem = (index) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = {
      inventory_item_id: "",
      received_quantity: "",
      received_weight: "",
      unit_id: "",
      rate: "",
      total: 0,
      item_code: "",
      item_name: "",
      discount: 0,
    };

    setFormData((prev) => ({
      ...prev,
      items: updatedItems,
      total_cost: calculateTotalCost(updatedItems),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Filter out empty items
    const validItems = formData.items.filter((item) => item.inventory_item_id);

    const payload = {
      po_id: formData.po_id || null,
      supplier_id: formData.supplier_id,
      branch_id: formData.branch_id,
      received_date: formData.received_date,
      items: validItems.map((item) => {
        // Only use received fields
        const receivedQty = parseFloat(item.received_quantity) || 0;
        const receivedWeight = parseFloat(item.received_weight) || 0;
        const orderedQty = parseFloat(item.ordered_quantity) || 0;
        const orderedWeight = parseFloat(item.ordered_weight) || 0;

        // Determine status based on received vs ordered
        let itemStatus = "pending";
        const ordered = orderedQty > 0 ? orderedQty : orderedWeight;
        const received = receivedQty > 0 ? receivedQty : receivedWeight;

        if (received > 0 && received < ordered) {
          itemStatus = "partially_received";
        } else if (received >= ordered) {
          itemStatus = "received";
        }

        return {
          po_item_id: item.po_item_id || null,
          inventory_item_id: item.inventory_item_id,
          ordered_quantity: orderedQty,
          ordered_weight: orderedWeight,
          quantity: null, // Set to null since we're only using received fields
          weight: null,   // Set to null since we're only using received fields
          unit_id: item.unit_id || null,
          unit_code: item.unit_code || null,
          unit_name: item.unit_name || null,
          cost: parseFloat(item.rate) || 0,
          total_cost: parseFloat(item.total) || 0,
          received_quantity: receivedQty,
          received_weight: receivedWeight,
          status: itemStatus,
        };
      }),
      remarks: formData.remarks || "",
      total_cost: parseFloat(formData.total_cost),
      status: formData.status,
    };

    console.log("Updating Received data:", payload);
    onSave(payload);
  };

  const handleClose = () => {
    onClose();
  };

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (poSearchRef.current && !poSearchRef.current.contains(event.target)) {
        setShowPoSearchResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Get selected items count
  const selectedItemsCount = formData.items.filter(
    (item) => item.inventory_item_id
  ).length;

  // Get currency symbol
  const getCurrencySymbol = () => {
    const currency = currencies.find((c) => c.code === "INR");
    return currency ? currency.symbol : "₹";
  };

  const isDisabled = loading || loadingPurchaseOrders;

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
            <h5 className="modal-title fw-bold fs-5">Edit Received Purchase</h5>
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
              {/* Basic Info Row */}
              <div className="row mb-4">
                {/* PO Reference - Search instead of select */}
                <div className="col-md-4 mb-3">
                  <label className="form-label fw-medium">
                    Purchase Order Reference
                  </label>
                  <div className="position-relative" ref={poSearchRef}>
                    <div className="input-group">
                      <span className="input-group-text">
                        <FiSearch size={16} />
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search PO by number, reference, or supplier..."
                        value={poSearchQuery}
                        onChange={(e) => handlePOSearch(e.target.value)}
                        disabled={isDisabled || selectedPO}
                      />
                      {selectedPO && (
                        <button
                          type="button"
                          className="input-group-text"
                          onClick={handleClearPO}
                          disabled={isDisabled}
                          title="Clear PO selection"
                        >
                          <FiX size={16} />
                        </button>
                      )}
                    </div>

                    {/* PO Search Results Dropdown */}
                    {showPoSearchResults && poSearchResults.length > 0 && (
                      <div
                        className="position-absolute w-100 bg-white border rounded shadow-lg mt-1 z-3"
                        style={{ maxHeight: "300px", overflowY: "auto" }}
                      >
                        {poSearchResults.map((po) => (
                          <div
                            key={po._id}
                            className="p-3 border-bottom cursor-pointer hover-bg-light"
                            onClick={() => handlePOSelect(po)}
                            style={{ cursor: "pointer" }}
                          >
                            <div className="fw-medium">
                              {po.po_number || `PO-${po._id?.substring(0, 8)}`}
                            </div>
                            <div className="small text-muted">
                              Supplier:{" "}
                              {po.supplier?.name || po.supplier?.supplier_name}{" "}
                              | Reference: {po.reference_no || "N/A"} | Total: ₹
                              {(
                                po.grand_total ||
                                po.total_amount ||
                                0
                              ).toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {!showPoSearchResults &&
                      poSearchQuery &&
                      poSearchResults.length === 0 && (
                        <div className="text-muted small mt-1">
                          No purchase orders found. Try a different search term.
                        </div>
                      )}
                  </div>
                </div>

                {/* Received Date */}
                <div className="col-md-4 mb-3">
                  <label className="form-label fw-medium">
                    Received Date <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <FiCalendar size={16} />
                    </span>
                    <input
                      type="date"
                      name="received_date"
                      className={`form-control ${
                        errors.received_date ? "is-invalid" : ""
                      }`}
                      value={formData.received_date}
                      onChange={handleChange}
                      disabled={isDisabled}
                      required
                    />
                  </div>
                  {errors.received_date && (
                    <div className="invalid-feedback d-block">
                      {errors.received_date}
                    </div>
                  )}
                </div>

                {/* Purchase Status */}
                <div className="col-md-4 mb-3">
                  <label className="form-label fw-medium">
                    Purchase Status <span className="text-danger">*</span>
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
                    {purchaseStatusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.status && (
                    <div className="invalid-feedback">{errors.status}</div>
                  )}
                </div>

                {/* Supplier - Read-only from PO */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-medium">
                    Supplier <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${
                      errors.supplier_id ? "is-invalid" : ""
                    } ${selectedPO ? "bg-light" : ""}`}
                    value={
                      selectedPO
                        ? `${
                            selectedPO.supplier?.name ||
                            selectedPO.supplier?.supplier_name
                          } (${selectedPO.supplier?.code || "No Code"})`
                        : formData.supplier_name || "Select a PO to auto-fill supplier"
                    }
                    readOnly
                    disabled={isDisabled}
                  />
                  <input
                    type="hidden"
                    name="supplier_id"
                    value={formData.supplier_id}
                  />
                  {errors.supplier_id && (
                    <div className="invalid-feedback">{errors.supplier_id}</div>
                  )}
                  {selectedPO && (
                    <div className="form-text">
                      Auto-filled from selected PO
                    </div>
                  )}
                </div>

                {/* Branch - Read-only from PO */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-medium">
                    Branch <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${
                      errors.branch_id ? "is-invalid" : ""
                    } ${selectedPO ? "bg-light" : ""}`}
                    value={
                      selectedPO
                        ? `${selectedPO.branch?.name} (${selectedPO.branch?.code})`
                        : formData.branch_name || "Select a PO to auto-fill branch"
                    }
                    readOnly
                    disabled={isDisabled}
                  />
                  <input
                    type="hidden"
                    name="branch_id"
                    value={formData.branch_id}
                  />
                  {errors.branch_id && (
                    <div className="invalid-feedback">{errors.branch_id}</div>
                  )}
                  {selectedPO && (
                    <div className="form-text">
                      Auto-filled from selected PO
                    </div>
                  )}
                </div>
              </div>

              {/* ITEMS SECTION */}
              <div className="border rounded-3 p-3 mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-bold mb-0">Received Items</h6>
                  <div className="text-muted small">
                    {selectedItemsCount} item(s) selected
                  </div>
                </div>

                {errors.items && (
                  <div className="alert alert-danger mb-3" role="alert">
                    {errors.items}
                  </div>
                )}

                {/* Order Table */}
                <div
                  className="table-responsive"
                  style={{ maxHeight: "400px", overflowY: "auto" }}
                >
                  <table className="table table-bordered align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th style={{ minWidth: "200px" }}>Product</th>
                        <th style={{ minWidth: "100px" }}>Ordered Qty/Wt</th>
                        <th style={{ minWidth: "100px" }}>Received Qty/Wt</th>
                        <th style={{ minWidth: "100px" }}>Unit</th>
                        <th style={{ minWidth: "100px" }}>Rate</th>
                        <th style={{ minWidth: "100px" }}>Total</th>
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

                          const orderedQty =
                            parseFloat(item.ordered_quantity) || 0;
                          const orderedWeight =
                            parseFloat(item.ordered_weight) || 0;
                          const receivedQty =
                            parseFloat(item.received_quantity) || 0;
                          const receivedWeight =
                            parseFloat(item.received_weight) || 0;

                          return (
                            <tr key={originalIndex}>
                              <td>
                                <div className="d-flex align-items-center">
                                  <div className="flex-grow-1">
                                    <div className="fw-medium">
                                      {item.inventory_item_name ||
                                        "Unnamed Product"}
                                    </div>
                                    <div className="small text-muted">
                                      {item.sku_code || "No code"}
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
                                <div className="form-control bg-light">
                                  {orderedQty > 0 ? orderedQty : orderedWeight}{" "}
                                  {item.unit_name}
                                </div>
                                <div className="small text-muted mt-1">
                                  {orderedQty > 0
                                    ? "Ordered Quantity"
                                    : "Ordered Weight"}
                                </div>
                              </td>
                              <td>
                                <input
                                  type="number"
                                  className={`form-control ${
                                    errors[
                                      `items[${originalIndex}].received_qty_weight`
                                    ]
                                      ? "is-invalid"
                                      : ""
                                  }`}
                                  placeholder={
                                    orderedQty > 0
                                      ? "Enter Received Quantity"
                                      : "Enter Received Weight"
                                  }
                                  value={receivedQty > 0 ? receivedQty : receivedWeight}
                                  onChange={(e) =>
                                    handleReceivedQtyWeightChange(
                                      originalIndex,
                                      e.target.value,
                                      orderedQty > 0
                                    )
                                  }
                                  disabled={isDisabled}
                                  min="0"
                                  max={
                                    orderedQty > 0 ? orderedQty : orderedWeight
                                  }
                                  step="0.001"
                                />
                                {errors[
                                  `items[${originalIndex}].received_qty_weight`
                                ] && (
                                  <div className="invalid-feedback d-block">
                                    {
                                      errors[
                                        `items[${originalIndex}].received_qty_weight`
                                      ]
                                    }
                                  </div>
                                )}
                                {(errors[
                                  `items[${originalIndex}].received_quantity`
                                ] ||
                                  errors[
                                    `items[${originalIndex}].received_weight`
                                  ]) && (
                                  <div className="invalid-feedback d-block">
                                    {errors[
                                      `items[${originalIndex}].received_quantity`
                                    ] ||
                                      errors[
                                        `items[${originalIndex}].received_weight`
                                      ]}
                                  </div>
                                )}
                              </td>
                              <td>
                                <div className="form-control bg-light">
                                  {item.unit_name || item.unit || "No unit"}
                                  {item.unit_code && ` (${item.unit_code})`}
                                </div>
                                <input
                                  type="hidden"
                                  name={`items[${originalIndex}].unit_id`}
                                  value={item.unit_id}
                                />
                                <div className="small text-muted mt-1">
                                  Auto-filled from PO
                                </div>
                              </td>
                              <td>
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
                            colSpan="7"
                            className="text-center py-5 text-muted"
                          >
                            <div className="d-flex flex-column align-items-center">
                              <FiSearch className="mb-2" size={32} />
                              <span className="fs-6">
                                {selectedPO
                                  ? "Search and add items from the PO above"
                                  : "Search and select a Purchase Order above to load items"}
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
                      <label className="form-label fw-medium">Remarks</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        placeholder="Additional notes for this Received..."
                        value={formData.remarks}
                        onChange={handleChange}
                        name="remarks"
                        disabled={isDisabled}
                      ></textarea>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="bg-light p-3 rounded-3">
                      <div className="row">
                        <div className="col-6">
                          <div className="mb-2">
                            <span className="text-muted">Total Items:</span>
                            <span className="float-end fw-medium">
                              {selectedItemsCount}
                            </span>
                          </div>
                          <div className="mb-2">
                            <span className="text-muted">Total Ordered:</span>
                            <span className="float-end fw-medium">
                              {(() => {
                                const totalOrdered = formData.items
                                  .filter((item) => item.inventory_item_id)
                                  .reduce((sum, item) => {
                                    const qty =
                                      parseFloat(item.ordered_quantity) || 0;
                                    const wt =
                                      parseFloat(item.ordered_weight) || 0;
                                    return sum + (qty > 0 ? qty : wt);
                                  }, 0);

                                return totalOrdered;
                              })()}
                            </span>
                          </div>
                          <div className="mb-2">
                            <span className="text-muted">Total Received:</span>
                            <span className="float-end fw-medium">
                              {(() => {
                                const totalReceived = formData.items
                                  .filter((item) => item.inventory_item_id)
                                  .reduce((sum, item) => {
                                    const qty = parseFloat(item.received_quantity) || 0;
                                    const wt = parseFloat(item.received_weight) || 0;
                                    return sum + (qty > 0 ? qty : wt);
                                  }, 0);

                                return totalReceived;
                              })()}
                            </span>
                          </div>
                          <div className="mb-2">
                            <span className="text-muted">Pending:</span>
                            <span className="float-end fw-medium">
                              {(() => {
                                const totalOrdered = formData.items
                                  .filter((item) => item.inventory_item_id)
                                  .reduce((sum, item) => {
                                    const qty =
                                      parseFloat(item.ordered_quantity) || 0;
                                    const wt =
                                      parseFloat(item.ordered_weight) || 0;
                                    return sum + (qty > 0 ? qty : wt);
                                  }, 0);

                                const totalReceived = formData.items
                                  .filter((item) => item.inventory_item_id)
                                  .reduce((sum, item) => {
                                    const qty = parseFloat(item.received_quantity) || 0;
                                    const wt = parseFloat(item.received_weight) || 0;
                                    return sum + (qty > 0 ? qty : wt);
                                  }, 0);

                                return totalOrdered - totalReceived;
                              })()}
                            </span>
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="mb-2">
                            <span className="fw-bold fs-5">Grand Total:</span>
                            <span className="float-end fw-bold fs-5 text-primary">
                              {getCurrencySymbol()}
                              {parseFloat(formData.total_cost || 0).toFixed(2)}
                            </span>
                          </div>
                          <div className="mb-2">
                            <span className="text-muted">Completion:</span>
                            <span className="float-end fw-medium">
                              {(() => {
                                const totalOrdered = formData.items
                                  .filter((item) => item.inventory_item_id)
                                  .reduce((sum, item) => {
                                    const qty =
                                      parseFloat(item.ordered_quantity) || 0;
                                    const wt =
                                      parseFloat(item.ordered_weight) || 0;
                                    return sum + (qty > 0 ? qty : wt);
                                  }, 0);

                                const totalReceived = formData.items
                                  .filter((item) => item.inventory_item_id)
                                  .reduce((sum, item) => {
                                    const qty = parseFloat(item.received_quantity) || 0;
                                    const wt = parseFloat(item.received_weight) || 0;
                                    return sum + (qty > 0 ? qty : wt);
                                  }, 0);

                                if (totalOrdered === 0) return "0%";
                                const percentage =
                                  (totalReceived / totalOrdered) * 100;
                                return `${percentage.toFixed(1)}%`;
                              })()}
                            </span>
                          </div>
                          <div className="mt-3 pt-2 border-top">
                            <div
                              className="progress"
                              style={{ height: "10px" }}
                            >
                              <div
                                className="progress-bar bg-success"
                                role="progressbar"
                                style={{
                                  width: `${(() => {
                                    const totalOrdered = formData.items
                                      .filter((item) => item.inventory_item_id)
                                      .reduce((sum, item) => {
                                        const qty =
                                          parseFloat(item.ordered_quantity) ||
                                          0;
                                        const wt =
                                          parseFloat(item.ordered_weight) || 0;
                                        return sum + (qty > 0 ? qty : wt);
                                      }, 0);

                                    const totalReceived = formData.items
                                      .filter((item) => item.inventory_item_id)
                                      .reduce((sum, item) => {
                                        const qty =
                                          parseFloat(item.received_quantity) || 0;
                                        const wt = parseFloat(item.received_weight) || 0;
                                        return sum + (qty > 0 ? qty : wt);
                                      }, 0);

                                    if (totalOrdered === 0) return "0";
                                    const percentage =
                                      (totalReceived / totalOrdered) * 100;
                                    return `${Math.min(percentage, 100)}%`;
                                  })()}`,
                                }}
                                aria-valuenow={(() => {
                                  const totalOrdered = formData.items
                                    .filter((item) => item.inventory_item_id)
                                    .reduce((sum, item) => {
                                      const qty =
                                        parseFloat(item.ordered_quantity) || 0;
                                      const wt =
                                        parseFloat(item.ordered_weight) || 0;
                                      return sum + (qty > 0 ? qty : wt);
                                    }, 0);

                                  const totalReceived = formData.items
                                    .filter((item) => item.inventory_item_id)
                                    .reduce((sum, item) => {
                                      const qty = parseFloat(item.received_quantity) || 0;
                                      const wt = parseFloat(item.received_weight) || 0;
                                      return sum + (qty > 0 ? qty : wt);
                                    }, 0);

                                  if (totalOrdered === 0) return 0;
                                  const percentage =
                                    (totalReceived / totalOrdered) * 100;
                                  return Math.min(percentage, 100);
                                })()}
                                aria-valuemin="0"
                                aria-valuemax="100"
                              ></div>
                            </div>
                          </div>
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
                disabled={isDisabled || selectedItemsCount === 0}
              >
                {loading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm"
                      aria-hidden="true"
                    ></span>
                    Updating Received...
                  </>
                ) : (
                  <>
                    <FiUpload size={16} />
                    Update Received
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

export default EditPurchaseReceived;