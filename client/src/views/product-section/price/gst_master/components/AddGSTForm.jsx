import React, { useState } from "react";
import { FiPercent } from "react-icons/fi";

const AddGSTForm = ({ onClose, onSave, loading = false }) => {
  const [formData, setFormData] = useState({
    sgst_percentage: "",
    cgst_percentage: "",
    igst_percentage: "",
    utgst_percentage: "",
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const errors = [];

    // Validate percentages
    const percentageFields = ['sgst_percentage', 'cgst_percentage', 'igst_percentage', 'utgst_percentage'];
    percentageFields.forEach(field => {
      const value = parseFloat(formData[field]);
      if (value < 0 || value > 100) {
        errors.push(`${field.replace('_percentage', '').toUpperCase()} must be between 0 and 100`);
      }
    });

    // Check if at least one percentage is entered
    const hasAtLeastOnePercentage = percentageFields.some(field => 
      formData[field] !== "" && parseFloat(formData[field]) > 0
    );

    if (!hasAtLeastOnePercentage) {
      errors.push("Please enter at least one GST percentage");
    }

    if (errors.length > 0) {
      setError(errors.join(', '));
      return;
    }

    const gstData = {
      sgst_percentage: parseFloat(formData.sgst_percentage) || 0,
      cgst_percentage: parseFloat(formData.cgst_percentage) || 0,
      igst_percentage: parseFloat(formData.igst_percentage) || 0,
      utgst_percentage: parseFloat(formData.utgst_percentage) || 0,
    };

    try {
      await onSave(gstData);
      resetForm();
    } catch (error) {
      console.error("Save failed:", error);
      setError("Failed to save. Please try again.");
    }
  };

  const handlePercentageChange = (e) => {
    const { name, value } = e.target;
    // Allow only numbers and one decimal point
    const validatedValue = value === '' ? '' : value.replace(/[^0-9.]/g, '');
    
    // Check for multiple decimal points
    const decimalCount = (validatedValue.match(/\./g) || []).length;
    if (decimalCount > 1) return;
    
    if (validatedValue === '' || (!isNaN(validatedValue) && parseFloat(validatedValue) <= 100)) {
      setFormData(prev => ({
        ...prev,
        [name]: validatedValue
      }));
      setError("");
    }
  };

  // Calculate total percentage
  const calculateTotal = () => {
    const total = ['sgst_percentage', 'cgst_percentage', 'igst_percentage', 'utgst_percentage']
      .reduce((sum, field) => sum + (parseFloat(formData[field]) || 0), 0);
    return total.toFixed(2);
  };

  const resetForm = () => {
    setFormData({
      sgst_percentage: "",
      cgst_percentage: "",
      igst_percentage: "",
      utgst_percentage: "",
    });
    setError("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const hasAtLeastOnePercentage = () => {
    const fields = ['sgst_percentage', 'cgst_percentage', 'igst_percentage', 'utgst_percentage'];
    return fields.some(field => formData[field] !== "" && parseFloat(formData[field]) > 0);
  };

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content rounded-3">
          
          {/* Header */}
          <div className="modal-header border-bottom pb-3">
            <h5 className="modal-title fw-bold fs-5">Add GST Rate</h5>
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
              
              {/* GST Percentages Grid */}
              <div className="row g-3">
                
                {/* SGST */}
                <div className="col-md-6">
                  <label className="form-label fw-medium">SGST %</label>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      placeholder="0.00"
                      name="sgst_percentage"
                      value={formData.sgst_percentage}
                      onChange={handlePercentageChange}
                      disabled={loading}
                    />
                    <span className="input-group-text">%</span>
                  </div>
                  <div className="form-text">State Goods & Services Tax</div>
                </div>

                {/* CGST */}
                <div className="col-md-6">
                  <label className="form-label fw-medium">CGST %</label>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      placeholder="0.00"
                      name="cgst_percentage"
                      value={formData.cgst_percentage}
                      onChange={handlePercentageChange}
                      disabled={loading}
                    />
                    <span className="input-group-text">%</span>
                  </div>
                  <div className="form-text">Central Goods & Services Tax</div>
                </div>

                {/* IGST */}
                <div className="col-md-6">
                  <label className="form-label fw-medium">IGST %</label>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      placeholder="0.00"
                      name="igst_percentage"
                      value={formData.igst_percentage}
                      onChange={handlePercentageChange}
                      disabled={loading}
                    />
                    <span className="input-group-text">%</span>
                  </div>
                  <div className="form-text">Integrated Goods & Services Tax</div>
                </div>

                {/* UTGST */}
                <div className="col-md-6">
                  <label className="form-label fw-medium">UTGST %</label>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      placeholder="0.00"
                      name="utgst_percentage"
                      value={formData.utgst_percentage}
                      onChange={handlePercentageChange}
                      disabled={loading}
                    />
                    <span className="input-group-text">%</span>
                  </div>
                  <div className="form-text">Union Territory GST</div>
                </div>

                {/* Total Display */}
                <div className="col-12 mt-2">
                  <div className="card border bg-light">
                    <div className="card-body py-2">
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                          <FiPercent className="text-primary me-2" />
                          <span className="fw-medium">Total GST:</span>
                        </div>
                        <div>
                          <span className="badge bg-primary p-2 fs-6">
                            {calculateTotal()}%
                          </span>
                        </div>
                      </div>
                      <small className="text-muted">
                        Total = SGST + CGST + IGST + UTGST
                      </small>
                    </div>
                  </div>
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
                disabled={!hasAtLeastOnePercentage() || loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Saving...
                  </>
                ) : (
                  "Save GST Rate"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddGSTForm;