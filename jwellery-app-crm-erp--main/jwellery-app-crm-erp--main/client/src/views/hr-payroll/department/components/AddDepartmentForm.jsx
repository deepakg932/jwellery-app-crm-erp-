// components/hr/AddDepartmentForm.jsx
import React, { useState } from "react";

const AddDepartmentForm = ({ onClose, onSave, loading = false }) => {
  const [formData, setFormData] = useState({
    department_name: "",
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation: only department name required
    if (!formData.department_name || !formData.department_name.trim()) {
      setError("Department name is required");
      return;
    }

    const departmentData = {
      department_name: formData.department_name.trim(),
    };

    try {
      await onSave(departmentData);
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
    setFormData({ department_name: "" });
    setError("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const isFormValid = () => {
    return !!(formData.department_name && formData.department_name.trim());
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
            <h5 className="modal-title fw-bold fs-5">Add Department</h5>
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
                {/* Department Name only */}
                <div className="col-12 mb-3">
                  <label className="form-label fw-medium">
                    Department Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="department_name"
                    className="form-control form-control-lg"
                    placeholder="e.g., Human Resources"
                    value={formData.department_name}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    style={{ minHeight: '44px' }}
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
                    Saving...
                  </>
                ) : (
                  "Save Department"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddDepartmentForm;