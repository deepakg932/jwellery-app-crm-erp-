import React, { useState, useCallback, useEffect } from "react";

const AddCostType = ({ 
  onClose, 
  onSave, 
  loading = false, 
  makingSubStages = [],
  costNames = []
}) => {
  const [formData, setFormData] = useState({
    cost_type: "",
    cost_name: "",
    sub_stage_name: ""
  });
  const [error, setError] = useState("");
  
  // Debug: Log the props to see what data is being passed
  useEffect(() => {
    console.log("AddCostType Props:", {
      makingSubStagesCount: makingSubStages.length,
      makingSubStages: makingSubStages,
      costNamesCount: costNames.length,
      costNames: costNames
    });
  }, [makingSubStages, costNames]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.cost_type.trim()) {
      setError("Please enter a cost type");
      return;
    }

    if (!formData.cost_name.trim()) {
      setError("Please select a cost name");
      return;
    }

    // Prepare data for API - send TEXT values
    const saveData = {
      cost_type: formData.cost_type.trim(),
      cost_name: formData.cost_name.trim(),
      sub_stage_name: formData.sub_stage_name.trim() || "",
      is_active: true,
    };

    console.log("Saving cost type data:", saveData);
    onSave(saveData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
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
    onClose();
  }, [onClose]);

  // Get selected sub-stage for display
  const selectedSubStage = makingSubStages.find(
    subStage => subStage.sub_stage_name === formData.sub_stage_name
  );
  
  const selectedStageName = selectedSubStage?.stage_name || "";

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
            <h5 className="modal-title fw-bold fs-5">Add Cost Type</h5>
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

          {/* Debug Info - Remove in production */}
          {/* <div className="px-3 pb-2 text-muted small">
            <div>Cost Names: {costNames.length} items</div>
            <div>Sub-Stages: {makingSubStages.length} items</div>
            {makingSubStages.length > 0 && (
              <div className="mt-1">
                First sub-stage sample: {JSON.stringify(makingSubStages[0])}
              </div>
            )}
          </div> */}

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
                  {costNames.map((cost, index) => {
                    // Try different property names
                    const costName = cost.cost_name || cost.name || "";
                    const costId = cost._id || index;
                    
                    return (
                      <option key={costId} value={costName}>
                        {costName}
                      </option>
                    );
                  })}
                </select>
                {costNames.length === 0 && !loading && (
                  <div className="text-danger small mt-1">
                    No cost names available. Please add costs first.
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
                  <option value="">Select sub-stage</option>
                  {makingSubStages.map((subStage, index) => {
                    // Try different property names for sub-stage
                    const subStageName = subStage.sub_stage_name || subStage.name || "";
                    const subStageId = subStage._id || index;
                    
                    // Try different property names for stage name
                    let stageName = "";
                    if (subStage.stage_name) {
                      stageName = subStage.stage_name;
                    } else if (subStage.stage_id?.stage_name) {
                      stageName = subStage.stage_id.stage_name;
                    } else if (subStage.makingStageName) {
                      stageName = subStage.makingStageName;
                    }
                    
                    return (
                      <option key={subStageId} value={subStageName}>
                        {subStageName}
                        {/* {stageName && ` (${stageName})`} */}
                      </option>
                    );
                  })}
                </select>
                {makingSubStages.length === 0 && !loading && (
                  <div className="text-danger small mt-1">
                    No sub-stages available. Please add making sub-stages first.
                  </div>
                )}
              </div>

              {/* Preview Section
              {(formData.cost_type || formData.cost_name || formData.sub_stage_name) && (
                <div className="border rounded p-3 bg-light">
                  <h6 className="fw-medium mb-2">Preview:</h6>
                  <div className="d-flex flex-column gap-2">
                    {formData.cost_type && (
                      <div>
                        <span className="fw-medium">Cost Type:</span> {formData.cost_type}
                      </div>
                    )}
                    {formData.cost_name && (
                      <div>
                        <span className="fw-medium">Cost Name:</span> {formData.cost_name}
                      </div>
                    )}
                    {formData.sub_stage_name && (
                      <div>
                        <span className="fw-medium">Sub-Stage:</span> {formData.sub_stage_name}
                        {selectedStageName && ` (${selectedStageName})`}
                      </div>
                    )}
                  </div>
                </div>
              )} */}
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
                  loading ||
                  costNames.length === 0
                }
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
                  "Save Cost Type"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddCostType;