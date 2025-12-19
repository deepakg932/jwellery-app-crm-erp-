import React, { useState, useEffect, useCallback } from "react";

const EditCostType = ({
  show,
  onHide,
  onSubmit,
  costType,
  loading = false,
  costNames = [], // Array of { _id, cost_name }
  makingSubStages = [],
}) => {
  const [formData, setFormData] = useState({
    cost_type: "",
    cost_name: "", // Store cost name TEXT
    sub_stage_name: "" // Store sub-stage name TEXT
  });
  const [error, setError] = useState("");

  // Reset form when costType changes
  useEffect(() => {
    if (costType) {
      setFormData({
        cost_type: costType.cost_type || "",
        cost_name: costType.cost_name || "", // Use TEXT value
        sub_stage_name: costType.sub_stage_name || "" // Use TEXT value
      });
      setError("");
    }
  }, [costType]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.cost_type.trim()) {
      setError("Please enter a cost type");
      return;
    }

    if (!formData.cost_name.trim()) {
      setError("Please select a cost name");
      return;
    }

    try {
      // Prepare data for API - send TEXT values
      const submitData = {
        cost_type: formData.cost_type.trim(),
        cost_name: formData.cost_name.trim(), // Send TEXT
        sub_stage_name: formData.sub_stage_name.trim() || "", // Send TEXT
        is_active: true,
      };

      console.log("Submitting edit data:", submitData);
      await onSubmit(submitData);
    } catch (err) {
      console.error("Form submission error:", err);
      setError("Failed to update. Please try again.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleClose = useCallback(() => {
    setFormData({
      cost_type: "",
      cost_name: "",
      sub_stage_name: ""
    });
    setError("");
    onHide();
  }, [onHide]);

  // Get selected sub-stage for display
  const selectedSubStage = makingSubStages.find(
    subStage => subStage.sub_stage_name === formData.sub_stage_name
  );
  
  const selectedStageName = selectedSubStage?.stage_name || "";

  // Don't render if not shown
  if (!show) return null;

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
            <h5 className="modal-title fw-bold fs-5">Edit Cost Type</h5>
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
              {/* Cost Type */}
              <div className="mb-3">
                <label className="form-label fw-medium">
                  Cost Type <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control form-control-lg"
                  placeholder="e.g., Direct Cost, Indirect Cost, Labor Cost"
                  name="cost_type"
                  value={formData.cost_type}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              {/* Cost Name Dropdown */}
              <div className="mb-3">
                <label className="form-label fw-medium">
                  Cost Name <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select form-select-lg"
                  name="cost_name"
                  value={formData.cost_name}
                  onChange={handleChange}
                  required
                  disabled={loading || costNames.length === 0}
                >
                  <option value="">Select cost name</option>
                  {costNames.map((cost) => (
                    <option key={cost._id} value={cost.cost_name}>
                      {cost.cost_name}
                    </option>
                  ))}
                </select>
                {costNames.length === 0 && !loading && (
                  <div className="text-danger small mt-1">
                    No cost names available
                  </div>
                )}
              </div>

              {/* Making Sub-Stage Dropdown */}
              <div className="mb-3">
                <label className="form-label fw-medium">
                  Making Sub-Stage
                </label>
                <select
                  className="form-select form-select-lg"
                  name="sub_stage_name"
                  value={formData.sub_stage_name}
                  onChange={handleChange}
                  disabled={loading || makingSubStages.length === 0}
                >
                  <option value="">Select sub-stage (optional)</option>
                  {makingSubStages.map((subStage) => {
                    // Handle different property names
                    const subStageName = subStage.sub_stage_name || subStage.name || "";
                    const stageName = subStage.stage_name || subStage.makingStageName || "";
                    
                    return (
                      <option key={subStage._id} value={subStageName}>
                        {subStageName}
                        {stageName && ` (${stageName})`}
                      </option>
                    );
                  })}
                </select>
                {makingSubStages.length === 0 && !loading && (
                  <div className="text-danger small mt-1">
                    No sub-stages available
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
                disabled={
                  !formData.cost_type.trim() ||
                  !formData.cost_name.trim() ||
                  loading
                }
              >
                {loading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Updating...
                  </>
                ) : (
                  "Update Cost Type"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditCostType;