import React, { useState, useEffect } from "react";

const EditWastageForm = ({ show, onHide, onSubmit, wastage, loading = false }) => {
  const [formData, setFormData] = useState({
    wastage_type: "",
  });
  const [error, setError] = useState("");

  // Reset form when wastage changes
  useEffect(() => {
    if (wastage) {
      setFormData({
        wastage_type: wastage.wastage_type || "",
      });
      setError("");
    }
  }, [wastage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const errors = [];

    if (!formData.wastage_type.trim()) {
      errors.push("Wastage type is required");
    }

    if (errors.length > 0) {
      setError(errors.join(', '));
      return;
    }

    const wastageData = {
      wastage_type: formData.wastage_type.trim(),
    };

    try {
      await onSubmit(wastageData);
    } catch (err) {
      console.error("Form submission error:", err);
      setError("Failed to update. Please try again.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError("");
  };

  const handleClose = () => {
    setFormData({
      wastage_type: "",
    });
    setError("");
    onHide();
  };

  const isFormValid = () => {
    return formData.wastage_type.trim();
  };

  // Don't render if not shown
  if (!show) return null;

  return (
    <div 
      className="modal fade show d-block" 
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} 
      tabIndex="-1"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content rounded-3">
          
          {/* Header */}
          <div className="modal-header border-bottom pb-3">
            <h5 className="modal-title fw-bold fs-5">Edit Wastage Type</h5>
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
              <div className="row">
                {/* wastage type */}
                <div className="mb-3">
                  <label className="form-label fw-medium">
                    Wastage Type <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="wastage_type"
                    className="form-control form-control-lg"
                    value={formData.wastage_type}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
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
                disabled={!isFormValid() || loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Updating...
                  </>
                ) : (
                  "Update Wastage Type"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditWastageForm;