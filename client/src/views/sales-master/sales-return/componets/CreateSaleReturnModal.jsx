// components/CreateSaleReturnModal.jsx
import React, { useState, useEffect } from "react";
import { FiX, FiCheck, FiAlertCircle, FiPackage } from "react-icons/fi";

const CreateSaleReturnModal = ({ sale, onClose, onSave, loading = false }) => {
  const [formData, setFormData] = useState({
    sale_id: sale._id,
    return_date: new Date().toISOString().split("T")[0],
    reference_no: `RET-${sale.reference_no || sale._id?.slice(-6)}`,
    items: [],
    reason: "",
    return_type: "full",
    refund_amount: 0,
    total_amount: 0,
    notes: "",
  });

  const [errors, setErrors] = useState({});

  // Initialize items from sale - UPDATED FOR NEW RESPONSE
  useEffect(() => {
    if (sale.items && Array.isArray(sale.items)) {
      const initialItems = sale.items.map(item => {
        // Get quantity from the sale item - IT'S DIRECTLY IN ITEM OBJECT
        const quantity = parseFloat(item.quantity) || 0;
        
        // Get price fields from the item
        const price_before_tax = parseFloat(item.price_before_tax) || 0;
        const gst_rate = parseFloat(item.gst_rate) || 0;
        const gst_amount = parseFloat(item.gst_amount) || 0;
        const selling_total = parseFloat(item.selling_total) || 0;
        const final_total = parseFloat(item.final_total) || 0;

        return {
          product_id: item.product_id?._id || item.product_id,
          product_name: item.product_name || "Unknown Product",
          product_code: item.product_code || "",
          original_quantity: quantity,
          return_quantity: quantity, // Default to full return
          max_returnable: quantity,
          price_before_tax: price_before_tax,
          gst_rate: gst_rate,
          gst_amount: gst_amount,
          selling_total: selling_total,
          final_total: final_total,
          return_reason: "",
        };
      });

      setFormData(prev => ({
        ...prev,
        items: initialItems,
      }));

      calculateTotals(initialItems);
    }
  }, [sale]);

  // Calculate totals - UPDATED
  const calculateTotals = (items) => {
    const totalRefund = items.reduce((sum, item) => {
      if (item.original_quantity > 0) {
        const ratio = item.return_quantity / item.original_quantity;
        return sum + (item.final_total * ratio);
      }
      return sum;
    }, 0);

    setFormData(prev => ({
      ...prev,
      total_amount: totalRefund,
      refund_amount: totalRefund,
    }));
  };

  // Handle quantity change
  const handleQuantityChange = (index, value) => {
    const numValue = parseFloat(value) || 0;
    const maxValue = formData.items[index].max_returnable;

    if (numValue < 0 || numValue > maxValue) {
      return;
    }

    const updatedItems = [...formData.items];
    updatedItems[index] = {
      ...updatedItems[index],
      return_quantity: numValue,
    };

    setFormData(prev => ({
      ...prev,
      items: updatedItems,
    }));

    calculateTotals(updatedItems);
  };

  // Handle reason change
  const handleItemReasonChange = (index, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = {
      ...updatedItems[index],
      return_reason: value,
    };

    setFormData(prev => ({
      ...prev,
      items: updatedItems,
    }));
  };

  // Handle overall form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.reason.trim()) {
      newErrors.reason = "Return reason is required";
    }

    const hasReturnItems = formData.items.some(item => item.return_quantity > 0);
    if (!hasReturnItems) {
      newErrors.items = "At least one item must be returned";
    }

    formData.items.forEach((item, index) => {
      if (item.return_quantity > 0 && !item.return_reason.trim()) {
        newErrors[`item_${index}_reason`] = "Item return reason is required";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit - UPDATED FOR YOUR API STRUCTURE
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Prepare payload for your API
    const payload = {
      sale_id: formData.sale_id,
      return_date: formData.return_date,
      reference_no: formData.reference_no,
      items: formData.items
        .filter(item => item.return_quantity > 0)
        .map(item => {
          // Create item object matching your API requirements
          return {
            product_id: item.product_id,
            quantity: item.original_quantity, // Original quantity from sale
            return_quantity: parseFloat(item.return_quantity) || 0,
            price_before_tax: parseFloat(item.price_before_tax) || 0,
            gst_rate: parseFloat(item.gst_rate) || 0,
            gst_amount: parseFloat(item.gst_amount) || 0,
            selling_total: parseFloat(item.selling_total) || 0,
            final_total: parseFloat(item.final_total) || 0,
            return_reason: item.return_reason || "",
          };
        }),
      reason: formData.reason,
      return_type: formData.return_type,
      refund_amount: parseFloat(formData.refund_amount) || 0,
      total_amount: parseFloat(formData.total_amount) || 0,
      notes: formData.notes || "",
      status: "pending",
    };

    console.log("Submitting return data:", payload);
    onSave(payload);
  };

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
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content rounded-3">
          <div className="modal-header border-bottom pb-3">
            <h5 className="modal-title fw-bold fs-5">
              <FiPackage className="me-2" />
              Create Sale Return
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              disabled={loading}
              aria-label="Close"
            ></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {/* Sale Information */}
              <div className="card border-0 bg-light mb-4">
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6">
                      <h6 className="fw-bold mb-2">Sale Details</h6>
                      <div className="mb-2">
                        <small className="text-muted">Sale ID:</small>
                        <div className="fw-bold">
                          {sale._id?.slice(-8) || "N/A"}
                        </div>
                      </div>
                      <div className="mb-2">
                        <small className="text-muted">Customer:</small>
                        <div>
                          {sale.customer_id?.name || "N/A"}
                        </div>
                        {sale.customer_id?.mobile && (
                          <small className="text-muted">
                            {sale.customer_id.mobile}
                          </small>
                        )}
                      </div>
                      <div className="mb-2">
                        <small className="text-muted">Reference No:</small>
                        <div>{sale.reference_no || "N/A"}</div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-2">
                        <small className="text-muted">Original Total:</small>
                        <div className="fw-bold">
                          {formatCurrency(sale.total_amount || 0)}
                        </div>
                      </div>
                      <div className="mb-2">
                        <small className="text-muted">Sale Date:</small>
                        <div>
                          {sale.sale_date ? new Date(sale.sale_date).toLocaleDateString() : "N/A"}
                        </div>
                      </div>
                      <div className="mb-2">
                        <small className="text-muted">Status:</small>
                        <div className="text-capitalize">
                          {sale.sale_status || sale.status || "draft"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Return Details */}
              <div className="row mb-4">
                <div className="col-md-6">
                  <label className="form-label fw-medium">
                    Return Date <span className="text-danger">*</span>
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    name="return_date"
                    value={formData.return_date}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-medium">Reference No.</label>
                  <input
                    type="text"
                    className="form-control"
                    name="reference_no"
                    value={formData.reference_no}
                    onChange={handleChange}
                    placeholder="RET-001"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Return Items Table */}
              <div className="table-responsive mb-4">
                <table className="table table-bordered">
                  <thead className="table-light">
                    <tr>
                      <th>Product</th>
                      <th>Code</th>
                      <th>Original Qty</th>
                      <th>Return Qty</th>
                      <th>Unit Price</th>
                      <th>Return Amount</th>
                      <th>Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.items.map((item, index) => (
                      <tr key={index}>
                        <td>
                          <div className="fw-medium">{item.product_name}</div>
                        </td>
                        <td>
                          <small className="text-muted">{item.product_code}</small>
                        </td>
                        <td className="text-center">
                          <span className="badge bg-secondary">
                            {item.original_quantity}
                          </span>
                        </td>
                        <td>
                          <input
                            type="number"
                            className="form-control"
                            min="0"
                            max={item.max_returnable}
                            step="1"
                            value={item.return_quantity}
                            onChange={(e) => handleQuantityChange(index, e.target.value)}
                            style={{ width: "90px" }}
                            disabled={loading}
                          />
                          <small className="text-muted">
                            Max: {item.max_returnable}
                          </small>
                        </td>
                        <td>
                          <div className="text-end">
                            {formatCurrency(item.selling_total)}
                          </div>
                          <div className="text-muted small">
                            {formatCurrency(item.price_before_tax)} + {item.gst_rate}% GST
                          </div>
                        </td>
                        <td className="fw-medium text-end">
                          {formatCurrency(
                            (item.final_total * (item.return_quantity / item.original_quantity)) || 0
                          )}
                        </td>
                        <td>
                          <input
                            type="text"
                            className={`form-control ${
                              errors[`item_${index}_reason`] ? "is-invalid" : ""
                            }`}
                            value={item.return_reason}
                            onChange={(e) => handleItemReasonChange(index, e.target.value)}
                            placeholder="Defective, Wrong item, etc."
                            disabled={loading}
                          />
                          {errors[`item_${index}_reason`] && (
                            <div className="invalid-feedback">
                              {errors[`item_${index}_reason`]}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {errors.items && (
                  <div className="alert alert-warning py-2">
                    <FiAlertCircle className="me-2" />
                    {errors.items}
                  </div>
                )}
              </div>

              {/* Return Reason */}
              <div className="mb-4">
                <label className="form-label fw-medium">
                  Overall Return Reason <span className="text-danger">*</span>
                </label>
                <textarea
                  className={`form-control ${errors.reason ? "is-invalid" : ""}`}
                  rows={3}
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  placeholder="Please specify the reason for return..."
                  required
                  disabled={loading}
                />
                {errors.reason && (
                  <div className="invalid-feedback">{errors.reason}</div>
                )}
              </div>

              {/* Additional Notes */}
              <div className="mb-4">
                <label className="form-label fw-medium">Additional Notes</label>
                <textarea
                  className="form-control"
                  rows={2}
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Any additional notes..."
                  disabled={loading}
                />
              </div>

              {/* Summary */}
              <div className="card border-0 bg-light">
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-2">
                        <span className="text-muted">Return Type:</span>
                        <select
                          className="form-select form-select-sm d-inline-block ms-2"
                          style={{ width: "120px" }}
                          name="return_type"
                          value={formData.return_type}
                          onChange={handleChange}
                          disabled={loading}
                        >
                          <option value="full">Full Return</option>
                          <option value="partial">Partial Return</option>
                        </select>
                      </div>
                      <div className="mb-2">
                        <small className="text-muted">
                          {formData.return_type === "full" 
                            ? "All items will be returned" 
                            : "Partial return selected"}
                        </small>
                      </div>
                    </div>
                    <div className="col-md-6 text-end">
                      <div className="mb-2">
                        <span className="text-muted">Refund Amount:</span>
                        <div className="fw-bold fs-5 text-primary">
                          {formatCurrency(formData.refund_amount)}
                        </div>
                      </div>
                      <div className="text-muted small">
                        {formData.items.filter(item => item.return_quantity > 0).length} item(s) selected
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer border-top pt-3">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={onClose}
                disabled={loading}
              >
                <FiX className="me-1" />
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-warning"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                    Creating...
                  </>
                ) : (
                  <>
                    <FiCheck className="me-1" />
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

export default CreateSaleReturnModal;