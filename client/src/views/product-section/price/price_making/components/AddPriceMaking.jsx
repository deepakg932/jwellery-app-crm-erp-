import React, { useState, useEffect } from "react";

const AddPriceMaking = ({
  onClose,
  onSave,
  dropdownData,
  priceMakings,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    making_stage_id: "",
    making_sub_stage_id: "",
    cost_type_id: "",
    unit_id: "",
    cost_amount: "",
  });
  const [error, setError] = useState("");
  const [duplicateError, setDuplicateError] = useState("");
  const [filteredSubStages, setFilteredSubStages] = useState([]);

  console.log(dropdownData.costTypes);

  // Update filtered sub stages when making stage changes
  useEffect(() => {
    if (formData.making_stage_id) {
      const filtered = dropdownData.makingSubStages.filter(
        (subStage) => subStage.stage_id === formData.making_stage_id,
      );
      setFilteredSubStages(filtered);

      if (formData.making_sub_stage_id) {
        const subStageExists = filtered.some(
          (sub) => sub._id === formData.making_sub_stage_id,
        );
        if (!subStageExists) {
          setFormData((prev) => ({ ...prev, making_sub_stage_id: "" }));
        }
      }
    } else {
      setFilteredSubStages([]);
      setFormData((prev) => ({ ...prev, making_sub_stage_id: "" }));
    }
  }, [formData.making_stage_id, dropdownData.makingSubStages]);

  // Check for duplicates whenever form data changes
  useEffect(() => {
    checkForDuplicates();
  }, [formData, priceMakings]);

  const checkForDuplicates = () => {
    setDuplicateError("");

    if (
      !formData.making_stage_id ||
      !formData.cost_type_id ||
      !formData.unit_id ||
      !formData.cost_amount
    ) {
      return;
    }

    // Normalize the amount for comparison
    const amountToCheck = parseFloat(formData.cost_amount);

    // Check for exact duplicate using IDs
    const isDuplicate = priceMakings.some((item) => {
      const isStageMatch = item.making_stage_id === formData.making_stage_id;
      const isSubStageMatch =
        item.making_sub_stage_id === formData.making_sub_stage_id;
      const isCostTypeMatch = item.cost_type_id === formData.cost_type_id;
      const isUnitMatch = item.unit_id === formData.unit_id;
      const isAmountMatch = Math.abs(item.cost_amount - amountToCheck) < 0.01;

      return (
        isStageMatch &&
        isSubStageMatch &&
        isCostTypeMatch &&
        isUnitMatch &&
        isAmountMatch
      );
    });

    if (isDuplicate) {
      setDuplicateError(
        "A price making entry with this combination already exists!",
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.making_stage_id) {
      setError("Please select a making stage");
      return;
    }

    if (!formData.cost_type_id) {
      setError("Please select a cost type");
      return;
    }

    if (!formData.unit_id) {
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

    console.log("Saving price making with IDs:", priceMakingData);

    try {
      await onSave(priceMakingData);
      resetForm();
    } catch (error) {
      console.error("Save failed:", error);
      if (
        (error.message &&
          error.message.toLowerCase().includes("already exists")) ||
        (error.message && error.message.toLowerCase().includes("duplicate"))
      ) {
        setDuplicateError(error.message);
      } else {
        setError("Failed to save. Please try again.");
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
    setDuplicateError("");
  };

  const resetForm = () => {
    setFormData({
      making_stage_id: "",
      making_sub_stage_id: "",
      cost_type_id: "",
      unit_id: "",
      cost_amount: "",
    });
    setError("");
    setDuplicateError("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Helper functions to get display names by ID
  const getStageNameById = (id) => {
    const stage = dropdownData.makingStages.find((stage) => stage._id === id);
    return stage?.stage_name || "";
  };

  const getSubStageNameById = (id) => {
    const subStage = dropdownData.makingSubStages.find(
      (subStage) => subStage._id === id,
    );
    return subStage?.sub_stage_name || "";
  };

  const getCostTypeById = (id) => {
    const costType = dropdownData.costTypes.find((cost) => cost._id === id);
    return costType?.cost_type || "";
  };

  const getUnitNameById = (id) => {
    const unit = dropdownData.units.find((u) => u._id === id);
    return unit?.unit_name || unit?.name || "";
  };

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      tabIndex="-1"
    >
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
              <div className="d-flex align-items-center">{duplicateError}</div>
            </div>
          )}

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
                    required
                    disabled={loading}
                  >
                    <option value="">Select Making Stage</option>
                    {dropdownData.makingStages.map((stage) => (
                      <option key={stage._id} value={stage._id}>
                        {stage.stage_name}
                      </option>
                    ))}
                  </select>
                  {formData.making_stage_id && (
                    <div className="form-text">
                      Selected: {getStageNameById(formData.making_stage_id)}
                    </div>
                  )}
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
                  {formData.making_sub_stage_id && (
                    <div className="form-text">
                      Selected:{" "}
                      {getSubStageNameById(formData.making_sub_stage_id)}
                    </div>
                  )}
                  {!formData.making_stage_id && (
                    <div className="form-text text-warning">
                      Please select a making stage first
                    </div>
                  )}
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
                    required
                    disabled={loading}
                  >
                    <option value="">Select Cost Type</option>
                    {dropdownData.costTypes.map((costType) => (
                      <option key={costType._id} value={costType._id}>
                        {costType.cost_type } ({costType.cost_name})
                        
                      </option>
                    ))}
                  </select>
                  {formData.cost_type_id && (
                    <div className="form-text">
                      Selected: {getCostTypeById(formData.cost_type_id)}
                    </div>
                  )}
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
                    required
                    disabled={loading}
                  >
                    <option value="">Select Unit</option>
                    {dropdownData.units.map((unit) => (
                      <option key={unit._id} value={unit._id}>
                        {unit.unit_name || unit.name}
                      </option>
                    ))}
                  </select>
                  {formData.unit_id && (
                    <div className="form-text">
                      Selected: {getUnitNameById(formData.unit_id)}
                    </div>
                  )}
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
                disabled={
                  !formData.making_stage_id ||
                  !formData.cost_type_id ||
                  !formData.unit_id ||
                  !formData.cost_amount ||
                  loading ||
                  duplicateError
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
