import React, { useState, useEffect, useCallback } from "react";

const EditCostType = ({
  show,
  onHide,
  onSubmit,
  costType,
  loading = false,
  costNames = [], // Array of { _id, cost_name }
}) => {
  const [formData, setFormData] = useState({
    cost_type: "",
    cost_name_id: "", // Store ID
    cost_name: "", // For display
  });
  const [error, setError] = useState("");

  // Find cost name by ID
  const getCostNameById = (id) => {
    const cost = costNames.find(cost => cost._id === id);
    return cost ? cost.cost_name : '';
  };

  // Reset form when costType changes
  useEffect(() => {
    if (costType) {
      // If costType has cost_name_id, use it directly
      // If not, find the ID from costNames using the cost_name text
      let costNameId = costType.cost_name_id || '';
      
      if (!costNameId && costType.cost_name) {
        // Find the ID by matching cost_name text
        const matchedCost = costNames.find(cost => cost.cost_name === costType.cost_name);
        if (matchedCost) {
          costNameId = matchedCost._id;
        }
      }

      setFormData({
        cost_type: costType.cost_type || "",
        cost_name_id: costNameId,
        cost_name: costType.cost_name || "",
      });
      setError("");
    }
  }, [costType, costNames]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.cost_type.trim()) {
      setError("Please enter a cost type");
      return;
    }

    if (!formData.cost_name_id) {
      setError("Please select a cost name");
      return;
    }

    try {
      // Prepare data for API - send ID
      const submitData = {
        cost_type: formData.cost_type.trim(),
        cost_name_id: formData.cost_name_id, // Send ID
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

    if (name === 'cost_name_id') {
      // When cost name ID changes, update display name too
      const selectedCostName = getCostNameById(value);
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        cost_name: selectedCostName,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    
    setError("");
  };

  const handleCostTypeChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      cost_type: value,
    }));
    setError("");
  };

  const handleClose = useCallback(() => {
    setFormData({
      cost_type: "",
      cost_name_id: "",
      cost_name: "",
    });
    setError("");
    onHide();
  }, [onHide]);

  // Debug info
  useEffect(() => {
    console.log("EditCostType formData:", formData);
    console.log("EditCostType costType prop:", costType);
  }, [formData, costType]);

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
            <div>
              <h5 className="modal-title fw-bold fs-5">Edit Cost Type</h5>
              {costType && costType._id && (
                <div className="small text-muted">ID: {costType._id}</div>
              )}
            </div>
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
                  onChange={handleCostTypeChange}
                  required
                  disabled={loading}
                />
              </div>

              {/* Cost Name Dropdown - Using IDs */}
              <div className="mb-3">
                <label className="form-label fw-medium">
                  Cost Name <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select form-select-lg"
                  name="cost_name_id"
                  value={formData.cost_name_id}
                  onChange={handleChange}
                  required
                  disabled={loading || costNames.length === 0}
                >
                  <option value="">Select cost name</option>
                  {costNames.map((cost) => (
                    <option key={cost._id} value={cost._id}>
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
                  !formData.cost_name_id ||
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