import React, { useState, useEffect, useRef } from "react";
import {
  FiUpload,
  FiCalendar,
  FiSearch,
  FiX,
  FiTrash2,
  FiRotateCcw,
} from "react-icons/fi";
import usePurchaseReturn from "@/hooks/usePurchaseReturn";

const AddPurchaseReturnForm = ({ onClose, onSave, loading = false }) => {
  const { stockIns, loadingStockIns } = usePurchaseReturn();

  const [formData, setFormData] = useState({
    purchase_received_id: "",
    supplier_id: "",
    supplier_name: "",
    branch_id: "",
    branch_name: "",
    return_date: new Date().toISOString().split("T")[0],
    return_reason: "",
    items: [],
    remarks: "",
    total_cost: 0,
    status: "pending",
  });

  const [errors, setErrors] = useState({});
  const [selectedPurchaseReceived, setSelectedPurchaseReceived] =
    useState(null);
  const [purchaseReceivedSearchQuery, setPurchaseReceivedSearchQuery] =
    useState("");
  const [purchaseReceivedSearchResults, setPurchaseReceivedSearchResults] =
    useState([]);
  const [
    showPurchaseReceivedSearchResults,
    setShowPurchaseReceivedSearchResults,
  ] = useState(false);
  const purchaseReceivedSearchRef = useRef(null);

  // Return reasons
  const returnReasons = [
    "Damaged Goods",
    "Wrong Item",
    "Quality Issues",
    "Expired",
    "Over Supply",
    "Customer Return",
    "Other",
  ];

  // Status options
  const statusOptions = [
    { value: "pending", label: "Pending", color: "bg-warning" },
    { value: "approved", label: "Approved", color: "bg-success" },
    { value: "rejected", label: "Rejected", color: "bg-danger" },
    { value: "completed", label: "Completed", color: "bg-info" },
  ];

  // Handle Purchase Received search
  const handlePurchaseReceivedSearch = (query) => {
    setPurchaseReceivedSearchQuery(query);

    if (query.trim() === "") {
      setPurchaseReceivedSearchResults([]);
      setShowPurchaseReceivedSearchResults(false);
      return;
    }

    // Filter purchase received by PO number, supplier name, or reference
    const results = stockIns.filter(
      (pr) =>
        (pr.po_number &&
          pr.po_number.toLowerCase().includes(query.toLowerCase())) ||
        (pr.po_id?.po_number &&
          pr.po_id.po_number.toLowerCase().includes(query.toLowerCase())) ||
        (pr.supplier_id?.supplier_name &&
          pr.supplier_id.supplier_name
            .toLowerCase()
            .includes(query.toLowerCase())) ||
        (pr.supplier_id?.name &&
          pr.supplier_id.name.toLowerCase().includes(query.toLowerCase())) ||
        (pr.supplier_name &&
          pr.supplier_name.toLowerCase().includes(query.toLowerCase()))
    );

    setPurchaseReceivedSearchResults(results);
    setShowPurchaseReceivedSearchResults(true);
  };

  // Handle Purchase Received selection
  const handlePurchaseReceivedSelect = (purchaseReceived) => {
    setSelectedPurchaseReceived(purchaseReceived);

    // Extract supplier and branch from Purchase Received
    const supplierId =
      purchaseReceived.supplier_id?._id || purchaseReceived.supplier_id || "";
    const supplierName =
      purchaseReceived.supplier_id?.supplier_name ||
      purchaseReceived.supplier_id?.name ||
      purchaseReceived.supplier_name ||
      "";
    const branchId =
      purchaseReceived.branch_id?._id || purchaseReceived.branch_id || "";
    const branchName =
      purchaseReceived.branch_id?.branch_name ||
      purchaseReceived.branch_name ||
      "";

    setFormData((prev) => ({
      ...prev,
      purchase_received_id: purchaseReceived._id,
      supplier_id: supplierId,
      supplier_name: supplierName,
      branch_id: branchId,
      branch_name: branchName,
    }));

    // Auto-populate items from Purchase Received
    const purchaseReceivedItems =
      purchaseReceived.items?.map((item) => {
        const inventoryItem = item.inventory_item_id || {};
        const unit = item.unit_id || {};

        // Calculate available quantity (received - already returned)
        const receivedQty = parseFloat(item.received_quantity) || 0;
        const receivedWt = parseFloat(item.received_weight) || 0;
        const returnedQty = parseFloat(item.returned_quantity) || 0;
        const returnedWt = parseFloat(item.returned_weight) || 0;

        const availableQty = Math.max(0, receivedQty - returnedQty);
        const availableWt = Math.max(0, receivedWt - returnedWt);

        return {
          purchase_received_item_id: item._id,
          inventory_item_id: inventoryItem._id || item.inventory_item_id || "",
          inventory_item_name:
            inventoryItem.name || item.inventory_item_name || "Unknown Item",
          sku_code: inventoryItem.item_code || item.sku_code || "N/A",
          available_quantity: availableQty,
          available_weight: availableWt,
          received_quantity: receivedQty,
          received_weight: receivedWt,
          unit_id: unit._id || item.unit_id || "",
          unit_name: unit.name || item.unit_name || "pcs",
          unit_code: unit.code || item.unit_code || "",
          cost: parseFloat(item.cost) || parseFloat(item.rate) || 0,
          total: parseFloat(item.total_cost) || parseFloat(item.total) || 0,
          // Return fields
          return_quantity: "",
          return_weight: "",
          reason: "",
          status: "pending",
        };
      }) || [];

    setFormData((prev) => ({
      ...prev,
      items: purchaseReceivedItems,
      total_cost: 0, // Reset total as return will be calculated
    }));

    setPurchaseReceivedSearchQuery("");
    setShowPurchaseReceivedSearchResults(false);
    setPurchaseReceivedSearchResults([]);
  };

  // Clear selected Purchase Received
  const handleClearPurchaseReceived = () => {
    setSelectedPurchaseReceived(null);
    setFormData((prev) => ({
      ...prev,
      purchase_received_id: "",
      supplier_id: "",
      supplier_name: "",
      branch_id: "",
      branch_name: "",
      items: [],
      total_cost: 0,
    }));
    setPurchaseReceivedSearchQuery("");
  };

  const calculateItemTotalCost = (item) => {
    const returnQty = parseFloat(item.return_quantity) || 0;
    const returnWeight = parseFloat(item.return_weight) || 0;
    const cost = parseFloat(item.cost) || 0;

    let amount = returnQty > 0 ? returnQty : returnWeight;
    return amount * cost;
  };

  const calculateTotalCost = (items) => {
    return items.reduce((total, item) => {
      const itemTotal = parseFloat(item.total) || 0;
      return total + itemTotal;
    }, 0);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.purchase_received_id) {
      newErrors.purchase_received_id = "Purchase Received is required";
    }

    if (!formData.return_reason) {
      newErrors.return_reason = "Return reason is required";
    }

    if (!formData.return_date) {
      newErrors.return_date = "Return Date is required";
    }

    // Filter only items that have inventory_item_id
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

      // Check for return quantity/weight
      const hasReturnQty =
        item.return_quantity && parseFloat(item.return_quantity) > 0;
      const hasReturnWeight =
        item.return_weight && parseFloat(item.return_weight) > 0;

      if (!hasReturnQty && !hasReturnWeight) {
        newErrors[`items[${originalIndex}].return_qty_weight`] =
          "Return Quantity or Return Weight is required";
      }

      // Validate return doesn't exceed available
      const returnQty = parseFloat(item.return_quantity) || 0;
      const returnWeight = parseFloat(item.return_weight) || 0;
      const availableQty = parseFloat(item.available_quantity) || 0;
      const availableWeight = parseFloat(item.available_weight) || 0;

      if (returnQty > availableQty) {
        newErrors[
          `items[${originalIndex}].return_quantity`
        ] = `Cannot exceed available quantity (${availableQty})`;
      }

      if (returnWeight > availableWeight) {
        newErrors[
          `items[${originalIndex}].return_weight`
        ] = `Cannot exceed available weight (${availableWeight})`;
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

    // For return quantity/weight changes, recalculate total
    if (field === "return_quantity" || field === "return_weight") {
      const hasCost = parseFloat(currentItem.cost) > 0;
      const hasValue = parseFloat(value) > 0;

      if (hasCost && hasValue) {
        const amount = parseFloat(value);
        updatedItems[index].total = amount * parseFloat(currentItem.cost);
      } else {
        updatedItems[index].total = 0;
      }
    }

    // For cost changes, recalculate total if return exists
    if (field === "cost") {
      const returnQty = parseFloat(currentItem.return_quantity) || 0;
      const returnWeight = parseFloat(currentItem.return_weight) || 0;
      const hasReturn = returnQty > 0 || returnWeight > 0;

      if (hasReturn && parseFloat(value) > 0) {
        const amount = returnQty > 0 ? returnQty : returnWeight;
        updatedItems[index].total = amount * parseFloat(value);
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
    if (errors[`items[${index}].return_qty_weight`]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`items[${index}].return_qty_weight`];
        return newErrors;
      });
    }
  };

  const handleReturnQtyWeightChange = (index, value, isQuantity = true) => {
    const item = formData.items[index];
    const field = isQuantity ? "return_quantity" : "return_weight";
    const otherField = isQuantity ? "return_weight" : "return_quantity";

    // Update the appropriate field and clear the other
    const updatedItems = [...formData.items];
    updatedItems[index] = {
      ...item,
      [field]: value,
      [otherField]: "", // Clear the other field
    };

    // Calculate total if cost exists
    if (value && parseFloat(item.cost) > 0) {
      updatedItems[index].total = parseFloat(value) * parseFloat(item.cost);
    } else {
      updatedItems[index].total = 0;
    }

    setFormData((prev) => ({
      ...prev,
      items: updatedItems,
      total_cost: calculateTotalCost(updatedItems),
    }));

    // Clear errors
    if (errors[`items[${index}].return_qty_weight`]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`items[${index}].return_qty_weight`];
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
      return_quantity: "",
      return_weight: "",
      available_quantity: 0,
      available_weight: 0,
      cost: "",
      total: 0,
      reason: "",
      status: "pending",
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
    const validItems = formData.items.filter(
      (item) =>
        item.inventory_item_id &&
        (parseFloat(item.return_quantity) > 0 ||
          parseFloat(item.return_weight) > 0)
    );

    const payload = {
      purchase_received_id: formData.purchase_received_id || null,
      supplier_id: formData.supplier_id,
      branch_id: formData.branch_id,
      return_date: formData.return_date,
      return_reason: formData.return_reason,
      items: validItems.map((item) => {
        const returnQty = parseFloat(item.return_quantity) || 0;
        const returnWeight = parseFloat(item.return_weight) || 0;
        const availableQty = parseFloat(item.available_quantity) || 0;
        const availableWeight = parseFloat(item.available_weight) || 0;

        return {
          purchase_received_item_id: item.purchase_received_item_id || null,
          inventory_item_id: item.inventory_item_id,
          available_quantity: availableQty,
          available_weight: availableWeight,
          return_quantity: returnQty,
          return_weight: returnWeight,
          unit_id: item.unit_id || null,
          unit_code: item.unit_code || null,
          unit_name: item.unit_name || null,
          cost: parseFloat(item.cost) || 0,
          total_cost: parseFloat(item.total) || 0,
          reason: item.reason || "",
          status: "pending",
        };
      }),
      remarks: formData.remarks || "",
      total_cost: parseFloat(formData.total_cost),
      status: formData.status,
    };

    console.log("Submitting Purchase Return data:", payload);
    onSave(payload);

    // Reset form
    setFormData({
      purchase_received_id: "",
      supplier_id: "",
      supplier_name: "",
      branch_id: "",
      branch_name: "",
      return_date: new Date().toISOString().split("T")[0],
      return_reason: "",
      items: [],
      remarks: "",
      total_cost: 0,
      status: "pending",
    });
    setErrors({});
    setSelectedPurchaseReceived(null);
    setPurchaseReceivedSearchQuery("");
  };

  const handleClose = () => {
    setFormData({
      purchase_received_id: "",
      supplier_id: "",
      supplier_name: "",
      branch_id: "",
      branch_name: "",
      return_date: new Date().toISOString().split("T")[0],
      return_reason: "",
      items: [],
      remarks: "",
      total_cost: 0,
      status: "pending",
    });
    setErrors({});
    setSelectedPurchaseReceived(null);
    setPurchaseReceivedSearchQuery("");
    setPurchaseReceivedSearchResults([]);
    setShowPurchaseReceivedSearchResults(false);
    onClose();
  };

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        purchaseReceivedSearchRef.current &&
        !purchaseReceivedSearchRef.current.contains(event.target)
      ) {
        setShowPurchaseReceivedSearchResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Get selected items count
  const selectedItemsCount = formData.items.filter(
    (item) =>
      item.inventory_item_id &&
      (parseFloat(item.return_quantity) > 0 ||
        parseFloat(item.return_weight) > 0)
  ).length;

  const isDisabled = loading || loadingStockIns;

  // Helper function to get display text for purchase received
  const getPurchaseReceivedDisplay = (purchaseReceived) => {
    if (!purchaseReceived) return "";

    let displayText = "";
    if (purchaseReceived.po_id?.po_number) {
      displayText += `PO: ${purchaseReceived.po_id.po_number} | `;
    } else if (purchaseReceived.po_number) {
      displayText += `PO: ${purchaseReceived.po_number} | `;
    }

    displayText += `Supplier: ${
      purchaseReceived.supplier_name ||
      purchaseReceived.supplier_id?.supplier_name ||
      purchaseReceived.supplier_id?.name ||
      "N/A"
    }`;

    return displayText;
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
            <h5 className="modal-title fw-bold fs-5">Purchase Return</h5>
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
                {/* Purchase Received Search */}
                <div className="col-md-4 mb-3">
                  <label className="form-label fw-medium">
                    Purchase Received Reference{" "}
                    <span className="text-danger">*</span>
                  </label>
                  <div
                    className="position-relative"
                    ref={purchaseReceivedSearchRef}
                  >
                    <div className="input-group">
                      <span className="input-group-text">
                        <FiSearch size={16} />
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search by PO number, supplier..."
                        value={purchaseReceivedSearchQuery}
                        onChange={(e) =>
                          handlePurchaseReceivedSearch(e.target.value)
                        }
                        disabled={isDisabled || selectedPurchaseReceived}
                      />
                      {selectedPurchaseReceived && (
                        <button
                          type="button"
                          className="input-group-text"
                          onClick={handleClearPurchaseReceived}
                          disabled={isDisabled}
                          title="Clear selection"
                        >
                          <FiX size={16} />
                        </button>
                      )}
                    </div>

                    {/* Purchase Received Search Results Dropdown */}
                    {showPurchaseReceivedSearchResults &&
                      purchaseReceivedSearchResults.length > 0 && (
                        <div
                          className="position-absolute w-100 bg-white border rounded shadow-lg mt-1 z-3"
                          style={{ maxHeight: "300px", overflowY: "auto" }}
                        >
                          {purchaseReceivedSearchResults.map(
                            (purchaseReceived) => (
                              <div
                                key={purchaseReceived._id}
                                className="p-3 border-bottom cursor-pointer hover-bg-light"
                                onClick={() =>
                                  handlePurchaseReceivedSelect(purchaseReceived)
                                }
                                style={{ cursor: "pointer" }}
                              >
                                <div className="fw-medium">
                                  {purchaseReceived.po_number ||
                                    purchaseReceived.po_id?.po_number ||
                                    `PR-${purchaseReceived._id?.substring(
                                      0,
                                      8
                                    )}`}
                                </div>
                                <div className="small text-muted">
                                  {getPurchaseReceivedDisplay(purchaseReceived)}
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      )}

                    {!showPurchaseReceivedSearchResults &&
                      purchaseReceivedSearchQuery &&
                      purchaseReceivedSearchResults.length === 0 && (
                        <div className="text-muted small mt-1">
                          No purchase received entries found. Try a different
                          search term.
                        </div>
                      )}
                  </div>
                  {errors.purchase_received_id && (
                    <div className="invalid-feedback d-block">
                      {errors.purchase_received_id}
                    </div>
                  )}
                </div>

                {/* Return Date */}
                <div className="col-md-4 mb-3">
                  <label className="form-label fw-medium">
                    Return Date <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <FiCalendar size={16} />
                    </span>
                    <input
                      type="date"
                      name="return_date"
                      className={`form-control ${
                        errors.return_date ? "is-invalid" : ""
                      }`}
                      value={formData.return_date}
                      onChange={handleChange}
                      disabled={isDisabled}
                      required
                    />
                  </div>
                  {errors.return_date && (
                    <div className="invalid-feedback d-block">
                      {errors.return_date}
                    </div>
                  )}
                </div>

                {/* Return Reason */}
                <div className="col-md-4 mb-3">
                  <label className="form-label fw-medium">
                    Return Reason <span className="text-danger">*</span>
                  </label>
                  <select
                    name="return_reason"
                    className={`form-select ${
                      errors.return_reason ? "is-invalid" : ""
                    }`}
                    value={formData.return_reason}
                    onChange={handleChange}
                    disabled={isDisabled}
                  >
                    <option value="">Select Reason</option>
                    {returnReasons.map((reason) => (
                      <option key={reason} value={reason}>
                        {reason}
                      </option>
                    ))}
                  </select>
                  {errors.return_reason && (
                    <div className="invalid-feedback">
                      {errors.return_reason}
                    </div>
                  )}
                </div>

                {/* Supplier - Read-only from Purchase Received */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-medium">
                    Supplier <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${
                      errors.supplier_id ? "is-invalid" : ""
                    } ${selectedPurchaseReceived ? "bg-light" : ""}`}
                    value={
                      selectedPurchaseReceived
                        ? formData.supplier_name
                        : "Select a Purchase Received to auto-fill supplier"
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
                  {selectedPurchaseReceived && (
                    <div className="form-text">
                      Auto-filled from selected Purchase Received
                    </div>
                  )}
                </div>

                {/* Branch - Read-only from Purchase Received */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-medium">
                    Branch <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${
                      errors.branch_id ? "is-invalid" : ""
                    } ${selectedPurchaseReceived ? "bg-light" : ""}`}
                    value={
                      selectedPurchaseReceived
                        ? selectedPurchaseReceived.branch_id?.branch_name ||
                          selectedPurchaseReceived.branch_name ||
                          "N/A"
                        : "Select a Purchase Received to auto-fill branch"
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
                  {selectedPurchaseReceived && (
                    <div className="form-text">
                      Auto-filled from selected Purchase Received
                    </div>
                  )}
                </div>
              </div>

              {/* ITEMS SECTION */}
              <div className="border rounded-3 p-3 mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-bold mb-0">Return Items</h6>
                  <div className="text-muted small">
                    {selectedItemsCount} item(s) selected for return
                  </div>
                </div>

                {errors.items && (
                  <div className="alert alert-danger mb-3" role="alert">
                    {errors.items}
                  </div>
                )}

                {/* Return Table */}
                <div
                  className="table-responsive"
                  style={{ maxHeight: "400px", overflowY: "auto" }}
                >
                  <table className="table table-bordered align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th style={{ minWidth: "200px" }}>Product</th>
                        <th style={{ minWidth: "100px" }}>
                          Received/Available
                        </th>
                        <th style={{ minWidth: "100px" }}>Return Qty/Wt</th>
                        <th style={{ minWidth: "100px" }}>Unit</th>
                        <th style={{ minWidth: "100px" }}>Rate</th>
                        <th style={{ minWidth: "100px" }}>Total</th>
                        <th style={{ minWidth: "100px" }}>Item Reason</th>
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

                          const availableQty =
                            parseFloat(item.available_quantity) || 0;
                          const availableWeight =
                            parseFloat(item.available_weight) || 0;
                          const receivedQty =
                            parseFloat(item.received_quantity) || 0;
                          const receivedWeight =
                            parseFloat(item.received_weight) || 0;
                          const returnQty =
                            parseFloat(item.return_quantity) || 0;
                          const returnWeight =
                            parseFloat(item.return_weight) || 0;

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
                                <div className="small">
                                  <div>
                                    Received:{" "}
                                    {receivedQty > 0
                                      ? receivedQty
                                      : receivedWeight}
                                  </div>
                                  <div className="text-success">
                                    Available:{" "}
                                    {availableQty > 0
                                      ? availableQty
                                      : availableWeight}
                                  </div>
                                </div>
                              </td>
                              <td>
                                <input
                                  type="number"
                                  className={`form-control ${
                                    errors[
                                      `items[${originalIndex}].return_qty_weight`
                                    ]
                                      ? "is-invalid"
                                      : ""
                                  }`}
                                  placeholder={
                                    availableQty > 0
                                      ? "Enter Return Quantity"
                                      : "Enter Return Weight"
                                  }
                                  value={
                                    returnQty > 0 ? returnQty : returnWeight
                                  }
                                  onChange={(e) =>
                                    handleReturnQtyWeightChange(
                                      originalIndex,
                                      e.target.value,
                                      availableQty > 0
                                    )
                                  }
                                  disabled={isDisabled}
                                  min="0"
                                  max={
                                    availableQty > 0
                                      ? availableQty
                                      : availableWeight
                                  }
                                  step="0.001"
                                />
                                {errors[
                                  `items[${originalIndex}].return_qty_weight`
                                ] && (
                                  <div className="invalid-feedback d-block">
                                    {
                                      errors[
                                        `items[${originalIndex}].return_qty_weight`
                                      ]
                                    }
                                  </div>
                                )}
                                {(errors[
                                  `items[${originalIndex}].return_quantity`
                                ] ||
                                  errors[
                                    `items[${originalIndex}].return_weight`
                                  ]) && (
                                  <div className="invalid-feedback d-block">
                                    {errors[
                                      `items[${originalIndex}].return_quantity`
                                    ] ||
                                      errors[
                                        `items[${originalIndex}].return_weight`
                                      ]}
                                  </div>
                                )}
                              </td>
                              <td>
                                <div className="form-control bg-light">
                                  {item.unit_name || "No unit"}
                                  {item.unit_code && ` (${item.unit_code})`}
                                </div>
                                <input
                                  type="hidden"
                                  name={`items[${originalIndex}].unit_id`}
                                  value={item.unit_id}
                                />
                              </td>
                              <td>
                                <input
                                  type="number"
                                  className={`form-control ${
                                    errors[`items[${originalIndex}].cost`]
                                      ? "is-invalid"
                                      : ""
                                  }`}
                                  placeholder="Rate"
                                  value={item.cost}
                                  onChange={(e) =>
                                    handleItemChange(
                                      originalIndex,
                                      "cost",
                                      e.target.value
                                    )
                                  }
                                  disabled={isDisabled}
                                  min="0"
                                  step="0.01"
                                />
                                {errors[`items[${originalIndex}].cost`] && (
                                  <div className="invalid-feedback d-block small">
                                    {errors[`items[${originalIndex}].cost`]}
                                  </div>
                                )}
                              </td>
                              <td>
                                <input
                                  type="text"
                                  className="form-control bg-light fw-medium"
                                  value={`₹${parseFloat(
                                    item.total || 0
                                  ).toFixed(2)}`}
                                  readOnly
                                />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="Item reason (optional)"
                                  value={item.reason}
                                  onChange={(e) =>
                                    handleItemChange(
                                      originalIndex,
                                      "reason",
                                      e.target.value
                                    )
                                  }
                                  disabled={isDisabled}
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
                            colSpan="8"
                            className="text-center py-5 text-muted"
                          >
                            <div className="d-flex flex-column align-items-center">
                              <FiSearch className="mb-2" size={32} />
                              <span className="fs-6">
                                {selectedPurchaseReceived
                                  ? "Select items from the Purchase Received above"
                                  : "Search and select a Purchase Received above to load items"}
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
                      <label className="form-label fw-medium">
                        General Remarks
                      </label>
                      <textarea
                        className="form-control"
                        rows={3}
                        placeholder="Additional notes for this return..."
                        value={formData.remarks}
                        onChange={handleChange}
                        name="remarks"
                        disabled={isDisabled}
                      ></textarea>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-medium">Status</label>
                      <select
                        name="status"
                        className="form-select"
                        value={formData.status}
                        onChange={handleChange}
                        disabled={isDisabled}
                      >
                        {statusOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
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
                            <span className="text-muted">Total Received:</span>
                            <span className="float-end fw-medium">
                              {(() => {
                                const totalReceived = formData.items
                                  .filter((item) => item.inventory_item_id)
                                  .reduce((sum, item) => {
                                    const qty =
                                      parseFloat(item.received_quantity) || 0;
                                    const wt =
                                      parseFloat(item.received_weight) || 0;
                                    return sum + (qty > 0 ? qty : wt);
                                  }, 0);
                                return totalReceived;
                              })()}
                            </span>
                          </div>
                          <div className="mb-2">
                            <span className="text-muted">Total Available:</span>
                            <span className="float-end fw-medium">
                              {(() => {
                                const totalAvailable = formData.items
                                  .filter((item) => item.inventory_item_id)
                                  .reduce((sum, item) => {
                                    const qty =
                                      parseFloat(item.available_quantity) || 0;
                                    const wt =
                                      parseFloat(item.available_weight) || 0;
                                    return sum + (qty > 0 ? qty : wt);
                                  }, 0);
                                return totalAvailable;
                              })()}
                            </span>
                          </div>
                          <div className="mb-2">
                            <span className="text-muted">Total Returning:</span>
                            <span className="float-end fw-medium">
                              {(() => {
                                const totalReturning = formData.items
                                  .filter((item) => item.inventory_item_id)
                                  .reduce((sum, item) => {
                                    const qty =
                                      parseFloat(item.return_quantity) || 0;
                                    const wt =
                                      parseFloat(item.return_weight) || 0;
                                    return sum + (qty > 0 ? qty : wt);
                                  }, 0);
                                return totalReturning;
                              })()}
                            </span>
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="mb-2">
                            <span className="fw-bold fs-5">Return Total:</span>
                            <span className="float-end fw-bold fs-5 text-danger">
                              ₹{parseFloat(formData.total_cost || 0).toFixed(2)}
                            </span>
                          </div>
                          <div className="mb-2">
                            <span className="text-muted">
                              Return Percentage:
                            </span>
                            <span className="float-end fw-medium">
                              {(() => {
                                const totalAvailable = formData.items
                                  .filter((item) => item.inventory_item_id)
                                  .reduce((sum, item) => {
                                    const qty =
                                      parseFloat(item.available_quantity) || 0;
                                    const wt =
                                      parseFloat(item.available_weight) || 0;
                                    return sum + (qty > 0 ? qty : wt);
                                  }, 0);

                                const totalReturning = formData.items
                                  .filter((item) => item.inventory_item_id)
                                  .reduce((sum, item) => {
                                    const qty =
                                      parseFloat(item.return_quantity) || 0;
                                    const wt =
                                      parseFloat(item.return_weight) || 0;
                                    return sum + (qty > 0 ? qty : wt);
                                  }, 0);

                                if (totalAvailable === 0) return "0%";
                                const percentage =
                                  (totalReturning / totalAvailable) * 100;
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
                                className="progress-bar bg-danger"
                                role="progressbar"
                                style={{
                                  width: `${(() => {
                                    const totalAvailable = formData.items
                                      .filter((item) => item.inventory_item_id)
                                      .reduce((sum, item) => {
                                        const qty =
                                          parseFloat(item.available_quantity) ||
                                          0;
                                        const wt =
                                          parseFloat(item.available_weight) ||
                                          0;
                                        return sum + (qty > 0 ? qty : wt);
                                      }, 0);

                                    const totalReturning = formData.items
                                      .filter((item) => item.inventory_item_id)
                                      .reduce((sum, item) => {
                                        const qty =
                                          parseFloat(item.return_quantity) || 0;
                                        const wt =
                                          parseFloat(item.return_weight) || 0;
                                        return sum + (qty > 0 ? qty : wt);
                                      }, 0);

                                    if (totalAvailable === 0) return "0";
                                    const percentage =
                                      (totalReturning / totalAvailable) * 100;
                                    return `${Math.min(percentage, 100)}%`;
                                  })()}`,
                                }}
                                aria-valuenow={(() => {
                                  const totalAvailable = formData.items
                                    .filter((item) => item.inventory_item_id)
                                    .reduce((sum, item) => {
                                      const qty =
                                        parseFloat(item.available_quantity) ||
                                        0;
                                      const wt =
                                        parseFloat(item.available_weight) || 0;
                                      return sum + (qty > 0 ? qty : wt);
                                    }, 0);

                                  const totalReturning = formData.items
                                    .filter((item) => item.inventory_item_id)
                                    .reduce((sum, item) => {
                                      const qty =
                                        parseFloat(item.return_quantity) || 0;
                                      const wt =
                                        parseFloat(item.return_weight) || 0;
                                      return sum + (qty > 0 ? qty : wt);
                                    }, 0);

                                  if (totalAvailable === 0) return 0;
                                  const percentage =
                                    (totalReturning / totalAvailable) * 100;
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
                className="btn btn-danger d-flex align-items-center gap-2"
                disabled={isDisabled || selectedItemsCount === 0}
              >
                {loading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm"
                      aria-hidden="true"
                    ></span>
                    Creating Return...
                  </>
                ) : (
                  <>
                    <FiRotateCcw size={16} />
                    Create Return
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

export default AddPurchaseReturnForm;
