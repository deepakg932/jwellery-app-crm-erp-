import React, { useState } from "react";
import { toast } from "react-toastify";

const AddWastageForm = ({ onClose, onSave, loading = false }) => {
  const [formData, setFormData] = useState({
    wastage_type: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const errors = [];

    if (!formData.wastage_type.trim()) {
      errors.push("Wastage type is required");
    }

    if (errors.length > 0) {
      toast.error(errors.join(', '));
      return;
    }

    const wastageData = {
      wastage_type: formData.wastage_type.trim(),
    };

    try {
      await onSave(wastageData);
      resetForm();
    } catch (error) {
      console.error("Save failed:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      wastage_type: "",
    });
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
            <h5 className="modal-title fw-bold fs-5">Add Wastage Type</h5>
            <button
              type="button"
              className="btn-close"
              onClick={handleClose}
              disabled={loading}
            ></button>
          </div>

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
                    placeholder="Enter wastage type"
                    value={formData.wastage_type}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  <div className="form-text">
                    e.g., Cutting Wastage, Sewing Wastage, Storage Wastage
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
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Saving...
                  </>
                ) : (
                  "Save Wastage Type"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddWastageForm;