// components/hr/EditDepartmentForm.jsx
import React, { useState, useEffect } from "react";

const EditDepartmentForm = ({ show, onHide, onSubmit, department, loading = false }) => {
  const [formData, setFormData] = useState({
    department_name: "",
  });
  const [error, setError] = useState("");

  // Reset form when department changes
  useEffect(() => {
    if (department) {
      setFormData({
        department_name: department.department_name || "",
      });
      setError("");
    }
  }, [department]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation: only department name required
    if (!formData.department_name.trim()) {
      setError("Department name is required");
      return;
    }

    const departmentData = {
      department_name: formData.department_name.trim(),
    };

    try {
      await onSubmit(departmentData);
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
    setFormData({ department_name: "" });
    setError("");
    onHide();
  };

  const isFormValid = () => {
    return formData.department_name.trim();
  };

  // Don't render if not shown
  if (!show) return null;

  return (
    <div 
      className="modal fade show d-block" 
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} 
      tabIndex="-1"
    >
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '520px', width: '100%' }}>
        <div className="modal-content rounded-3" style={{ minHeight: '180px' }}>
          
          {/* Header */}
          <div className="modal-header border-bottom pb-3">
            <h5 className="modal-title fw-bold fs-5">Edit Department</h5>
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
                <div className="col-12 mb-3">
                  <label className="form-label fw-medium">
                    Department Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="department_name"
                    className="form-control form-control-lg"
                    value={formData.department_name}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    style={{ width: '100%', height: '46px' }}
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
                  "Update Department"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditDepartmentForm;