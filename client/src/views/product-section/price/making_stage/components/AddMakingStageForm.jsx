import React, { useState, useRef } from "react";

const AddMakingStageForm = ({ onClose, onSave, loading = false }) => {
  const [makingStage, setMakingStage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!makingStage.trim()) {
      setError("Please enter a making stage");
      return;
    }

    try {
      await onSave(makingStage.trim());
      setMakingStage("");
      setError("");
    } catch (error) {
      console.error("Save failed:", error);
      setError("Failed to save. Please try again.");
    }
  };

  const handleClose = () => {
    setMakingStage("");
    setError("");
    onClose();
  };

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content rounded-3">
          
          {/* Header */}
          <div className="modal-header border-bottom pb-3">
            <h5 className="modal-title fw-bold fs-5">Add Making Stage</h5>
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
              {/* Making Stage Name */}
              <div className="mb-3">
                <label className="form-label fw-medium">
                  Making Stage Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control form-control-lg"
                  placeholder="Making Stage Name"
                  value={makingStage}
                  onChange={(e) => {
                    setMakingStage(e.target.value);
                    setError("");
                  }}
                  required
                  disabled={loading}
                />
                <div className="form-text">
                  Enter a descriptive name for the making stage
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
                disabled={!makingStage.trim() || loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Saving...
                  </>
                ) : (
                  "Save Making Stage"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddMakingStageForm;