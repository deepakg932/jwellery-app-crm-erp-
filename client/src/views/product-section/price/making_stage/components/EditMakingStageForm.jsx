import React, { useState, useEffect, useRef } from "react";

const EditMakingStageForm = ({ show, onHide, onSubmit, stage_name, loading = false }) => {
  const [makingStage, setMakingStage] = useState("");
  const [error, setError] = useState("");
  const modalRef = useRef(null);

  // Reset form when making_stage changes
  useEffect(() => {
    if (stage_name) {
      setMakingStage(stage_name.stage_name || "");
      setError("");
    }
  }, [stage_name]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!makingStage.trim()) {
      setError("Please enter a making stage");
      return;
    }

    try {
      await onSubmit(makingStage.trim());
      // Parent handles closing
    } catch (err) {
      console.error("Form submission error:", err);
      setError("Failed to update. Please try again.");
    }
  };

  const handleClose = () => {
    setMakingStage("");
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
            <h5 className="modal-title fw-bold fs-5">Edit Making Stage</h5>
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
              {/* Making Stage */}
              <div className="mb-3">
                <label className="form-label fw-medium">
                  Making Stage <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control form-control-lg"
                  value={makingStage}
                  onChange={(e) => {
                    setMakingStage(e.target.value);
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
                  "Update Making Stage"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditMakingStageForm;