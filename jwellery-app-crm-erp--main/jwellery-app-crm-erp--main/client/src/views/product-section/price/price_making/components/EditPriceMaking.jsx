import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

const EditPriceMaking = ({ show, onHide, onSubmit, priceMaking, dropdownData, loading = false }) => {
  const [formData, setFormData] = useState({
    making_stage_id: "",
    making_sub_stage_id: "",
    cost_type_id: "",
    unit_id: "",
    cost_amount: ""
  });
  const [filteredSubStages, setFilteredSubStages] = useState([]);

  // Reset form when priceMaking changes
  useEffect(() => {
    if (priceMaking) {
      setFormData({
        making_stage_id: priceMaking.making_stage_id || "",
        making_sub_stage_id: priceMaking.making_sub_stage_id || "",
        cost_type_id: priceMaking.cost_type_id || "",
        unit_id: priceMaking.unit_id || "",
        cost_amount: priceMaking.cost_amount || ""
      });
    }
  }, [priceMaking]);

  // Update filtered sub stages when making stage changes
  useEffect(() => {
    if (formData.making_stage_id) {
      // Filter by stage ID
      const filtered = dropdownData.makingSubStages.filter(
        subStage => subStage.stage_id === formData.making_stage_id
      );
      setFilteredSubStages(filtered);
    } else {
      setFilteredSubStages([]);
    }
  }, [formData.making_stage_id, dropdownData.makingSubStages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.making_stage_id) {
      toast.error("Please select a making stage");
      return;
    }

    if (!formData.cost_type_id) {
      toast.error("Please select a cost type");
      return;
    }

    if (!formData.unit_id) {
      toast.error("Please select a unit");
      return;
    }

    if (!formData.cost_amount || parseFloat(formData.cost_amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    // Send IDs to API
    const priceMakingData = {
      making_stage_id: formData.making_stage_id,
      making_sub_stage_id: formData.making_sub_stage_id || null,
      cost_type_id: formData.cost_type_id,
      cost_amount: parseFloat(formData.cost_amount),
      unit_id: formData.unit_id,
      is_active: true,
    };

    console.log("Updating price making with IDs:", priceMakingData);
    
    try {
      await onSubmit(priceMakingData);
    } catch (err) {
      console.error("Form submission error:", err);
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
      making_stage_id: "",
      making_sub_stage_id: "",
      cost_type_id: "",
      unit_id: "",
      cost_amount: ""
    });
    onHide();
  };

  // Helper functions to get display names by ID
  const getStageNameById = (id) => {
    const stage = dropdownData.makingStages.find(stage => stage._id === id);
    return stage?.stage_name || '';
  };

  const getSubStageNameById = (id) => {
    const subStage = dropdownData.makingSubStages.find(subStage => subStage._id === id);
    return subStage?.sub_stage_name || '';
  };

  const getCostTypeById = (id) => {
    const costType = dropdownData.costTypes.find(cost => cost._id === id);
    return costType?.cost_type || '';
  };

  const getUnitNameById = (id) => {
    const unit = dropdownData.units.find(u => u._id === id);
    return unit?.unit_name || unit?.name || '';
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



          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="row">
                
                {/* Making Stage - Using ID */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-medium">
                    Making Stage <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select form-select-lg"
                    name="making_stage_id"
                    value={formData.making_stage_id}
                    onChange={handleChange}
                    disabled={loading}
                  >
                    <option value="">Select Making Stage</option>
                    {dropdownData.makingStages.map((stage) => (
                      <option key={stage._id} value={stage._id}>
                        {stage.stage_name}
                      </option>
                    ))}
                  </select>
                 
                </div>

                {/* Sub Making Stage - Using ID */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-medium">
                    Sub Making Stage
                  </label>
                  <select
                    className="form-select form-select-lg"
                    name="making_sub_stage_id"
                    value={formData.making_sub_stage_id}
                    onChange={handleChange}
                    disabled={!formData.making_stage_id || loading}
                  >
                    <option value="">Select Sub Stage (Optional)</option>
                    {filteredSubStages.map((subStage) => (
                      <option key={subStage._id} value={subStage._id}>
                        {subStage.sub_stage_name}
                      </option>
                    ))}
                  </select>
                 
                </div>

                {/* Cost Type - Using ID */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-medium">
                    Cost Type <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select form-select-lg"
                    name="cost_type_id"
                    value={formData.cost_type_id}
                    onChange={handleChange}
                    disabled={loading}
                  >
                    <option value="">Select Cost Type</option>
                    {dropdownData.costTypes.map((costType) => (
                      <option key={costType._id} value={costType._id}>
                       {costType.cost_type } ({costType.cost_name})
                      </option>
                    ))}
                  </select>
               
                </div>

                {/* Unit - Using ID */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-medium">
                    Unit <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select form-select-lg"
                    name="unit_id"
                    value={formData.unit_id}
                    onChange={handleChange}
                    disabled={loading}
                  >
                    <option value="">Select Unit</option>
                    {dropdownData.units.map((unit) => (
                      <option key={unit._id} value={unit._id}>
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
                      disabled={loading}
                    />
                    <span className="input-group-text">
                      per {getUnitNameById(formData.unit_id) || "unit"}
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