// import React, { useState, useRef, useEffect, useCallback } from "react";
// import { FiUpload, FiX, FiImage } from "react-icons/fi";

// const AddInventoryCategoryModal = ({
//   onClose,
//   onSave,
//   loading = false,
// }) => {
//  const [name, setName] = useState("");
//   const [error, setError] = useState("");
//     // Helper function to get ID
//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (!name.trim()) {
//       setError("Please fill all required fields");
//       return;
//     }

//      onSave({
//       name: name,
//     });

//     // Reset form
//     setName("");
//     setError("");
//   };

//   return (
//     <div
//       className="modal fade show d-block"
//       style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
//       tabIndex="-1"
//     >
//       <div className="modal-dialog modal-dialog-centered">
//         <div className="modal-content rounded-3">
//           {/* Header */}
//           <div className="modal-header border-bottom pb-3">
//             <h5 className="modal-title fw-bold fs-5">Add Inventory Category</h5>
//             <button
//               type="button"
//               className="btn-close"
//               onClick={() => {
//                 if (!loading) onClose();
//               }}
//               disabled={loading}
//               aria-label="Close"
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
//               {/* Category Name */}
//               <div className="mb-2">
//                 <label className="form-label fw-medium">
//                   Category Name <span className="text-danger">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   className="form-control form-control-l"
//                   placeholder="Metal / Stone / Consumable / Service"
//                   value={name}
//                   onChange={(e) => {
//                     setName(e.target.value);
//                     setError("");
//                   }}
//                   required
//                   disabled={loading}
//                 />
//               </div>

//             </div>

//             {/* Action Buttons */}
//             <div className="modal-footer border-top pt-3">
//               <button
//                 type="button"
//                 className="btn btn-outline-secondary"
//                 onClick={() => {
//                   if (!loading) onClose();
//                 }}
//                 disabled={loading}
//               >
//                 Cancel
//               </button>
//               <button
//                 type="submit"
//                 className="btn btn-primary d-flex align-items-center gap-2"
//                 disabled={!name.trim()|| loading}
//               >
//                 {loading ? (
//                   <>
//                     <span
//                       className="spinner-border spinner-border-sm"
//                       role="status"
//                       aria-hidden="true"
//                     ></span>
//                     Saving...
//                   </>
//                 ) : (
//                   <>
//                     <FiUpload size={16} />
//                     Save Inventory Category
//                   </>
//                 )}
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AddInventoryCategoryModal;


import React, { useState } from "react";
import { FiUpload } from "react-icons/fi";

const AddInventoryCategoryModal = ({
  onClose,
  onSave,
  loading = false,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter category name");
      return;
    }

    onSave({
      name: name.trim(),
      description: description.trim(),
    });

    // Reset form
    setName("");
    setDescription("");
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
              <div className="mb-3">
                <label className="form-label fw-medium">
                  Category Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control form-control-lg"
                  placeholder="Enter category name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError("");
                  }}
                  required
                  disabled={loading}
                />
              </div>

              {/* Description */}
              <div className="mb-3">
                <label className="form-label fw-medium">
                  Description
                </label>
                <textarea
                  className="form-control form-control-lg"
                  placeholder="Enter category description (optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="3"
                  disabled={loading}
                />
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
                disabled={!name.trim() || loading}
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
