import React, { useState, useRef } from "react";

const AddUnitModal = ({ onClose, onSave, loading = false }) => {
  const [unitName, setUnitName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!unitName.trim()) {
      setError("Please enter a unit name");
      return;
    }

    try {
      await onSave(unitName.trim());
      setUnitName("");
      setError("");
    } catch (error) {
      console.error("Save failed:", error);
      setError("Failed to save. Please try again.");
    }
  };

  const handleClose = () => {
    setUnitName("");
    setError("");
    onClose();
  };

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content rounded-3">
          
          {/* Header */}
          <div className="modal-header border-bottom pb-3">
            <h5 className="modal-title fw-bold fs-5">Add Unit</h5>
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
              {/* Unit Name */}
              <div className="mb-3">
                <label className="form-label fw-medium">
                  Unit Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control form-control-lg"
                  placeholder="e.g., Gram, Kilogram, Carat, Ounce"
                  value={unitName}
                  onChange={(e) => {
                    setUnitName(e.target.value);
                    setError("");
                  }}
                  required
                  disabled={loading}
                />
                <div className="form-text">
                  Enter a descriptive name for the unit
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
                disabled={!unitName.trim() || loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Saving...
                  </>
                ) : (
                  "Save Unit"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddUnitModal;