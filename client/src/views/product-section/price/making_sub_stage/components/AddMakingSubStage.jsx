import React, { useState, useCallback } from "react";
import { toast } from "react-toastify";
const AddMakingSubStage = ({
  onClose,
  onSave,
  loading = false,
  makingStages = [],
}) => {
  const [name, setName] = useState("");
  const [selectedStage, setSelectedStage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter a making sub-stage name");
      return;
    }

    if (!selectedStage.trim()) {
      toast.error("Please select a making stage");
      return;
    }

    onSave({
      sub_stage_name: name.trim(),
      making_stage_id: selectedStage,
    });

    // Reset form
    setName("");
    setSelectedStage("");
  };

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

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
            <h5 className="modal-title fw-bold fs-5">Add Making Sub-Stage</h5>
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
              {/* Making Sub-Stage Name */}
              <div className="mb-3">
                <label className="form-label fw-medium">
                  Sub-Stage Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control form-control-lg"
                  placeholder="e.g., Metal Casting, Stone Setting, Polishing"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                  }}
                  disabled={loading}
                />
              </div>

              {/* Making Stage Dropdown */}
              <div className="mb-3">
                <label className="form-label fw-medium">
                  Making Stage <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select form-select-lg"
                  value={selectedStage}
                  onChange={(e) => {
                    setSelectedStage(e.target.value);
                  }}
                  disabled={loading || makingStages.length === 0}
                >
                  <option value="">Select making stage</option>
                  {makingStages.map((stage) => (
                    <option key={stage._id} value={stage._id}>
                      {stage.stage_name}
                    </option>
                  ))}
                </select>
                {makingStages.length === 0 && !loading && (
                  <div className="text-danger small mt-1">
                    No making stages available. Please add making stages first.
                  </div>
                )}
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
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Saving...
                  </>
                ) : (
                  "Save Sub-Stage"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddMakingSubStage;
