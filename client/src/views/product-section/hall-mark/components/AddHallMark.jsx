import React, { useState } from "react";
import { FiUpload } from "react-icons/fi";

const AddHallmarkModal = ({ onClose, onSave, loading = false, purities = [], marks = [], metalTypes = [] }) => {
  const [hallmarkName, setHallmarkName] = useState("");
  const [selectedPurity, setSelectedPurity] = useState("");
  const [selectedMark, setSelectedMark] = useState("");
  const [selectedPercentage, setSelectedPercentage] = useState("");
  const [selectedMetalType, setSelectedMetalType] = useState("");

  // Predefined percentage options
  const percentageOptions = [
    "99.9", "99.5", "99.0", 
    "95.0", "92.5", "90.0", 
    "85.0", "80.0", "75.0", 
    "70.0", "65.0", "60.0", 
    "58.5", "55.0", "50.0", 
    "45.0", "40.0", "37.5", 
    "33.3", "30.0", "25.0", 
    "20.0", "18.0", "16.0", 
    "14.0", "12.0", "10.0"
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!hallmarkName.trim() || !selectedPurity.trim() || !selectedMark.trim() || !selectedPercentage.trim() || !selectedMetalType.trim()) {
      alert("Please fill all required fields");
      return;
    }

    const selectedPurityObj = purities.find(p => p.id === parseInt(selectedPurity));
    const selectedMarkObj = marks.find(m => m.id === parseInt(selectedMark));
    const selectedMetalObj = metalTypes.find(mt => mt.id === parseInt(selectedMetalType));
    
    onSave({
      name: hallmarkName,
      purityId: selectedPurity,
      purityName: selectedPurityObj ? selectedPurityObj.name : '',
      markId: selectedMark,
      markName: selectedMarkObj ? selectedMarkObj.name : '',
      percentage: parseFloat(selectedPercentage),
      metalTypeId: selectedMetalType,
      metalTypeName: selectedMetalObj ? selectedMetalObj.name : ''
    });
    
    // Reset form
    setHallmarkName("");
    setSelectedPurity("");
    setSelectedMark("");
    setSelectedPercentage("");
    setSelectedMetalType("");
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content rounded-3">
          
          {/* Header */}
          <div className="modal-header border-bottom pb-3">
            <h5 className="modal-title fw-bold fs-5">Add Hallmark</h5>
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
              
              {/* Hallmark Name */}
              <div className="mb-2">
                <label className="form-label fw-medium">
                  Hallmark Name/Code <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control form-control-l"
                  placeholder="e.g., BIS 916, 925 Stamp, 750 Mark"
                  value={hallmarkName}
                  onChange={(e) => setHallmarkName(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              {/* Purity Dropdown */}
              <div className="mb-2">
                <label className="form-label fw-medium">
                  Purity <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select form-select-l"
                  value={selectedPurity}
                  onChange={(e) => setSelectedPurity(e.target.value)}
                  required
                  disabled={loading}
                >
                  <option value="">Select purity</option>
                  {purities.map((purity) => (
                    <option key={purity.id} value={purity.id}>
                      {purity.name} ({purity.percentage}%)
                    </option>
                  ))}
                </select>
              </div>

              {/* Mark Dropdown */}
              <div className="mb-2">
                <label className="form-label fw-medium">
                  Mark <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select form-select-l"
                  value={selectedMark}
                  onChange={(e) => setSelectedMark(e.target.value)}
                  required
                  disabled={loading}
                >
                  <option value="">Select mark</option>
                  {marks.map((mark) => (
                    <option key={mark.id} value={mark.id}>
                      {mark.name} ({mark.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Percentage Dropdown */}
              <div className="mb-2">
                <label className="form-label fw-medium">
                  Percentage (%) <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select form-select-l"
                  value={selectedPercentage}
                  onChange={(e) => setSelectedPercentage(e.target.value)}
                  required
                  disabled={loading}
                >
                  <option value="">Select percentage</option>
                  {percentageOptions.map((percent, index) => (
                    <option key={index} value={percent}>
                      {percent}%
                    </option>
                  ))}
                </select>
              </div>

              {/* Metal Type Dropdown */}
              <div className="mb-2">
                <label className="form-label fw-medium">
                  Metal Type <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select form-select-l"
                  value={selectedMetalType}
                  onChange={(e) => setSelectedMetalType(e.target.value)}
                  required
                  disabled={loading}
                >
                  <option value="">Select metal type</option>
                  {metalTypes.map((metalType) => (
                    <option key={metalType.id} value={metalType.id}>
                      {metalType.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div className="mb-2">
                <label className="form-label fw-medium">
                  Description (Optional)
                </label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Enter hallmark description or notes..."
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
                className="btn btn-primary d-flex align-items-center gap-2"
                disabled={!hallmarkName.trim() || !selectedPurity.trim() || !selectedMark.trim() || !selectedPercentage.trim() || !selectedMetalType.trim() || loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <FiUpload size={16} />
                    Save Hallmark
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

export default AddHallmarkModal;