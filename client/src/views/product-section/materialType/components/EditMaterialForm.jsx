import React, { useState, useEffect } from "react";
import { useMaterial } from "@/hooks/useMaterial";

const EditMaterialForm = ({ show, onHide, onSubmit, material, loading = false }) => {
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

  // Reset form when material changes
  useEffect(() => {
    if (material) {
      setFormData({
        material_type: material.material_type || "",
        metal_type: material.metal_id || "",
      });
      setError("");
    }
  }, [material]);

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
      metal_type: formData.metal_type,
    };

    try {
      await onSubmit(materialData);
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
      material_type: "",
      metal_type: "",
    });
    setError("");
    onHide();
  };

  const isFormValid = () => {
    return (
      formData.material_type.trim() &&
      formData.metal_type
    );
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
            <h5 className="modal-title fw-bold fs-5">Edit Material Type</h5>
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
              {/* Material Type - Input field */}
              <div className="mb-3">
                <label className="form-label fw-medium">
                  Material Type <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="material_type"
                  className="form-control"
                  placeholder="Enter material type"
                  value={formData.material_type}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
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
                    Updating...
                  </>
                ) : (
                  "Update Material Type"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditMaterialForm;