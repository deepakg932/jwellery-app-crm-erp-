import React, { useState, useEffect, useRef } from "react";

const EditUnitModal = ({ show, onHide, onSubmit, unit, loading = false }) => {
  const [unitName, setUnitName] = useState("");
  const [error, setError] = useState("");
  const modalRef = useRef(null);

  // Reset form when unit changes
  useEffect(() => {
    if (unit) {
      setUnitName(unit.name || "");
      setError("");
    }
  }, [unit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!unitName.trim()) {
      setError("Please enter a unit name");
      return;
    }

    try {
      await onSubmit(unitName.trim());
      // Parent handles closing
    } catch (err) {
      console.error("Form submission error:", err);
      setError("Failed to update. Please try again.");
    }
  };

  const handleClose = () => {
    setUnitName("");
    setError("");
    onHide();
  };

  // Don't render if not shown
  if (!show) return null;

  return (
    <div 
      className="modal fade show d-block" 
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} 
      tabIndex="-1"
      ref={modalRef}
      onClick={(e) => {
        // Close modal when clicking outside
        if (modalRef.current === e.target) {
          handleClose();
        }
      }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content rounded-3">
          
          {/* Header */}
          <div className="modal-header border-bottom pb-3">
            <h5 className="modal-title fw-bold fs-5">Edit Unit</h5>
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
              {/* Unit Name */}
              <div className="mb-3">
                <label className="form-label fw-medium">
                  Unit Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control form-control-lg"
                  value={unitName}
                  onChange={(e) => {
                    setUnitName(e.target.value);
                    setError("");
                  }}
                  required
                  disabled={loading}
                />
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
                    Updating...
                  </>
                ) : (
                  "Update Unit"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditUnitModal;