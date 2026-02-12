import React, { useState, useCallback, useEffect } from "react";

const AddCostType = ({
  onClose,
  onSave,
  loading = false,
  costNames = [], // This should come from hook's costNames array
}) => {
  const [formData, setFormData] = useState({
    cost_type: "",
    cost_name_id: "", // Changed to store ID
    cost_name: "", // For display only
  });
  const [error, setError] = useState("");

  // Debug: Log the props to see what data is being passed
  useEffect(() => {
    console.log("AddCostType Props:", {
      costNamesCount: costNames.length,
      costNames: costNames,
    });
  }, [costNames]);

  // Find cost name by ID for display
  const getCostNameById = (id) => {
    const cost = costNames.find(cost => cost._id === id);
    return cost ? cost.cost_name : '';
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!formData.cost_type.trim()) {
      setError("Please enter a cost type");
      return;
    }

    if (!formData.cost_name_id) {
      setError("Please select a cost name");
      return;
    }

    // Prepare data for API - send ID
    const saveData = {
      cost_type: formData.cost_type.trim(),
      cost_name_id: formData.cost_name_id, // Send ID
      is_active: true,
    };

    console.log("Saving cost type data:", saveData);
    onSave(saveData);
  };

  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'cost_name_id') {
      // When cost name ID changes, also update the display name
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

  // Handle manual cost type change
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
                  {costNames.map((cost) => {
                    // Cost name object structure from hook
                    const costId = cost._id;
                    const costName = cost.cost_name || '';

                    return (
                      <option key={costId} value={costId}>
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