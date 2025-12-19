import React, { useState, useEffect } from "react";

const EditPriceMaking = ({ show, onHide, onSubmit, priceMaking, dropdownData, loading = false }) => {
  const [formData, setFormData] = useState({
    stage_name: "",
    sub_stage_name: "",
    cost_type: "",
    unit_name: "",
    cost_amount: ""
  });
  const [error, setError] = useState("");
  const [filteredSubStages, setFilteredSubStages] = useState([]);

  // Reset form when priceMaking changes
  useEffect(() => {
    if (priceMaking) {
      setFormData({
        stage_name: priceMaking.stage_name || "",
        sub_stage_name: priceMaking.sub_stage_name || "",
        cost_type: priceMaking.cost_type || "",
        unit_name: priceMaking.unit_name || "",
        cost_amount: priceMaking.cost_amount || priceMaking.amount || ""
      });
      setError("");
    }
  }, [priceMaking]);

  // Update filtered sub stages when making stage changes
  useEffect(() => {
    if (formData.stage_name) {
      // Filter by stage name (TEXT)
      const filtered = dropdownData.makingSubStages.filter(
        subStage => subStage.stage_name === formData.stage_name
      );
      setFilteredSubStages(filtered);
    } else {
      setFilteredSubStages([]);
    }
  }, [formData.stage_name, dropdownData.makingSubStages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.stage_name) {
      setError("Please select a making stage");
      return;
    }

    if (!formData.cost_type) {
      setError("Please select a cost type");
      return;
    }

    if (!formData.unit_name) {
      setError("Please select a unit");
      return;
    }

    if (!formData.cost_amount || parseFloat(formData.cost_amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    // Match API field names
    const priceMakingData = {
      stage_name: formData.stage_name,
      sub_stage_name: formData.sub_stage_name,
      cost_type: formData.cost_type,
      cost_amount: parseFloat(formData.cost_amount),
      unit_name: formData.unit_name,
      is_active: true,
    };

    console.log("Updating price making:", priceMakingData);
    
    try {
      await onSubmit(priceMakingData);
    } catch (err) {
      console.error("Form submission error:", err);
      setError("Failed to update. Please try again.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError("");
  };

  const handleClose = () => {
    setFormData({
      stage_name: "",
      sub_stage_name: "",
      cost_type: "",
      unit_name: "",
      cost_amount: ""
    });
    setError("");
    onHide();
  };

  // Don't render if not shown
  if (!show) return null;

  return (
    <div 
      className="modal fade show d-block" 
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} 
      tabIndex="-1"
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content rounded-3">
          
          {/* Header */}
          <div className="modal-header border-bottom pb-3">
            <h5 className="modal-title fw-bold fs-5">Edit Price Making</h5>
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
              <div className="row">
                
                {/* Making Stage */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-medium">
                    Making Stage <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select form-select-lg"
                    name="stage_name"
                    value={formData.stage_name}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  >
                    <option value="">Select Making Stage</option>
                    {dropdownData.makingStages.map((stage) => (
                      <option key={stage._id} value={stage.stage_name}>
                        {stage.stage_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sub Making Stage */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-medium">
                    Sub Making Stage
                  </label>
                  <select
                    className="form-select form-select-lg"
                    name="sub_stage_name"
                    value={formData.sub_stage_name}
                    onChange={handleChange}
                    disabled={!formData.stage_name || loading}
                  >
                    <option value="">Select Sub Stage (Optional)</option>
                    {filteredSubStages.map((subStage) => (
                      <option key={subStage._id} value={subStage.sub_stage_name}>
                        {subStage.sub_stage_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Cost Type */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-medium">
                    Cost Type <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select form-select-lg"
                    name="cost_type"
                    value={formData.cost_type}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  >
                    <option value="">Select Cost Type</option>
                    {dropdownData.costTypes.map((costType) => (
                      <option key={costType._id} value={costType.cost_type}>
                        {costType.cost_type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Unit */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-medium">
                    Unit <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select form-select-lg"
                    name="unit_name"
                    value={formData.unit_name}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  >
                    <option value="">Select Unit</option>
                    {dropdownData.units.map((unit) => (
                      <option key={unit._id} value={unit.unit_name || unit.name}>
                        {unit.unit_name || unit.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Amount */}
                <div className="col-12 mb-3">
                  <label className="form-label fw-medium">
                    Cost Amount <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">₹</span>
                    <input
                      type="number"
                      className="form-control form-control-lg"
                      name="cost_amount"
                      value={formData.cost_amount}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      required
                      disabled={loading}
                    />
                    <span className="input-group-text">
                      per {formData.unit_name || "unit"}
                    </span>
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
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Updating...
                  </>
                ) : (
                  "Update Price Making"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditPriceMaking;