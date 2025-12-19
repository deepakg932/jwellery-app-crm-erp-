import React, { useState, useEffect } from "react";
import { useMaterial } from "@/hooks/useMaterial";

const AddMaterialForm = ({ onClose, onSave, loading = false }) => {
  const { metals, fetchMetals } = useMaterial();
  const [formData, setFormData] = useState({
    material_type: "",
    metal_type: "",
  });
  const [error, setError] = useState("");

  // Fetch metals on component mount
  useEffect(() => {
    fetchMetals();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const errors = [];
    if (!formData.material_type.trim()) {
      errors.push("Material type is required");
    }
    if (!formData.metal_type) {
      errors.push("Metal type is required");
    }

    if (errors.length > 0) {
      setError(errors.join(', '));
      return;
    }

    const materialData = {
      material_type: formData.material_type.trim(),
      metal_type: formData.metal_type, // This should be metal_id
    };

    try {
      await onSave(materialData);
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
    setFormData({
      material_type: "",
      metal_type: "",
    });
    setError("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const isFormValid = () => {
    return (
      formData.material_type.trim() &&
      formData.metal_type
    );
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
            <h5 className="modal-title fw-bold fs-5">Add Material Type</h5>
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
              {/* Material Type - Input field */}
              <div className="mb-3">
                <label className="form-label fw-medium">
                  Material Type <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="material_type"
                  className="form-control"
                  placeholder="Enter material type (e.g., Production Type, Raw Material)"
                  value={formData.material_type}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
                <div className="form-text">
                  Enter the name of the material type
                </div>
              </div>

              {/* Metal Type - Dropdown from API */}
              <div className="mb-3">
                <label className="form-label fw-medium">
                  Metal Type <span className="text-danger">*</span>
                </label>
                <select
                  name="metal_type"
                  className="form-select"
                  value={formData.metal_type}
                  onChange={handleChange}
                  required
                  disabled={loading}
                >
                  <option value="">Select Metal Type</option>
                  {metals.map((metal) => (
                    <option key={metal._id} value={metal._id}>
                      {metal.name}
                    </option>
                  ))}
                </select>
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
                  "Save Material Type"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddMaterialForm;