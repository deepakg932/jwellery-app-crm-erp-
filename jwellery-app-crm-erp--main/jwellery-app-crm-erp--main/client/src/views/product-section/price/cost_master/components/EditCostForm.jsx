import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

const EditCostForm = ({ show, onHide, onSubmit, cost, loading = false }) => {
  const [formData, setFormData] = useState({
    cost_name: "",
  });

  // Reset form when cost changes
  useEffect(() => {
    if (cost) {
      setFormData({
        cost_name: cost.cost_name || "",
      });
    }
  }, [cost]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.cost_name.trim()) {
      toast.error("Please enter a cost name");
      return;
    }

    const costData = {
      ...formData,
    };

    try {
      await onSubmit(costData);
      // Parent handles closing
    } catch (err) {
      console.error("Form submission error:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClose = () => {
    setFormData({
      cost_name: "",
    });
    onHide();
  };

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
            <h5 className="modal-title fw-bold fs-5">Edit Cost</h5>
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
              {/* Cost Name */}
              <div className="mb-3">
                <label className="form-label fw-medium">
                  Cost Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control form-control-lg"
                  name="cost_name"
                  value={formData.cost_name}
                  onChange={handleChange}
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
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Updating...
                  </>
                ) : (
                  "Update Cost"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditCostForm;
