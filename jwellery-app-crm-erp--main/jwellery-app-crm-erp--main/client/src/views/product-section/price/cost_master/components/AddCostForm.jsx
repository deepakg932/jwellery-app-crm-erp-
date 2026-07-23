import React, { useState, useRef } from "react";
import { toast } from "react-toastify";

const AddCostForm = ({ onClose, onSave, loading = false }) => {
  const [formData, setFormData] = useState({
    cost_name: "",
  });

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
      await onSave(costData);
      setFormData({
        cost_name: "",
      });
    } catch (error) {
      console.error("Save failed:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleClose = () => {
    setFormData({
      cost_name: "",
    });
    onClose();
  };

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content rounded-3">
          
          {/* Header */}
          <div className="modal-header border-bottom pb-3">
            <h5 className="modal-title fw-bold fs-5">Add New Cost</h5>
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
              
              {/* Cost Name */}
              <div className="mb-3">
                <label className="form-label fw-medium">
                  Cost Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control form-control-lg"
                  placeholder="Enter cost name"
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
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Saving...
                  </>
                ) : (
                  "Save Cost"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddCostForm;