import React, { useState, useRef, useEffect, useCallback } from "react";
import { FiUpload, FiX, FiImage } from "react-icons/fi";

const AddInventoryCategoryModal = ({
  onClose,
  onSave,
  loading = false,
  metalTypes = [], // Changed from materialOptions
  materialTypes = [],
  stoneTypes = [],
}) => {
 const [name, setName] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState("");
  const [error, setError] = useState("");
    // Helper function to get ID
  const getId = (item) => item._id || item.id;
console.log(metalTypes)
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !selectedMaterial.trim()) {
      setError("Please fill all required fields");
      return;
    }

     onSave({
      name: name,
      material_type: selectedMaterial, // Changed from metal_type to material_type
    });

    // Reset form
    setName("");
    setSelectedMaterial("");
    setError("");
  };

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
            <h5 className="modal-title fw-bold fs-5">Add Inventory Category</h5>
            <button
              type="button"
              className="btn-close"
              onClick={() => {
                if (!loading) onClose();
              }}
              disabled={loading}
              aria-label="Close"
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
              {/* Category Name */}
              <div className="mb-2">
                <label className="form-label fw-medium">
                  Category Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control form-control-l"
                  placeholder="e.g., Stock, Defective, Return"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError("");
                  }}
                  required
                  disabled={loading}
                />
              </div>

              {/* Material Type Dropdown - UPDATED */}
              <div className="mb-2">
                <label className="form-label fw-medium">
                  Material Type <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select form-select-l"
                  value={selectedMaterial}
                  onChange={(e) => {
                    setSelectedMaterial(e.target.value);
                    setError("");
                  }}
                  required
                  disabled={
                    loading ||
                    (materialTypes.length === 0 &&
                      metalTypes.length === 0 &&
                      stoneTypes.length === 0)
                  }
                >
                  <option value="">Select Material Type</option>

                  {/* Material Types */}
                  {materialTypes.length > 0 && (
                    <optgroup label="Material Types">
                      {materialTypes.map((mt) => (
                        <option
                          key={`material-${getId(mt)}`}
                          value={mt.id || mt._id}
                        >
                          {mt.material_type || mt.name}
                          {mt.metal_name && ` (${mt.metal_name})`}
                        </option>
                      ))}
                    </optgroup>
                  )}

                  {/* Metals */}
                  {metalTypes.length > 0 && (
                    <optgroup label="Metals">
                      {metalTypes.map((metal) => (
                        <option
                          key={`metal-${getId(metal)}`}
                          value={metal.id || metal._id}
                        >
                          {metal.name || metal.metal_name}
                        </option>
                      ))}
                    </optgroup>
                  )}

                  {/* Stone Types */}
                  {stoneTypes.length > 0 && (
                    <optgroup label="Stone Types">
                      {stoneTypes.map((stone) => (
                        <option
                          key={`stone-${getId(stone)}`}
                          value={stone.id || stone._id}
                        >
                          {stone.name || stone.stone_type}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>

                {materialTypes.length === 0 &&
                  metalTypes.length === 0 &&
                  stoneTypes.length === 0 &&
                  !loading && (
                    <div className="form-text text-warning">
                      No material types available. Please add material types,
                      metals, or stone types first.
                    </div>
                  )}
              </div>

            </div>

            {/* Action Buttons */}
            <div className="modal-footer border-top pt-3">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => {
                  if (!loading) onClose();
                }}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary d-flex align-items-center gap-2"
                disabled={!name.trim() || !selectedMaterial.trim() || loading}
              >
                {loading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <FiUpload size={16} />
                    Save Inventory Category
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

export default AddInventoryCategoryModal;
