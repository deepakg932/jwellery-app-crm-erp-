import React, { useState, useEffect } from "react";
import { FiUpload, FiPlus, FiTrash2 } from "react-icons/fi";
import usePurchaseOrders from "@/hooks/usePurchaseOrders";

const AddPurchaseOrderForm = ({ onClose, onSave, loading = false }) => {
  const {
    suppliers,
    inventoryItems,
    units,
    loadingSuppliers,
    loadingInventoryItems,
    loadingUnits,
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
        metal_purity: "",
        stone_purity: "",
        metal_weight: "",
        stone_type: "",
        metal_type: "",
        material_type: "",
        track_by: "quantity", // Add track_by field
      },
    ],
    notes: "",
    total_amount: 0,
  });

  const [errors, setErrors] = useState({});

  // Helper function to get selected item details
  const getSelectedItemDetails = (itemId) => {
    if (!itemId) return null;
    return inventoryItems.find((item) => item._id === itemId);
  };

  // Determine item type based on inventory item data
  const getItemType = (itemId) => {
    const item = getSelectedItemDetails(itemId);
    if (!item) return "material";
    
    if (item.metals && item.metals.length > 0) {
      return "metal";
    } else if (item.stones && item.stones.length > 0) {
      return "stone";
    } else {
      return "material";
    }
  };

  // Get metal details for selected item
  const getMetalDetails = (itemId) => {
    const item = getSelectedItemDetails(itemId);
    if (!item || !item.metals || item.metals.length === 0) return [];

    return item.metals.map((metal) => {
      let purity = "";
      let metalName = "";
      let metalWeight = null;

      // Get metal purity
      if (metal.purity_name) {
        purity = metal.purity_name;
      } else if (metal.purity_id?.purity_name) {
        purity = metal.purity_id.purity_name;
      }

      // Get metal name/type
      if (metal.metal_id?.name) {
        metalName = metal.metal_id.name;
      }

      // Get metal weight
      if (metal.metal_weight) {
        metalWeight = metal.metal_weight;
      }

      return {
        metal_type: metalName || "Metal",
        purity: purity || "N/A",
        metal_weight: metalWeight,
      };
    });
  };

  // Get stone details for selected item
  const getStoneDetails = (itemId) => {
    const item = getSelectedItemDetails(itemId);
    if (!item || !item.stones || item.stones.length === 0) return [];

    return item.stones.map((stone) => {
      let purity = "";
      let stoneType = "";

      // Get stone purity
      if (stone.stone_purity_id?.stone_purity) {
        purity = stone.stone_purity_id.stone_purity;
      }

      // Get stone type
      if (stone.stone_id?.stone_type) {
        stoneType = stone.stone_id.stone_type;
      }

      return {
        stone_type: stoneType || "Stone",
        purity: purity || "N/A",
        stone_quantity: stone.stone_quantity || null,
      };
    });
  };

  // Get material type for selected item
  const getMaterialType = (itemId) => {
    const item = getSelectedItemDetails(itemId);
    if (!item) return "";
    
    return item.material_type_id?.material_type || "Material";
  };

  // Get track_by field from inventory item
  const getTrackBy = (itemId) => {
    const item = getSelectedItemDetails(itemId);
    if (!item) return "quantity";
    return item.track_by || "quantity";
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.supplier_id) {
      newErrors.supplier_id = "Supplier is required";
    }

    if (!formData.order_date) {
      newErrors.order_date = "Order date is required";
    }

    if (formData.items.length === 0) {
      newErrors.items = "At least one item is required";
    } else {
      formData.items.forEach((item, index) => {
        if (!item.inventory_item_id) {
          newErrors[`items[${index}].inventory_item_id`] = "Item is required";
        }
        
        const trackBy = item.track_by || "quantity";
        
        if (trackBy === "quantity") {
          if (!item.quantity || parseFloat(item.quantity) <= 0) {
            newErrors[`items[${index}].quantity`] = "Quantity is required";
          }
        } else if (trackBy === "weight") {
          if (!item.weight || parseFloat(item.weight) <= 0) {
            newErrors[`items[${index}].weight`] = "Weight is required";
          }
        }
        
        if (!item.rate || parseFloat(item.rate) <= 0) {
          newErrors[`items[${index}].rate`] = "Valid rate is required";
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateItemTotal = (quantity, weight, rate, trackBy) => {
    const qty = parseFloat(quantity) || 0;
    const wt = parseFloat(weight) || 0;
    const rt = parseFloat(rate) || 0;

    // Use quantity or weight based on track_by
    const amount = trackBy === "quantity" ? qty : wt;
    return amount * rt;
  };

  const calculateTotalAmount = (items) => {
    return items.reduce((total, item) => {
      return total + (parseFloat(item.total) || 0);
    }, 0);
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];

    // If inventory item is changing, auto-populate relevant details
    if (field === "inventory_item_id") {
      const itemDetails = getSelectedItemDetails(value);
      
      if (itemDetails) {
        const itemType = getItemType(value);
        const trackBy = getTrackBy(value);

        // Reset all fields first
        updatedItems[index].metal_purity = "";
        updatedItems[index].stone_purity = "";
        updatedItems[index].metal_weight = "";
        updatedItems[index].metal_type = "";
        updatedItems[index].stone_type = "";
        updatedItems[index].material_type = "";
        updatedItems[index].track_by = trackBy;

        // Set only relevant fields based on item type
        if (itemType === "metal") {
          const metalDetails = getMetalDetails(value);
          if (metalDetails.length > 0) {
            // Use the first metal details
            updatedItems[index].metal_purity = metalDetails[0].purity;
            updatedItems[index].metal_weight = metalDetails[0].metal_weight || "";
            updatedItems[index].metal_type = metalDetails[0].metal_type;
          }
        } else if (itemType === "stone") {
          const stoneDetails = getStoneDetails(value);
          if (stoneDetails.length > 0) {
            // Use the first stone details
            updatedItems[index].stone_purity = stoneDetails[0].purity || "N/A";
            updatedItems[index].stone_type = stoneDetails[0].stone_type;
          }
        } else if (itemType === "material") {
          // Set material type
          updatedItems[index].material_type = getMaterialType(value);
        }
      } else {
        // Reset all fields if no item selected
        updatedItems[index].metal_purity = "";
        updatedItems[index].stone_purity = "";
        updatedItems[index].metal_weight = "";
        updatedItems[index].metal_type = "";
        updatedItems[index].stone_type = "";
        updatedItems[index].material_type = "";
        updatedItems[index].track_by = "quantity";
      }
    }

    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    };

    // Calculate total when quantity, weight, or rate changes
    if (field === "quantity" || field === "weight" || field === "rate") {
      const trackBy = updatedItems[index].track_by || "quantity";
      updatedItems[index].total = calculateItemTotal(
        field === "quantity" ? value : updatedItems[index].quantity,
        field === "weight" ? value : updatedItems[index].weight,
        field === "rate" ? value : updatedItems[index].rate,
        trackBy
      );
    }

    setFormData((prev) => ({
      ...prev,
      items: updatedItems,
      total_amount: calculateTotalAmount(updatedItems),
    }));

    // Clear item-specific errors
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

  const addItem = () => {
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
          metal_purity: "",
          stone_purity: "",
          metal_weight: "",
          stone_type: "",
          metal_type: "",
          material_type: "",
          track_by: "quantity",
        },
      ],
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      const updatedItems = formData.items.filter((_, i) => i !== index);
      setFormData((prev) => ({
        ...prev,
        items: updatedItems,
        total_amount: calculateTotalAmount(updatedItems),
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Prepare payload
    const payload = {
      supplier_id: formData.supplier_id,
      order_date: formData.order_date,
      items: formData.items.map((item) => {
        const itemType = getItemType(item.inventory_item_id);
        const trackBy = item.track_by || "quantity";
        
        const baseItem = {
          inventory_item_id: item.inventory_item_id,
          quantity: trackBy === "quantity" ? parseFloat(item.quantity) || 0 : 0,
          weight: trackBy === "weight" ? parseFloat(item.weight) || 0 : 0,
          unit_id: item.unit_id,
          rate: parseFloat(item.rate),
          total: parseFloat(item.total),
          expected_date: item.expected_date || null,
          track_by: trackBy,
        };

        // Add item type specific fields
        if (itemType === "metal") {
          return {
            ...baseItem,
            metal_purity: item.metal_purity || null,
            metal_weight: parseFloat(item.metal_weight) || null,
            metal_type: item.metal_type || null,
            stone_purity: null,
            stone_type: null,
            material_type: null,
          };
        } else if (itemType === "stone") {
          return {
            ...baseItem,
            stone_purity: item.stone_purity || null,
            stone_type: item.stone_type || null,
            metal_purity: null,
            metal_weight: null,
            metal_type: null,
            material_type: null,
          };
        } else {
          return {
            ...baseItem,
            material_type: item.material_type || null,
            metal_purity: null,
            metal_weight: null,
            metal_type: null,
            stone_purity: null,
            stone_type: null,
          };
        }
      }),
      notes: formData.notes || "",
      total_amount: parseFloat(formData.total_amount),
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
          metal_purity: "",
          stone_purity: "",
          metal_weight: "",
          stone_type: "",
          metal_type: "",
          material_type: "",
          track_by: "quantity",
        },
      ],
      notes: "",
      total_amount: 0,
    });
    setErrors({});
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
          metal_purity: "",
          stone_purity: "",
          metal_weight: "",
          stone_type: "",
          metal_type: "",
          material_type: "",
          track_by: "quantity",
        },
      ],
      notes: "",
      total_amount: 0,
    });
    setErrors({});
    onClose();
  };

  // Get material type display with purity
  const getMaterialTypeDisplay = (item) => {
    if (item.metal_type) {
      return `Metal: ${item.metal_type}`;
    } else if (item.stone_type) {
      return `Stone: ${item.stone_type}`;
    } else if (item.material_type) {
      return `Material: ${item.material_type}`;
    }
    return "N/A";
  };

  // Check if component fields should be disabled
  const isDisabled =
    loading || loadingSuppliers || loadingInventoryItems || loadingUnits;

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-dialog-centered modal-xl">
        <div className="modal-content rounded-3">
          <div className="modal-header border-bottom pb-3">
            <h5 className="modal-title fw-bold fs-5">Create Purchase Order</h5>
            <button
              type="button"
              className="btn-close"
              onClick={handleClose}
              disabled={isDisabled}
              aria-label="Close"
            ></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="row mb-4">
                {/* Supplier */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-medium">
                    Supplier <span className="text-danger">*</span>
                  </label>
                  <select
                    name="supplier_id"
                    className={`form-select form-select-l ${
                      errors.supplier_id ? "is-invalid" : ""
                    }`}
                    value={formData.supplier_id}
                    onChange={handleChange}
                    disabled={isDisabled}
                  >
                    <option value="">Select Supplier</option>
                    {suppliers &&
                    Array.isArray(suppliers) &&
                    suppliers.length > 0 ? (
                      suppliers.map((supplier) => (
                        <option key={supplier._id} value={supplier._id}>
                          {supplier.name || supplier.supplier_name} -{" "}
                          {supplier.phone || "No phone"}
                        </option>
                      ))
                    ) : (
                      <option value="">No suppliers available</option>
                    )}
                  </select>
                  {errors.supplier_id && (
                    <div className="invalid-feedback">{errors.supplier_id}</div>
                  )}
                </div>

                {/* Order Date */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-medium">
                    Order Date <span className="text-danger">*</span>
                  </label>
                  <input
                    type="date"
                    name="order_date"
                    className={`form-control form-control-lg ${
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
              </div>

              {/* ITEMS SECTION */}
              <div className="border rounded-3 p-3 mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-bold mb-0">Order Items</h6>
                  <button
                    type="button"
                    className="btn btn-sm btn-primary d-flex align-items-center gap-1"
                    onClick={addItem}
                    disabled={isDisabled}
                  >
                    <FiPlus size={16} />
                    Add Item
                  </button>
                </div>

                {errors.items && (
                  <div className="alert alert-danger mb-3" role="alert">
                    {errors.items}
                  </div>
                )}

                <div className="table-responsive">
                  <table className="table align-middle">
                    <thead>
                      <tr>
                        <th width="20%">Item Name</th>
                        <th width="10%">Unit</th>
                        <th width="10%">Weight</th>
                        <th width="10%">Quantity</th>
                        <th width="10%">Rate (₹)</th>
                        <th width="15%">Type & Purity</th>
                        <th width="10%">Total (₹)</th>
                        <th width="10%">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.items.map((item, index) => {
                        const selectedItem = getSelectedItemDetails(
                          item.inventory_item_id
                        );
                        const itemType = getItemType(item.inventory_item_id);
                        const trackBy = item.track_by || "quantity";

                        return (
                          <tr key={index}>
                            <td>
                              <select
                                className={`form-select form-select-l ${
                                  errors[`items[${index}].inventory_item_id`]
                                    ? "is-invalid"
                                    : ""
                                }`}
                                value={item.inventory_item_id}
                                onChange={(e) =>
                                  handleItemChange(
                                    index,
                                    "inventory_item_id",
                                    e.target.value
                                  )
                                }
                                disabled={isDisabled}
                              >
                                <option value="">Select Item</option>
                                {inventoryItems &&
                                Array.isArray(inventoryItems) &&
                                inventoryItems.length > 0 ? (
                                  inventoryItems.map((invItem) => {
                                    const type =
                                      invItem.metals?.length > 0
                                        ? "metal"
                                        : invItem.stones?.length > 0
                                        ? "stone"
                                        : "material";
                                    const track = invItem.track_by || "quantity";

                                    return (
                                      <option
                                        key={invItem._id}
                                        value={invItem._id}
                                      >
                                        {invItem.item_name || invItem.name} ({type}, track: {track})
                                      </option>
                                    );
                                  })
                                ) : (
                                  <option value="">No items available</option>
                                )}
                              </select>
                              {errors[`items[${index}].inventory_item_id`] && (
                                <div className="invalid-feedback d-block">
                                  {errors[`items[${index}].inventory_item_id`]}
                                </div>
                              )}
                            </td>

                            <td>
                              <select
                                className={`form-select form-select-l ${
                                  errors[`items[${index}].unit_id`]
                                    ? "is-invalid"
                                    : ""
                                }`}
                                value={item.unit_id}
                                onChange={(e) =>
                                  handleItemChange(
                                    index,
                                    "unit_id",
                                    e.target.value
                                  )
                                }
                                disabled={isDisabled}
                              >
                                <option value="">Select Unit</option>
                                {units &&
                                Array.isArray(units) &&
                                units.length > 0 ? (
                                  units.map((unit) => (
                                    <option key={unit._id} value={unit._id}>
                                      {unit.name}
                                    </option>
                                  ))
                                ) : (
                                  <option value="">No units available</option>
                                )}
                              </select>
                              {errors[`items[${index}].unit_id`] && (
                                <div className="invalid-feedback d-block">
                                  {errors[`items[${index}].unit_id`]}
                                </div>
                              )}
                            </td>

                            {/* Weight field - Show only if track_by is "weight" */}
                            <td>
                              {trackBy === "weight" ? (
                                <div>
                                  <input
                                    type="number"
                                    className={`form-control ${
                                      errors[`items[${index}].weight`]
                                        ? "is-invalid"
                                        : ""
                                    }`}
                                    placeholder="Weight"
                                    value={item.weight}
                                    onChange={(e) =>
                                      handleItemChange(
                                        index,
                                        "weight",
                                        e.target.value
                                      )
                                    }
                                    disabled={isDisabled}
                                    min="0"
                                    step="0.001"
                                  />
                                  {errors[`items[${index}].weight`] && (
                                    <div className="invalid-feedback d-block">
                                      {errors[`items[${index}].weight`]}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="text-muted small">
                                  Not applicable
                                </div>
                              )}
                            </td>

                            {/* Quantity field - Show only if track_by is "quantity" */}
                            <td>
                              {trackBy === "quantity" ? (
                                <div>
                                  <input
                                    type="number"
                                    className={`form-control ${
                                      errors[`items[${index}].quantity`]
                                        ? "is-invalid"
                                        : ""
                                    }`}
                                    placeholder="Qty"
                                    value={item.quantity}
                                    onChange={(e) =>
                                      handleItemChange(
                                        index,
                                        "quantity",
                                        e.target.value
                                      )
                                    }
                                    disabled={isDisabled}
                                    min="0"
                                    step="0.001"
                                  />
                                  {errors[`items[${index}].quantity`] && (
                                    <div className="invalid-feedback d-block">
                                      {errors[`items[${index}].quantity`]}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="text-muted small">
                                  Not applicable
                                </div>
                              )}
                            </td>

                            <td>
                              <input
                                type="number"
                                className={`form-control ${
                                  errors[`items[${index}].rate`]
                                    ? "is-invalid"
                                    : ""
                                }`}
                                placeholder="Rate"
                                value={item.rate}
                                onChange={(e) =>
                                  handleItemChange(
                                    index,
                                    "rate",
                                    e.target.value
                                  )
                                }
                                disabled={isDisabled}
                                min="0"
                                step="0.01"
                              />
                              {errors[`items[${index}].rate`] && (
                                <div className="invalid-feedback d-block">
                                  {errors[`items[${index}].rate`]}
                                </div>
                              )}
                            </td>

                            {/* Type & Purity Field - Display only (not selectable) */}
                            <td>
                              <div>
                                {/* Type */}
                                <div className="fw-medium mb-1">
                                  {getMaterialTypeDisplay(item)}
                                </div>
                                
                                {/* Purity (display only) */}
                                {(item.metal_type || item.stone_type) && (
                                  <div>
                                    <span className="text-muted">Purity: </span>
                                    <span className="fw-medium">
                                      {item.metal_type ? item.metal_purity : item.stone_purity}
                                    </span>
                                  </div>
                                )}
                                
                                {/* Metal weight (if available) */}
                                {item.metal_weight && (
                                  <div className="small text-muted mt-1">
                                    Weight: {item.metal_weight}g
                                  </div>
                                )}
                              </div>
                            </td>

                            <td>
                              <input
                                type="text"
                                className="form-control bg-light"
                                value={`₹${item.total.toFixed(2)}`}
                                readOnly
                                disabled={isDisabled}
                              />
                            </td>

                            <td>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => removeItem(index)}
                                disabled={
                                  isDisabled || formData.items.length === 1
                                }
                              >
                                <FiTrash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Total Amount */}
                <div className="d-flex justify-content-end">
                  <div className="bg-light p-3 rounded-3">
                    <div className="d-flex align-items-center gap-3">
                      <span className="fw-bold">Total Amount:</span>
                      <span className="fs-4 fw-bold text-primary">
                        ₹{formData.total_amount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="mb-4">
                <label className="form-label fw-medium">Notes</label>
                <textarea
                  name="notes"
                  placeholder="Add any notes or special instructions..."
                  className="form-control form-control-lg"
                  value={formData.notes}
                  onChange={handleChange}
                  disabled={isDisabled}
                  rows={3}
                ></textarea>
              </div>
            </div>

            <div className="modal-footer border-top pt-3">
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