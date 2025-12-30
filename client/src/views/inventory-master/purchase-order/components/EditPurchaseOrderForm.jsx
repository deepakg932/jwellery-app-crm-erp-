import React, { useState, useEffect } from "react";
import { FiUpload, FiPlus, FiTrash2 } from "react-icons/fi";
import usePurchaseOrders from "@/hooks/usePurchaseOrders";

const EditPurchaseOrderForm = ({ onClose, onSave, purchaseOrder, loading = false }) => {
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
    order_date: "",
    items: [],
    notes: "",
    total_amount: 0,
  });

  const [errors, setErrors] = useState({});

  // Initialize form data when purchaseOrder prop changes
  useEffect(() => {
    if (purchaseOrder) {
      setFormData({
        supplier_id: purchaseOrder.supplier?._id || purchaseOrder.supplier_id?._id || "",
        order_date: purchaseOrder.order_date ? purchaseOrder.order_date.split('T')[0] : "",
        items: purchaseOrder.items?.map(item => ({
          inventory_item_id: item.inventory_item_id?._id || item.inventory_item?._id || "",
          quantity: item.quantity || "",
          weight: item.weight || "",
          unit_id: item.unit_id?._id || item.unit_id || "",
          rate: item.rate || "",
          total: item.total || 0,
          expected_date: item.expected_date ? item.expected_date.split('T')[0] : "",
        })) || [],
        notes: purchaseOrder.notes || "",
        total_amount: purchaseOrder.total_amount || 0,
      });
    }
  }, [purchaseOrder]);

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
        if (!item.quantity && !item.weight) {
          newErrors[`items[${index}].quantity_weight`] =
            "Either quantity or weight is required";
        }
        if (!item.rate || parseFloat(item.rate) <= 0) {
          newErrors[`items[${index}].rate`] = "Valid rate is required";
        }
        if (!item.unit_id) {
          newErrors[`items[${index}].unit_id`] = "Unit is required";
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateItemTotal = (quantity, weight, rate) => {
    const qty = parseFloat(quantity) || 0;
    const wt = parseFloat(weight) || 0;
    const rt = parseFloat(rate) || 0;

    // Use either quantity or weight for calculation
    const amount = qty > 0 ? qty : wt;
    return amount * rt;
  };

  const calculateTotalAmount = (items) => {
    return items.reduce((total, item) => {
      return total + (parseFloat(item.total) || 0);
    }, 0);
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    };

    // Calculate total when quantity, weight, or rate changes
    if (field === "quantity" || field === "weight" || field === "rate") {
      updatedItems[index].total = calculateItemTotal(
        field === "quantity" ? value : updatedItems[index].quantity,
        field === "weight" ? value : updatedItems[index].weight,
        field === "rate" ? value : updatedItems[index].rate
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
      items: formData.items.map((item) => ({
        inventory_item_id: item.inventory_item_id,
        quantity: parseFloat(item.quantity) || 0,
        weight: parseFloat(item.weight) || 0,
        unit_id: item.unit_id,
        rate: parseFloat(item.rate),
        total: parseFloat(item.total),
        expected_date: item.expected_date || null,
      })),
      notes: formData.notes || "",
      total_amount: parseFloat(formData.total_amount),
    };

    console.log("Updating purchase order data:", payload);
    onSave(payload);
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
      order_date: "",
      items: [],
      notes: "",
      total_amount: 0,
    });
    setErrors({});
    onClose();
  };

  // Check if unit is a weight unit
  const isWeightUnit = (unitId) => {
    const unit = units.find((u) => u._id === unitId);
    if (!unit) return false;

    const unitName = unit.name?.toLowerCase() || "";
    return (
      unitName.includes("g") ||
      unitName.includes("kg") ||
      unitName.includes("gram")
    );
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
            <h5 className="modal-title fw-bold fs-5">Edit Purchase Order</h5>
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
                          {supplier.name || supplier.supplier_name} - {supplier.phone || "No phone"}
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
                        <th width="25%">Item Name</th>
                        <th width="12%">Quantity</th>
                        <th width="12%">Weight</th>
                        <th width="12%">Unit</th>
                        <th width="12%">Rate (₹)</th>
                        <th width="12%">Expected Date</th>
                        <th width="10%">Total (₹)</th>
                        <th width="5%">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.items.map((item, index) => {
                        // Check if the selected unit is a weight unit
                        const isWeightItem = isWeightUnit(item.unit_id);

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
                                  inventoryItems.map((invItem) => (
                                    <option
                                      key={invItem._id}
                                      value={invItem._id}
                                    >
                                      {invItem.item_name || invItem.name}
                                    </option>
                                  ))
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

                            {/* Quantity field - enabled only if unit is NOT a weight unit */}
                            <td>
                              <input
                                type="number"
                                className={`form-control ${
                                  errors[`items[${index}].quantity_weight`] ||
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
                                disabled={isDisabled || isWeightItem}
                                min="0"
                                step="0.001"
                              />
                            </td>

                            {/* Weight field - enabled only if unit IS a weight unit */}
                            <td>
                              <input
                                type="number"
                                className={`form-control ${
                                  errors[`items[${index}].quantity_weight`] ||
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
                                disabled={isDisabled || !isWeightItem}
                                min="0"
                                step="0.001"
                              />
                              {(errors[`items[${index}].quantity_weight`] ||
                                errors[`items[${index}].weight`]) && (
                                <div className="invalid-feedback d-block">
                                  {errors[`items[${index}].quantity_weight`] ||
                                    errors[`items[${index}].weight`]}
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

                            <td>
                              <input
                                type="date"
                                className="form-control"
                                value={item.expected_date}
                                onChange={(e) =>
                                  handleItemChange(
                                    index,
                                    "expected_date",
                                    e.target.value
                                  )
                                }
                                disabled={isDisabled}
                                min={formData.order_date}
                              />
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
                    Updating...
                  </>
                ) : (
                  <>
                    <FiUpload size={16} />
                    Update Purchase Order
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

export default EditPurchaseOrderForm;