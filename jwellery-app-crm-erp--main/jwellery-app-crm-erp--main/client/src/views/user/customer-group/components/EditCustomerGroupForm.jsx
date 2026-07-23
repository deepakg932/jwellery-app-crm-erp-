import React, { useState, useEffect } from "react";

const EditCustomerGroupForm = ({ onClose, onSave, customerGroup, loading = false }) => {
  const [customer_group, setCustomerGroup] = useState("");
  const [error, setError] = useState("");

  // Reset form when customerGroup changes
  useEffect(() => {
    if (customerGroup) {
      setCustomerGroup(customerGroup.customer_group || "");
      setError("");
    }
  }, [customerGroup]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!customer_group.trim()) {
      setError("Please enter a customer group");
      return;
    }

    try {
      await onSave(customer_group.trim());
    } catch (error) {
      console.error("Save failed:", error);
      setError("Failed to save. Please try again.");
    }
  };

  const handleClose = () => {
    setCustomerGroup("");
    setError("");
    onClose();
  };

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content rounded-3">
          
          {/* Header */}
          <div className="modal-header border-bottom pb-3">
            <h5 className="modal-title fw-bold fs-5">Edit Customer Group</h5>
            <button
              type="button"
              className="btn-close"
              onClick={handleClose}
              disabled={loading}
              aria-label="Close"
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
              {/* Customer Group */}
              <div className="mb-3">
                <label className="form-label fw-medium">
                  Customer Group <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control form-control-lg"
                  placeholder="Enter customer group"
                  value={customer_group}
                  onChange={(e) => {
                    setCustomerGroup(e.target.value);
                    setError("");
                  }}
                  required
                  disabled={loading}
                />
                <div className="form-text">
                  Enter a descriptive name for the customer group
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="modal-footer border-top pt-3">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!customer_group.trim() || loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Saving...
                  </>
                ) : (
                  "Update Customer Group"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditCustomerGroupForm;