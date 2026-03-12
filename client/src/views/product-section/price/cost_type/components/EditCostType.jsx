import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";

const EditCostType = ({
  show,
  onHide,
  onSubmit,
  costType,
  loading = false,
  costNames = [],
}) => {
  const [formData, setFormData] = useState({
    cost_type: "",
    cost_name_id: "",
    cost_name: "",
  });
  const [error, setError] = useState("");

  const getCostNameById = (id) => {
    const cost = costNames.find((cost) => cost._id === id);
    return cost ? cost.cost_name : "";
  };

  // Reset form when costType changes
  useEffect(() => {
    if (costType) {
      let costNameId = costType.cost_name_id || "";

      if (!costNameId && costType.cost_name) {
        const matchedCost = costNames.find(
          (cost) => cost.cost_name === costType.cost_name,
        );
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
      toast.error("Please enter a cost type");
      return;
    }

    if (!formData.cost_name_id) {
      toast.error("Please select a cost name");
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
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "cost_name_id") {
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
  };

  const handleCostTypeChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      cost_type: value,
    }));
  };

  const handleClose = useCallback(() => {
    setFormData({
      cost_type: "",
      cost_name_id: "",
      cost_name: "",
    });
    onHide();
  }, [onHide]);

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
            </div>
            <button
              type="button"
              className="btn-close"
              onClick={handleClose}
              disabled={loading}
              aria-label="Close"
            />
          </div>

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
                disabled={loading}
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
