// components/hr/EditLeaveTypeForm.jsx
import React, { useState, useEffect } from "react";

const EditLeaveTypeForm = ({
  show,
  onHide,
  onSubmit,
  leaveType,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    leave_type_name: "",
    leave_paid_status: "Paid",
    leave_allotment_type: "",
    no_of_leaves: "",
    monthly_limit: "",
  });
  const [error, setError] = useState("");

  // Reset form when leaveType changes
  useEffect(() => {
    if (leaveType) {
      setFormData({
        leave_type_name: leaveType.leave_type_name || "",
        leave_paid_status: leaveType.leave_paid_status || "Paid",
        leave_allotment_type: leaveType.leave_allotment_type || "",
        no_of_leaves: leaveType.no_of_leaves || "",
        monthly_limit: leaveType.monthly_limit || "",
      });
      setError("");
    }
  }, [leaveType]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation: check required fields
    if (!formData.leave_type_name || !formData.leave_type_name.trim()) {
      setError("Leave type name is required");
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
      await onSubmit(leaveTypeData);
    } catch (err) {
      console.error("Form submission error:", err);
      setError("Failed to update. Please try again.");
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

  const handleClose = () => {
    setFormData({
      leave_type_name: "",
      leave_paid_status: "Paid",
      leave_allotment_type: "",
      no_of_leaves: "",
      monthly_limit: "",
    });
    setError("");
    onHide();
  };

  const isFormValid = () => {
    return !!(
      formData.leave_type_name &&
      formData.leave_type_name.trim() &&
      formData.no_of_leaves &&
      formData.monthly_limit
    );
  };

  // Don't render if not shown
  if (!show) return null;

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
            <h5 className="modal-title fw-bold fs-5">Edit Leave Type</h5>
            <button
              type="button"
              className="btn-close"
              onClick={handleClose}
              disabled={loading}
              aria-label="Close"
            />
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

              {/* No of Monthly/Yearly Leaves */}
              <div className="row mb-3">
                <div className="col-12">
                  <label className="form-label fw-medium">
                    No of{" "}
                    {formData.leave_allotment_type === "Monthly"
                      ? "Monthly"
                      : "Yearly"}{" "}
                    Leaves
                  </label>
                  <input
                    type="number"
                    name="no_of_leaves"
                    className="form-control"
                    placeholder="Enter number of leaves"
                    value={formData.no_of_leaves}
                    onChange={handleChange}
                    disabled={loading}
                    min="0"
                    step="0.5"
                  />
                </div>
              </div>

              {/* Monthly Limit */}
              {formData.leave_allotment_type === "Yearly" && (
                <div className="row mb-3">
                  <div className="col-12">
                    <label className="form-label fw-medium">
                      Monthly Limit
                    </label>
                    <input
                      type="number"
                      name="monthly_limit"
                      className="form-control"
                      placeholder="Enter monthly limit (if applicable)"
                      value={formData.monthly_limit}
                      onChange={handleChange}
                      disabled={loading}
                      min="0"
                      step="0.5"
                    />
                  </div>
                </div>
              )}

              {/* <div className="row mb-3">
                <div className="col-12">
                  <label className="form-label fw-medium">Monthly Limit</label>
                  <input
                    type="number"
                    name="monthly_limit"
                    className="form-control"
                    placeholder="Enter monthly limit (if applicable)"
                    value={formData.monthly_limit}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
              </div> */}
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
                    Updating...
                  </>
                ) : (
                  "Update Leave Type"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditLeaveTypeForm;
