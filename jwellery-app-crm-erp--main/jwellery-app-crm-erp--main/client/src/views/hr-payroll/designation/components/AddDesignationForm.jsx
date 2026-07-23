// components/hr/AddDesignationForm.jsx
import React, { useState } from "react";

const AddDesignationForm = ({ onClose, onSave, loading = false }) => {
  const [formData, setFormData] = useState({
    designation_name: "",
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation: only designation name required
    if (!formData.designation_name || !formData.designation_name.trim()) {
      setError("Designation name is required");
      return;
    }

    const designationData = {
      designation_name: formData.designation_name.trim(),
    };

    try {
      await onSave(designationData);
      resetForm();
    } catch (error) {
      console.error("Save failed:", error);
      setError("Failed to save. Please try again.");
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

  const resetForm = () => {
    setFormData({ designation_name: "" });
    setError("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const isFormValid = () => {
    return !!(formData.designation_name && formData.designation_name.trim());
  };

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '520px' }}>
        <div className="modal-content rounded-3" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
          {/* Header */}
          <div className="modal-header border-bottom pb-3">
            <h5 className="modal-title fw-bold fs-5">Add Designation</h5>
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
              <div className="row">
                {/* Designation Name only */}
                <div className="col-12 mb-3">
                  <label className="form-label fw-medium">
                    Designation Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="designation_name"
                    className="form-control form-control-lg"
                    placeholder="e.g., Software Engineer"
                    value={formData.designation_name}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    style={{ minHeight: '44px' }}
                  />
                  <div className="form-text">
                    Enter the job title or position name
                  </div>
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
                    Saving...
                  </>
                ) : (
                  "Save Designation"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddDesignationForm;