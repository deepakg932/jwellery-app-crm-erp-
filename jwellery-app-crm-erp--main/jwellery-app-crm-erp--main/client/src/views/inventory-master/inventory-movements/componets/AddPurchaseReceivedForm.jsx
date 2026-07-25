import React, { useState, useEffect, useRef } from "react";
import { FiUpload, FiCalendar, FiSearch, FiX, FiTrash2 } from "react-icons/fi";
import purchaseReceived from "@/hooks/purchaseReceived";

const AddPurchaseReceived = ({ onClose, onSave, loading = false }) => {
  const { purchaseOrders, loadingPurchaseOrders } = purchaseReceived();

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

  const [errors, setErrors] = useState({});
  const [selectedPO, setSelectedPO] = useState(null);
  const [poSearchQuery, setPoSearchQuery] = useState("");
  const [poSearchResults, setPoSearchResults] = useState([]);
  const [showPoSearchResults, setShowPoSearchResults] = useState(false);
  const poSearchRef = useRef(null);

  // Debug form data changes
  useEffect(() => {
    console.log("Form Data Updated:", formData);
    console.log("Selected PO:", selectedPO);
    console.log("Items count:", formData.items.length);
    console.log(
      "Items with inventory ID:",
      formData.items.filter((item) => item.inventory_item_id).length,
    );
  }, [formData, selectedPO]);

  // Handle purchase order search
  const handlePOSearch = (query) => {
    setPoSearchQuery(query);

    if (query.trim() === "") {
      setPoSearchResults([]);
      setShowPoSearchResults(false);
      return;
    }

    // Filter purchase orders by PO number, reference number, or supplier name
    const results = purchaseOrders.filter(
      (po) =>
        (po.po_number &&
          po.po_number.toLowerCase().includes(query.toLowerCase())) ||
        (po.reference_no &&
          po.reference_no.toLowerCase().includes(query.toLowerCase())) ||
        ((typeof po.supplier_id === 'object') && po.supplier_id?.supplier_name &&
          po.supplier_id.supplier_name
            .toLowerCase()
            .includes(query.toLowerCase())) ||
        ((typeof po.supplier_id === 'object') && po.supplier_id?.name &&
          po.supplier_id.name.toLowerCase().includes(query.toLowerCase())) ||
        (po.supplier?.supplier_name &&
          po.supplier.supplier_name
            .toLowerCase()
            .includes(query.toLowerCase())) ||
        (po.supplier?.name &&
          po.supplier.name.toLowerCase().includes(query.toLowerCase())) ||
        (po.vendor_id?.supplier_name &&
          po.vendor_id.supplier_name
            .toLowerCase()
            .includes(query.toLowerCase())) ||
        (typeof po.supplier_id === 'string' && po.supplier_id
            .toLowerCase()
            .includes(query.toLowerCase())) ||
        (po.supplier_name &&
          po.supplier_name.toLowerCase().includes(query.toLowerCase())),
    );

    // Show POs with any status (user can decide which ones to receive)
    const filteredResults = results;

    setPoSearchResults(filteredResults);
    setShowPoSearchResults(true);
  };

  const handlePOSelect = (po) => {
    console.log("=== PO Selected ===", po);
    console.log("Raw supplier_id:", po.supplier_id);
    console.log("Raw branch:", po.branch);
    console.log("Raw branch_id:", po.branch_id);

    setSelectedPO(po);

    // Extract supplier and branch - handle ALL possible data structures
    // After hook mapping, supplier_id might be a string ID or a populated object
    const supplierId = 
      (typeof po.supplier_id === 'object' && po.supplier_id?._id) ||
      (typeof po.supplier_id === 'object' && po.supplier_id?.id) ||
      po.supplier?._id ||
      po.vendor_id?._id ||
      (typeof po.supplier_id === 'string' && po.supplier_id) ||
      (typeof po.vendor_id === 'string' && po.vendor_id) ||
      "";
    const supplierName =
      (typeof po.supplier_id === 'object' && po.supplier_id?.supplier_name) ||
      (typeof po.supplier_id === 'object' && po.supplier_id?.name) ||
      po.supplier?.supplier_name ||
      po.supplier?.name ||
      po.vendor_id?.supplier_name ||
      po.vendor_id?.name ||
      po.supplier_name ||
      "";
    
    // Handle branch - object or string
    const branchId = 
      po.branch?._id ||
      po.branch_id?._id ||
      (typeof po.branch_id === 'string' && po.branch_id) ||
      (typeof po.branch === 'string' && po.branch) ||
      "";
    const branchName =
      po.branch?.branch_name ||
      po.branch?.name ||
      po.branch_id?.branch_name ||
      po.branch_id?.name ||
      po.branch_name ||
      "";
    
    console.log("✓ Extracted supplierId:", supplierId, "supplierName:", supplierName);
    console.log("✓ Extracted branchId:", branchId, "branchName:", branchName);

    console.log("Extracted Supplier:", { supplierId, supplierName });
    console.log("Extracted Branch:", { branchId, branchName });

    // Auto-populate items from PO
    let poItems = [];

    if (po.items && po.items.length > 0) {
      poItems = po.items.map((item) => {
        console.log("Processing item:", item);

        // Check different possible structures for inventory_item
        const inventoryItem =
          item.inventory_item || item.item || item.product || {};
        const unit = item.unit || item.unit_id || {};

        // Check quantity/weight fields (try different field names)
        const quantity =
          item.quantity || item.qty || item.ordered_quantity || 0;
        const weight = item.weight || item.ordered_weight || 0;

        // Determine if this is quantity or weight based
        const isQuantityBased = quantity && parseFloat(quantity) > 0;
        const isWeightBased = weight && parseFloat(weight) > 0;

        // Get item name from different possible fields
        const itemName =
          inventoryItem?.name ||
          inventoryItem?.item_name ||
          item.item_name ||
          item.product_name ||
          "Unknown Item";

        // Get item code from different possible fields
        const itemCode =
          inventoryItem?.item_code ||
          inventoryItem?.sku ||
          inventoryItem?.code ||
          item.sku_code ||
          item.code ||
          "N/A";

        // Get unit info
        const unitName =
          unit?.name || unit?.unit_name || item.unit_name || "pcs";
        const unitCode = unit?.code || item.unit_code || "";

        // Determine rate basis
        const unitNameLower = unitName.toLowerCase();
        const rateBasis = unitNameLower.includes("kg")
          ? "per_kg"
          : unitNameLower.includes("g") || unitNameLower.includes("gram")
            ? "per_gram"
            : "per_unit";

        const newItem = {
          po_item_id: item._id,
          inventory_item_id:
            inventoryItem?._id || item.inventory_item_id || item.item_id || "",
          inventory_item_name: itemName,
          sku_code: itemCode,
          ordered_quantity: isQuantityBased ? parseFloat(quantity) : 0,
          ordered_weight: isWeightBased ? parseFloat(weight) : 0,
          unit_id: unit?._id || item.unit_id || "",
          unit_name: unitName,
          unit_code: unitCode,
          rate: item.rate || item.cost || item.price || 0,
          cost: item.rate || item.cost || item.price || 0,
          rate_basis: rateBasis,
          received_quantity: isQuantityBased ? "" : "",
          received_weight: isWeightBased ? "" : "",
          total: 0,
          status: "pending",
        };

        console.log("Created item:", newItem);
        return newItem;
      });
    }

    console.log("PO Items to be set:", poItems);

    console.log("Setting formData with:", {
      po_id: po._id,
      supplier_id: supplierId,
      supplier_name: supplierName,
      branch_id: branchId,
      branch_name: branchName,
    });

    setFormData((prev) => {
      const newData = {
        ...prev,
        po_id: po._id,
        supplier_id: supplierId,
        supplier_name: supplierName,
        branch_id: branchId,
        branch_name: branchName,
        items: poItems,
        total_cost: calculateTotalCost(poItems),
      };
      console.log("✓ FormData updated:", newData);
      return newData;
    });

    setPoSearchQuery("");
    setShowPoSearchResults(false);
    setPoSearchResults([]);
  };

  // Clear selected PO
  const handleClearPO = () => {
    setSelectedPO(null);
    setFormData({
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
    setPoSearchQuery("");
    setErrors({});
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

    // Debug log
    console.log("calculateItemTotalCost called with:", {
      receivedQty,
      receivedWeight,
      cost,
      unit_name: item.unit_name,
      unit_code: item.unit_code,
      ordered_quantity: item.ordered_quantity,
      ordered_weight: item.ordered_weight,
    });

    // Determine unit type
    const isWeightBased = getItemUnitType(item) === "weight";

    let amount = isWeightBased ? receivedWeight : receivedQty;

    if (amount <= 0 || cost <= 0) return 0;

    if (isWeightBased) {
      const unitName = (item.unit_name || "").toLowerCase();

      // For KG units: amount × rate (NO DIVISION)
      if (unitName.includes("kg") || unitName.includes("kilogram")) {
        return amount * cost;
      }
      // For Gram units: (amount / 1000) × rate
      else if (unitName.includes("g") || unitName.includes("gram")) {
        if (!unitName.includes("kg")) {
          // Make sure it's not kilogram
          return (amount / 1000) * cost;
        }
        return amount * cost;
      }
      // For Milligram units: (amount / 1000000) × rate
      else if (unitName.includes("mg")) {
        return (amount / 1000000) * cost;
      }
      // For other weight units, assume per kg
      else {
        return amount * cost;
      }
    } else {
      // For quantity units
      return amount * cost;
    }
  };

  const calculateTotalCost = (items) => {
    return items.reduce((total, item) => {
      return total + calculateItemTotalCost(item);
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
      (item) => item.inventory_item_id,
    );

    if (selectedItems.length === 0) {
      newErrors.items = "At least one item is required";
    }

    selectedItems.forEach((item, index) => {
      const originalIndex = formData.items.findIndex(
        (i) => i.inventory_item_id === item.inventory_item_id,
      );

      // Determine unit type first
      const unitType = getItemUnitType(item);

      // Check for either received_quantity or received_weight field based on unit type
      const hasReceivedQty =
        unitType === "quantity" &&
        item.received_quantity &&
        parseFloat(item.received_quantity) > 0;
      const hasReceivedWeight =
        unitType === "weight" &&
        item.received_weight &&
        parseFloat(item.received_weight) > 0;
      const hasUnit = item.unit_id;

      if (!hasReceivedQty && !hasReceivedWeight) {
        newErrors[`items[${originalIndex}].received_qty_weight`] =
          unitType === "quantity"
            ? "Received Quantity is required"
            : "Received Weight is required";
      }

      if (!hasUnit) {
        newErrors[`items[${originalIndex}].unit_id`] = "Unit is required";
      }

      if (!item.rate || parseFloat(item.rate) <= 0) {
        newErrors[`items[${originalIndex}].rate`] = "Valid rate is required";
      }

      // Validate received amount against ordered
      if (
        unitType === "quantity" &&
        item.received_quantity !== undefined &&
        item.received_quantity !== ""
      ) {
        const rq = parseFloat(item.received_quantity);
        const oq = parseFloat(item.ordered_quantity) || 0;

        if (Number.isNaN(rq) || rq < 0) {
          newErrors[`items[${originalIndex}].received_quantity`] =
            "Received quantity must be a non-negative number";
        }
        if (oq > 0 && rq > oq) {
          newErrors[`items[${originalIndex}].received_quantity`] =
            `Cannot exceed ordered quantity (${oq})`;
        }
      }

      if (
        unitType === "weight" &&
        item.received_weight !== undefined &&
        item.received_weight !== ""
      ) {
        const rw = parseFloat(item.received_weight);
        const ow = parseFloat(item.ordered_weight) || 0;

        if (Number.isNaN(rw) || rw < 0) {
          newErrors[`items[${originalIndex}].received_weight`] =
            "Received weight must be a non-negative number";
        }
        if (ow > 0 && rw > ow) {
          newErrors[`items[${originalIndex}].received_weight`] =
            `Cannot exceed ordered weight (${ow})`;
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

    // For rate/cost changes or received quantity/weight changes
    if (
      field === "rate" ||
      field === "cost" ||
      field === "received_quantity" ||
      field === "received_weight"
    ) {
      // Recalculate total using the new calculateItemTotalCost function
      updatedItems[index].total = calculateItemTotalCost(updatedItems[index]);
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
      total: calculateItemTotalCost({
        ...item,
        [field]: value,
        [otherField]: "",
      }),
    };

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

  const getItemUnitType = (item) => {
    const orderedQty = parseFloat(item.ordered_quantity) || 0;
    const orderedWeight = parseFloat(item.ordered_weight) || 0;
    const unitName = (item.unit_name || "").toLowerCase();
    const unitCode = (item.unit_code || "").toLowerCase();

    // First, check actual ordered amounts
    if (orderedQty > 0) return "quantity";
    if (orderedWeight > 0) return "weight";

    // Check unit name/code for weight indicators
    const weightIndicators = [
      "kg",
      "kilogram",
      "kilo",
      "g",
      "gram",
      "gm",
      "mg",
      "milligram",
      "pound",
      "lb",
      "lbs",
      "ounce",
      "oz",
      "ton",
      "tonne",
    ];

    // Check if it's a weight unit
    const isWeightUnit = weightIndicators.some(
      (indicator) =>
        unitName.includes(indicator) || unitCode.includes(indicator),
    );

    // Additional check: if unit contains "kg" or "kilogram", definitely weight
    if (unitName.includes("kg") || unitName.includes("kilogram")) {
      return "weight";
    }

    if (isWeightUnit) return "weight";

    // Default to quantity
    return "quantity";
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
          quantity: null,
          weight: null,
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

    console.log("Submitting Received data:", payload);
    onSave(payload);

    // Reset form
    setFormData({
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
    setErrors({});
    setSelectedPO(null);
    setPoSearchQuery("");
  };

  const handleClose = () => {
    setFormData({
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
    setErrors({});
    setSelectedPO(null);
    setPoSearchQuery("");
    setPoSearchResults([]);
    setShowPoSearchResults(false);
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
    (item) => item.inventory_item_id,
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
            <h5 className="modal-title fw-bold fs-5">Received Purchase</h5>
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
              {/* Debug Info - Remove in production */}
              <div className="alert alert-info mb-3 py-2">
                <small>
                  <strong>Debug:</strong> PO Selected:{" "}
                  {selectedPO ? "Yes" : "No"} | Supplier:{" "}
                  {formData.supplier_name || "None"} | Branch:{" "}
                  {formData.branch_name || "None"} | Items:{" "}
                  {formData.items.length} | Valid Items: {selectedItemsCount}
                </small>
              </div>

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
                              {(typeof po.supplier_id === 'object' && po.supplier_id?.supplier_name) ||
                                (typeof po.supplier_id === 'object' && po.supplier_id?.name) ||
                                po.supplier?.supplier_name ||
                                po.supplier?.name ||
                                po.vendor_id?.supplier_name ||
                                po.supplier_name ||
                                "N/A"}{" "}
                              | Reference: {po.reference_no || "N/A"} | Items:{" "}
                              {po.items?.length || 0} | Total: ₹
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
                    } ${formData.supplier_name ? "bg-light" : ""}`}
                    value={
                      formData.supplier_name
                        ? formData.supplier_name
                        : "Select a PO to auto-fill supplier"
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
                    <div className="invalid-feedback d-block">
                      {errors.supplier_id}
                    </div>
                  )}
                  {formData.supplier_name && (
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
                    } ${formData.branch_name ? "bg-light" : ""}`}
                    value={
                      formData.branch_name
                        ? formData.branch_name
                        : "Select a PO to auto-fill branch"
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
                    <div className="invalid-feedback d-block">
                      {errors.branch_id}
                    </div>
                  )}
                  {formData.branch_name && (
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

                {/* Loading State */}
                {loadingPurchaseOrders && (
                  <div className="alert alert-info mb-3">
                    <div className="spinner-border spinner-border-sm me-2"></div>
                    Loading purchase orders...
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
                      {selectedItemsCount > 0 ? (
                        formData.items
                          .filter((item) => item.inventory_item_id)
                          .map((item, index) => {
                            const originalIndex = formData.items.findIndex(
                              (i) =>
                                i.inventory_item_id === item.inventory_item_id,
                            );

                            const orderedQty =
                              parseFloat(item.ordered_quantity) || 0;
                            const orderedWeight =
                              parseFloat(item.ordered_weight) || 0;

                            return (
                              <tr key={item.inventory_item_id || index}>
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
                                    {orderedQty > 0
                                      ? orderedQty
                                      : orderedWeight}{" "}
                                    {item.unit_name}
                                  </div>
                                  <div className="small text-muted mt-1">
                                    {orderedQty > 0
                                      ? "Ordered Quantity"
                                      : "Ordered Weight"}
                                  </div>
                                </td>
                                <td>
                                  {getItemUnitType(item) === "quantity" ? (
                                    <input
                                      type="number"
                                      className={`form-control ${
                                        errors[
                                          `items[${originalIndex}].received_qty_weight`
                                        ]
                                          ? "is-invalid"
                                          : ""
                                      }`}
                                      placeholder="Enter Received Quantity"
                                      value={item.received_quantity || ""}
                                      onChange={(e) =>
                                        handleReceivedQtyWeightChange(
                                          originalIndex,
                                          e.target.value,
                                          true,
                                        )
                                      }
                                      disabled={isDisabled}
                                      min="0"
                                      max={item.ordered_quantity || undefined}
                                      step="1"
                                    />
                                  ) : (
                                    <input
                                      type="number"
                                      className={`form-control ${
                                        errors[
                                          `items[${originalIndex}].received_qty_weight`
                                        ]
                                          ? "is-invalid"
                                          : ""
                                      }`}
                                      placeholder="Enter Received Weight"
                                      value={item.received_weight || ""}
                                      onChange={(e) =>
                                        handleReceivedQtyWeightChange(
                                          originalIndex,
                                          e.target.value,
                                          false,
                                        )
                                      }
                                      disabled={isDisabled}
                                      min="0"
                                      max={item.ordered_weight || undefined}
                                      step="0.001"
                                    />
                                  )}

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

                                  {/* Show ordered amount as hint */}
                                  <div className="small text-muted mt-1">
                                    Ordered:{" "}
                                    {getItemUnitType(item) === "quantity"
                                      ? `${item.ordered_quantity || 0} ${item.unit_name || ""}`
                                      : `${item.ordered_weight || 0} ${item.unit_name || ""}`}
                                  </div>
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
                                  <div className="d-flex align-items-center">
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
                                          e.target.value,
                                        )
                                      }
                                      disabled={isDisabled}
                                      min="0"
                                      step="0.01"
                                    />
                                    <span className="ms-1 text-muted">
                                      /
                                      {getItemUnitType(item) === "weight"
                                        ? "kg"
                                        : "unit"}
                                    </span>
                                  </div>
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
                                      item.total || 0,
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
                                        (i) => i.inventory_item_id,
                                      ).length === 1
                                    }
                                    title="Remove item"
                                  >
                                    <FiTrash2 size={14} />
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                      ) : (
                        <tr>
                          <td
                            colSpan="7"
                            className="text-center py-5 text-muted"
                          >
                            <div className="d-flex flex-column align-items-center">
                              <FiSearch className="mb-2" size={32} />
                              <span className="fs-6">
                                {selectedPO
                                  ? formData.items.length === 0
                                    ? "No items found in the selected PO"
                                    : "PO items don't have valid inventory items"
                                  : "Search and select a Purchase Order above to load items"}
                              </span>
                              {selectedPO && (
                                <small className="text-warning mt-2">
                                  Check if PO has items with inventory items
                                </small>
                              )}
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
                                    const unitType = getItemUnitType(item);
                                    if (unitType === "quantity") {
                                      return (
                                        sum +
                                        (parseFloat(item.ordered_quantity) || 0)
                                      );
                                    } else {
                                      return (
                                        sum +
                                        (parseFloat(item.ordered_weight) || 0)
                                      );
                                    }
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
                                    const unitType = getItemUnitType(item);
                                    if (unitType === "quantity") {
                                      return (
                                        sum +
                                        (parseFloat(item.received_quantity) ||
                                          0)
                                      );
                                    } else {
                                      return (
                                        sum +
                                        (parseFloat(item.received_weight) || 0)
                                      );
                                    }
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
                                    const qty =
                                      parseFloat(item.received_quantity) || 0;
                                    const wt =
                                      parseFloat(item.received_weight) || 0;
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
                                    const unitType = getItemUnitType(item);
                                    if (unitType === "quantity") {
                                      return (
                                        sum +
                                        (parseFloat(item.ordered_quantity) || 0)
                                      );
                                    } else {
                                      return (
                                        sum +
                                        (parseFloat(item.ordered_weight) || 0)
                                      );
                                    }
                                  }, 0);

                                const totalReceived = formData.items
                                  .filter((item) => item.inventory_item_id)
                                  .reduce((sum, item) => {
                                    const unitType = getItemUnitType(item);
                                    if (unitType === "quantity") {
                                      return (
                                        sum +
                                        (parseFloat(item.received_quantity) ||
                                          0)
                                      );
                                    } else {
                                      return (
                                        sum +
                                        (parseFloat(item.received_weight) || 0)
                                      );
                                    }
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
                                        const unitType = getItemUnitType(item);
                                        if (unitType === "quantity") {
                                          return (
                                            sum +
                                            (parseFloat(
                                              item.ordered_quantity,
                                            ) || 0)
                                          );
                                        } else {
                                          return (
                                            sum +
                                            (parseFloat(item.ordered_weight) ||
                                              0)
                                          );
                                        }
                                      }, 0);

                                    const totalReceived = formData.items
                                      .filter((item) => item.inventory_item_id)
                                      .reduce((sum, item) => {
                                        const unitType = getItemUnitType(item);
                                        if (unitType === "quantity") {
                                          return (
                                            sum +
                                            (parseFloat(
                                              item.received_quantity,
                                            ) || 0)
                                          );
                                        } else {
                                          return (
                                            sum +
                                            (parseFloat(item.received_weight) ||
                                              0)
                                          );
                                        }
                                      }, 0);

                                    if (totalOrdered === 0) return "0";
                                    const percentage =
                                      (totalReceived / totalOrdered) * 100;
                                    return `${Math.min(percentage, 100)}%`;
                                  })()}`,
                                }}
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
                    Creating Received...
                  </>
                ) : (
                  <>
                    <FiUpload size={16} />
                    Create Received
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

export default AddPurchaseReceived;
