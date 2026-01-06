// import React, { useState, useRef } from "react";

// const AddUnitModal = ({ onClose, onSave, loading = false }) => {
//   const [unitName, setUnitName] = useState("");
//   const [error, setError] = useState("");

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (!unitName.trim()) {
//       setError("Please enter a unit name");
//       return;
//     }

//     try {
//       await onSave(unitName.trim());
//       setUnitName("");
//       setError("");
//     } catch (error) {
//       console.error("Save failed:", error);
//       setError("Failed to save. Please try again.");
//     }
//   };

//   const handleClose = () => {
//     setUnitName("");
//     setError("");
//     onClose();
//   };

//   return (
//     <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
//       <div className="modal-dialog modal-dialog-centered">
//         <div className="modal-content rounded-3">
          
//           {/* Header */}
//           <div className="modal-header border-bottom pb-3">
//             <h5 className="modal-title fw-bold fs-5">Add Unit</h5>
//             <button
//               type="button"
//               className="btn-close"
//               onClick={handleClose}
//               disabled={loading}
//             ></button>
//           </div>

//           {/* Error Alert */}
//           {error && (
//             <div className="alert alert-danger m-3 py-2" role="alert">
//               {error}
//             </div>
//           )}

//           {/* Form */}
//           <form onSubmit={handleSubmit}>
//             <div className="modal-body">
//               {/* Unit Name */}
//               <div className="mb-3">
//                 <label className="form-label fw-medium">
//                   Unit Name <span className="text-danger">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   className="form-control form-control-lg"
//                   placeholder="e.g., Gram, Kilogram, Carat, Ounce"
//                   value={unitName}
//                   onChange={(e) => {
//                     setUnitName(e.target.value);
//                     setError("");
//                   }}
//                   required
//                   disabled={loading}
//                 />
//                 <div className="form-text">
//                   Enter a descriptive name for the unit
//                 </div>
//               </div>
//             </div>

//             {/* Action Buttons */}
//             <div className="modal-footer border-top pt-3">
//               <button
//                 type="button"
//                 className="btn btn-outline-secondary"
//                 onClick={handleClose}
//                 disabled={loading}
//               >
//                 Cancel
//               </button>
//               <button
//                 type="submit"
//                 className="btn btn-primary"
//                 disabled={!unitName.trim() || loading}
//               >
//                 {loading ? (
//                   <>
//                     <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
//                     Saving...
//                   </>
//                 ) : (
//                   "Save Unit"
//                 )}
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AddUnitModal;



import React, { useState } from "react";

const AddUnitModal = ({ onClose, onSave, loading = false }) => {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    conversion_factor: 1,
    is_active: true
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError("Please enter a unit name");
      return;
    }
    
    if (!formData.code.trim()) {
      setError("Please enter a unit code");
      return;
    }

    try {
      await onSave({
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        conversion_factor: parseFloat(formData.conversion_factor) || 1,
        is_active: formData.is_active
      });
      setFormData({
        name: "",
        code: "",
        conversion_factor: 1,
        is_active: true
      });
      setError("");
    } catch (error) {
      console.error("Save failed:", error);
      setError(error.response?.data?.message || "Failed to save. Please try again.");
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      code: "",
      conversion_factor: 1,
      is_active: true
    });
    setError("");
    onClose();
  };

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content rounded-3">
          
          {/* Header */}
          <div className="modal-header border-bottom pb-3">
            <h5 className="modal-title fw-bold fs-5">Add Unit</h5>
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
              {/* Unit Name */}
              <div className="mb-3">
                <label className="form-label fw-medium">
                  Unit Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  className="form-control form-control-lg"
                  placeholder="e.g., Kilogram, Gram, Carat"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              {/* Unit Code */}
              <div className="mb-3">
                <label className="form-label fw-medium">
                  Unit Code <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="code"
                  className="form-control form-control-lg"
                  placeholder="e.g., KG, G, CT"
                  value={formData.code}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  maxLength={10}
                />
                <div className="form-text">
                  Short code for the unit (max 10 characters)
                </div>
              </div>

              {/* Conversion Factor */}
              <div className="mb-3">
                <label className="form-label fw-medium">
                  Conversion Factor <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  name="conversion_factor"
                  className="form-control form-control-lg"
                  placeholder="1"
                  value={formData.conversion_factor}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  min="0.0001"
                  step="0.0001"
                />
                <div className="form-text">
                  Base conversion factor relative to primary unit
                </div>
              </div>

              {/* Active Status */}
              <div className="mb-3">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    name="is_active"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  <label className="form-check-label fw-medium" htmlFor="is_active">
                    Active
                  </label>
                  <div className="form-text">
                    Inactive units won't be available for selection
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
                disabled={!formData.name.trim() || !formData.code.trim() || loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Saving...
                  </>
                ) : (
                  "Save Unit"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddUnitModal;