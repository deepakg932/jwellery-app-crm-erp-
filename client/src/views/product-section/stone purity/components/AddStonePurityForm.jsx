import React, { useState } from "react";
import { FiUpload } from "react-icons/fi";

const AddStonePurityForm = ({ onClose, onSave, loading = false, stoneOptions = [] }) => {
  const [stone_purity, setStonePurity] = useState("");
  const [stone_type, setStoneType] = useState("");
  const [percentage, setPercentage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!stone_purity.trim()) {
      setError("Please enter purity name");
      return;
    }
    if (!stone_type.trim()) {
      setError("Please select stone type");
      return;
    }
    if (!percentage.trim()) {
      setError("Please enter percentage");
      return;
    }

    const perc = parseFloat(percentage);
    if (isNaN(perc) || perc < 0 || perc > 100) {
      setError("Percentage must be between 0 and 100");
      return;
    }
    
    // Send only the 3 required fields
    const dataToSend = {
      stone_purity: stone_purity.trim(),
      stone_type: stone_type,
      percentage: perc,
    };
    
    console.log("Submitting data:", dataToSend);
    onSave(dataToSend);
    
    // Reset form on success (handled by parent)
  };

  const validatePercentage = (value) => {
    if (value === "") return true;
    const num = parseFloat(value);
    return !isNaN(num) && num >= 0 && num <= 100;
  };

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content rounded-3">
          
          <div className="modal-header border-bottom pb-3">
            <h5 className="modal-title fw-bold fs-5">Add Stone Purity</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              disabled={loading}
            ></button>
          </div>

          {error && (
            <div className="alert alert-danger m-3 py-2" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {/* Purity Name */}
              <div className="mb-3">
                <label className="form-label fw-medium">
                  Purity Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g., 24K, 925, AAA Grade"
                  value={stone_purity}
                  onChange={(e) => {
                    setStonePurity(e.target.value);
                    setError("");
                  }}
                  required
                  disabled={loading}
                />
              </div>

              {/* Stone Type Dropdown */}
              <div className="mb-3">
                <label className="form-label fw-medium">
                  Stone Type <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select"
                  value={stone_type}
                  onChange={(e) => {
                    setStoneType(e.target.value);
                    setError("");
                  }}
                  required
                  disabled={loading}
                >
                  <option value="">Select stone type</option>
                  {stoneOptions.map((stone) => (
                    <option key={stone.id} value={stone.name}>
                      {stone.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Percentage */}
              <div className="mb-3">
                <label className="form-label fw-medium">
                  Percentage (%) <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  className={`form-control ${percentage && !validatePercentage(percentage) ? 'is-invalid' : ''}`}
                  placeholder="e.g., 99.9"
                  value={percentage}
                  onChange={(e) => {
                    setPercentage(e.target.value);
                    setError("");
                  }}
                  min="0"
                  max="100"
                  step="0.1"
                  required
                  disabled={loading}
                />
                {percentage && !validatePercentage(percentage) && (
                  <div className="invalid-feedback">
                    Percentage must be between 0 and 100
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer border-top pt-3">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary d-flex align-items-center gap-2"
                disabled={loading || !stone_purity.trim() || !stone_type || !percentage.trim()}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <FiUpload size={16} />
                    Save Purity
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddStonePurityForm;