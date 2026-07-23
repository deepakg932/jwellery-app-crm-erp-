// components/hr/AddLeaveTypeForm.jsx
import React, { useState } from "react";

const AddLeaveTypeForm = ({ onClose, onSave, loading = false }) => {
  const [formData, setFormData] = useState({
    leave_type_name: "",
    leave_paid_status: "Paid",
    leave_allotment_type: "Monthly", // Set to "Monthly" by default as shown in image
    no_of_leaves: "",
    monthly_limit: "",
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation: check required fields
    if (!formData.leave_type_name || !formData.leave_type_name.trim()) {
      setError("Leave type name is required");
      return;
    }

    // Validate no_of_leaves based on allotment type
    if (!formData.no_of_leaves) {
      setError(`Number of ${formData.leave_allotment_type === "Monthly" ? "monthly" : "yearly"} leaves is required`);
      return;
    }

    // Validate monthly limit if allotment type is Yearly
    if (formData.leave_allotment_type === "Yearly" && !formData.monthly_limit) {
      setError("Monthly limit is required for yearly leave type");
      return;
    }

    const leaveTypeData = {
      leave_type_name: formData.leave_type_name.trim(),
      leave_paid_status: formData.leave_paid_status,
      leave_allotment_type: formData.leave_allotment_type,
      no_of_leaves: formData.no_of_leaves,
      monthly_limit: formData.monthly_limit,
    };

    try {
      await onSave(leaveTypeData);
      resetForm();
    } catch (error) {
      console.error("Save failed:", error);
      setError("Failed to save. Please try again.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const resetForm = () => {
    setFormData({
      leave_type_name: "",
      leave_paid_status: "Paid",
      leave_allotment_type: "Monthly",
      no_of_leaves: "",
      monthly_limit: "",
    });
    setError("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content rounded-3">
          {/* Header */}
          <div className="modal-header border-bottom pb-3">
            <h5 className="modal-title fw-bold fs-5">Add New Leave Type</h5>
            <button
              type="button"
              className="btn-close"
              onClick={handleClose}
              disabled={loading}
            ></button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="alert alert-danger m-3 py-2" role="alert">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {/* General Section */}
              <h6 className="fw-bold mb-3">General</h6>

              {/* Leave Type */}
              <div className="row mb-3">
                <div className="col-6">
                  <label className="form-label fw-medium">
                    Leave Type <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="leave_type_name"
                    className="form-control"
                    placeholder="E.g. Sick, Casual"
                    value={formData.leave_type_name}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>

                {/* Leave Paid Status */}
                <div className="col-6">
                  <label className="form-label fw-medium">
                    Leave Paid Status
                  </label>
                  <select
                    name="leave_paid_status"
                    className="form-select"
                    value={formData.leave_paid_status}
                    onChange={handleChange}
                    disabled={loading}
                  >
                    <option value="Paid">Paid</option>
                    <option value="Unpaid">Unpaid</option>
                    <option value="Partial">Partial</option>
                  </select>
                </div>
              </div>

              {/* Leave Allotment Type */}
              <div className="row mb-3">
                <div className="col-12">
                  <label className="form-label fw-medium">
                    Leave Allotment Type
                  </label>
                  <select
                    name="leave_allotment_type"
                    className="form-select"
                    value={formData.leave_allotment_type}
                    onChange={handleChange}
                    disabled={loading}
                  >
                    <option value="Monthly">Monthly Leave Type</option>
                    <option value="Yearly">Yearly Leave Type</option>
                  </select>
                </div>
              </div>

              {/* Number of Leaves based on Allotment Type */}
              <div className="row mb-3">
                <div className="col-12">
                  <label className="form-label fw-medium">
                    {formData.leave_allotment_type === "Monthly" 
                      ? "No of Monthly Leaves" 
                      : "No of Yearly Leaves"}
                  </label>
                  <input
                    type="number"
                    name="no_of_leaves"
                    className="form-control"
                    placeholder={`Enter number of leaves per ${
                      formData.leave_allotment_type === "Monthly" ? "month" : "year"
                    }`}
                    value={formData.no_of_leaves}
                    onChange={handleChange}
                    disabled={loading}
                    min="0"
                    step="0.5"
                  />
                </div>
              </div>

              {/* Monthly Limit - only shown for Yearly allotment type */}
              {formData.leave_allotment_type === "Yearly" && (
                <div className="row mb-3">
                  <div className="col-12">
                    <label className="form-label fw-medium">
                      Monthly Limit <span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      name="monthly_limit"
                      className="form-control"
                      placeholder="Enter monthly limit (required for yearly leaves)"
                      value={formData.monthly_limit}
                      onChange={handleChange}
                      disabled={loading}
                      min="0"
                      step="0.5"
                      required
                    />
                    <small className="text-muted">
                      Maximum leaves allowed per month
                    </small>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="modal-footer border-top pt-3">
              <button
                type="button"
                className="btn btn-outline-secondary px-4"
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary px-4"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Saving...
                  </>
                ) : (
                  "Save"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddLeaveTypeForm;