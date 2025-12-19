import React, { useState, useEffect } from "react";

const AddPriceMaking = ({ onClose, onSave, dropdownData, priceMakings, loading = false }) => {
  const [formData, setFormData] = useState({
    stage_name: "",
    sub_stage_name: "",
    cost_type: "",
    unit_name: "",
    cost_amount: ""
  });
  const [error, setError] = useState("");
  const [duplicateError, setDuplicateError] = useState("");
  const [filteredSubStages, setFilteredSubStages] = useState([]);

  // Update filtered sub stages when making stage changes
  useEffect(() => {
    if (formData.stage_name) {
      const filtered = dropdownData.makingSubStages.filter(
        subStage => subStage.stage_name === formData.stage_name
      );
      setFilteredSubStages(filtered);
      
      if (formData.sub_stage_name) {
        const subStageExists = filtered.some(
          sub => sub.sub_stage_name === formData.sub_stage_name
        );
        if (!subStageExists) {
          setFormData(prev => ({ ...prev, sub_stage_name: "" }));
        }
      }
    } else {
      setFilteredSubStages([]);
      setFormData(prev => ({ ...prev, sub_stage_name: "" }));
    }
  }, [formData.stage_name, dropdownData.makingSubStages]);

  // Check for duplicates whenever form data changes
  useEffect(() => {
    checkForDuplicates();
  }, [formData, priceMakings]);

  const checkForDuplicates = () => {
    setDuplicateError("");
    
    if (!formData.stage_name || !formData.cost_type || !formData.unit_name || !formData.cost_amount) {
      return;
    }

    // Normalize the amount for comparison (handle floating point precision)
    const amountToCheck = parseFloat(formData.cost_amount);
    
    // Check for exact duplicate
    const isDuplicate = priceMakings.some(item => {
      const isStageMatch = item.stage_name === formData.stage_name;
      const isSubStageMatch = item.sub_stage_name === formData.sub_stage_name;
      const isCostTypeMatch = item.cost_type === formData.cost_type;
      const isUnitMatch = item.unit_name === formData.unit_name;
      const isAmountMatch = Math.abs((item.cost_amount || item.amount) - amountToCheck) < 0.01; // Allow small floating point differences
      
      return isStageMatch && isSubStageMatch && isCostTypeMatch && isUnitMatch && isAmountMatch;
    });

    if (isDuplicate) {
      setDuplicateError("A price making entry with this combination already exists!");
    }
  };

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

    // Check for duplicates
    checkForDuplicates();
    if (duplicateError) {
      return; // Don't submit if duplicate exists
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

    console.log("Saving price making:", priceMakingData);
    
    try {
      await onSave(priceMakingData);
      resetForm();
    } catch (error) {
      console.error("Save failed:", error);
      // Check if error is about duplicate
      if (error.message && error.message.toLowerCase().includes("already exists") || 
          error.message && error.message.toLowerCase().includes("duplicate")) {
        setDuplicateError(error.message);
      } else {
        setError("Failed to save. Please try again.");
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError("");
    setDuplicateError(""); // Clear duplicate error when user changes data
  };

  const resetForm = () => {
    setFormData({
      stage_name: "",
      sub_stage_name: "",
      cost_type: "",
      unit_name: "",
      cost_amount: ""
    });
    setError("");
    setDuplicateError("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Format existing entries for display
  const getExistingEntries = () => {
    if (!formData.stage_name && !formData.cost_type && !formData.unit_name) {
      return [];
    }

    return priceMakings.filter(item => {
      const matches = [];
      if (formData.stage_name) matches.push(item.stage_name === formData.stage_name);
      if (formData.sub_stage_name) matches.push(item.sub_stage_name === formData.sub_stage_name);
      if (formData.cost_type) matches.push(item.cost_type === formData.cost_type);
      if (formData.unit_name) matches.push(item.unit_name === formData.unit_name);
      
      // Return entries that match all specified criteria
      return matches.every(match => match === true);
    });
  };

  const existingEntries = getExistingEntries();

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content rounded-3">
          
          {/* Header */}
          <div className="modal-header border-bottom pb-3">
            <h5 className="modal-title fw-bold fs-5">Add Price Making</h5>
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

          {/* Duplicate Error Alert */}
          {duplicateError && (
            <div className="alert alert-warning m-3 py-2" role="alert">
              <div className="d-flex align-items-center">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                {duplicateError}
              </div>
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
                    <option value="">Select Sub Stage</option>
                    {filteredSubStages.map((subStage) => (
                      <option key={subStage._id} value={subStage.sub_stage_name}>
                        {subStage.sub_stage_name}
                      </option>
                    ))}
                  </select>
                  {!formData.stage_name && (
                    <div className="form-text text-warning">
                      Please select a making stage first
                    </div>
                  )}
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
                      placeholder="0.00"
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
                  <div className="form-text">
                    Enter the cost amount for this combination
                  </div>
                </div>

              </div>

              {/* Show existing similar entries */}
              {/* {existingEntries.length > 0 && (
                <div className="mt-4">
                  <h6 className="fw-medium mb-2">
                    <i className="bi bi-info-circle me-2"></i>
                    Existing Entries with Similar Criteria:
                  </h6>
                  <div className="table-responsive">
                    <table className="table table-sm table-bordered">
                      <thead>
                        <tr>
                          <th>Stage</th>
                          <th>Sub Stage</th>
                          <th>Cost Type</th>
                          <th>Unit</th>
                          <th>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {existingEntries.map((item, index) => (
                          <tr key={item._id} className={index === 0 ? "table-warning" : ""}>
                            <td>{item.stage_name}</td>
                            <td>{item.sub_stage_name || "N/A"}</td>
                            <td>{item.cost_type}</td>
                            <td>{item.unit_name}</td>
                            <td className="fw-bold">
                              ₹{parseFloat(item.cost_amount || item.amount).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="alert alert-info py-2 mt-2">
                    <small>
                      <i className="bi bi-lightbulb me-1"></i>
                      To avoid duplicates, change any of the above fields or use a different amount.
                    </small>
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
                disabled={!formData.stage_name || !formData.cost_type || !formData.unit_name || !formData.cost_amount || loading || duplicateError}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Saving...
                  </>
                ) : (
                  "Save Price Making"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddPriceMaking;