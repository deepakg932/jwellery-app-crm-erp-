import React, { useState, useEffect } from "react";
import { FiPercent } from "react-icons/fi";

const EditGSTForm = ({ show, onHide, onSubmit, gstData, loading = false }) => {
  const [formData, setFormData] = useState({
    sgst_percentage: "",
    cgst_percentage: "",
    igst_percentage: "",
    utgst_percentage: "",
  });
  const [error, setError] = useState("");

  // Reset form when gstData changes
  useEffect(() => {
    if (gstData) {
      setFormData({
        sgst_percentage: gstData.sgst_percentage?.toString() || "",
        cgst_percentage: gstData.cgst_percentage?.toString() || "",
        igst_percentage: gstData.igst_percentage?.toString() || "",
        utgst_percentage: gstData.utgst_percentage?.toString() || "",
      });
      setError("");
    }
  }, [gstData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const errors = [];

    // Validate percentages (frontend validation only)
    const percentageFields = ['sgst_percentage', 'cgst_percentage', 'igst_percentage', 'utgst_percentage'];
    percentageFields.forEach(field => {
      const value = parseFloat(formData[field]);
      if (value < 0 || value > 100) {
        errors.push(`${field.replace('_percentage', '').toUpperCase()} must be between 0 and 100`);
      }
    });

    if (errors.length > 0) {
      setError(errors.join(', '));
      return;
    }

    // Backend will calculate total
    const updatedData = {
      sgst_percentage: parseFloat(formData.sgst_percentage) || 0,
      cgst_percentage: parseFloat(formData.cgst_percentage) || 0,
      igst_percentage: parseFloat(formData.igst_percentage) || 0,
      utgst_percentage: parseFloat(formData.utgst_percentage) || 0,
      // Note: total_percentage will be calculated in backend
    };

    try {
      await onSubmit(updatedData);
    } catch (err) {
      console.error("Form submission error:", err);
      setError("Failed to update. Please try again.");
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

  // Calculate total percentage (display only)
  const calculateTotal = () => {
    const total = ['sgst_percentage', 'cgst_percentage', 'igst_percentage', 'utgst_percentage']
      .reduce((sum, field) => sum + (parseFloat(formData[field]) || 0), 0);
    return total.toFixed(2);
  };

  const handleClose = () => {
    setFormData({
      sgst_percentage: "",
      cgst_percentage: "",
      igst_percentage: "",
      utgst_percentage: "",
    });
    setError("");
    onHide();
  };

  // Check if form is valid
  const isFormValid = () => {
    const fields = ['sgst_percentage', 'cgst_percentage', 'igst_percentage', 'utgst_percentage'];
    const hasAtLeastOneValue = fields.some(field => formData[field] !== "");
    
    if (!hasAtLeastOneValue) return false;
    
    // Check all entered values are valid
    return fields.every(field => {
      if (formData[field] === "") return true; // Empty is okay
      const value = parseFloat(formData[field]);
      return !isNaN(value) && value >= 0 && value <= 100;
    });
  };

  // Don't render if not shown
  if (!show) return null;

  return (
    <div 
      className="modal fade show d-block" 
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} 
      tabIndex="-1"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content rounded-3">
          
          {/* Header */}
          <div className="modal-header border-bottom pb-3">
            <h5 className="modal-title fw-bold fs-5">Edit GST Rate</h5>
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
              
              {/* GST Percentages Grid */}
              <div className="row g-3">
                
                {/* SGST */}
                <div className="col-md-6">
                  <label className="form-label fw-medium">SGST %</label>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      name="sgst_percentage"
                      value={formData.sgst_percentage}
                      onChange={handlePercentageChange}
                      disabled={loading}
                    />
                    <span className="input-group-text">%</span>
                  </div>
                </div>

                {/* CGST */}
                <div className="col-md-6">
                  <label className="form-label fw-medium">CGST %</label>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      name="cgst_percentage"
                      value={formData.cgst_percentage}
                      onChange={handlePercentageChange}
                      disabled={loading}
                    />
                    <span className="input-group-text">%</span>
                  </div>
                </div>

                {/* IGST */}
                <div className="col-md-6">
                  <label className="form-label fw-medium">IGST %</label>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      name="igst_percentage"
                      value={formData.igst_percentage}
                      onChange={handlePercentageChange}
                      disabled={loading}
                    />
                    <span className="input-group-text">%</span>
                  </div>
                </div>

                {/* UTGST */}
                <div className="col-md-6">
                  <label className="form-label fw-medium">UTGST %</label>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      name="utgst_percentage"
                      value={formData.utgst_percentage}
                      onChange={handlePercentageChange}
                      disabled={loading}
                    />
                    <span className="input-group-text">%</span>
                  </div>
                </div>

                {/* Preview Total (Calculated in frontend for display only) */}
                <div className="col-12 mt-2">
                  <div className="card border bg-light">
                    <div className="card-body py-2">
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                          <FiPercent className="text-primary me-2" />
                          <span className="fw-medium">Preview Total GST:</span>
                        </div>
                        <div>
                          <span className="badge bg-primary p-2 fs-6">
                            {calculateTotal()}%
                          </span>
                        </div>
                      </div>
                      <small className="text-muted">
                        Note: Final total will be calculated by backend
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
                disabled={!isFormValid() || loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Updating...
                  </>
                ) : (
                  "Update GST Rate"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditGSTForm;