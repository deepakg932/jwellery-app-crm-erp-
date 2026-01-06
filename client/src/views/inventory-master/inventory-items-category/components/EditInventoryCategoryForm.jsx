// import React, { useState, useEffect } from "react";
// import { FiUpload } from "react-icons/fi";

// const EditInventoryCategoryModal = ({
//   show,
//   onHide,
//   onSubmit,
//   category,
//   getMaterialIdFromCategory, // Add this prop
//   loading = false,
//   metals = [],
//   materialTypes = [],
//   stoneTypes = [],
// }) => {
//   const [name, setName] = useState("");
//   const [selectedMaterial, setSelectedMaterial] = useState("");
//   const [error, setError] = useState("");

//   // Helper function to get ID
//   const getId = (item) => item._id || item.id;

//   useEffect(() => {
//     if (category && getMaterialIdFromCategory) {
//       setName(category.name || "");
//       // Get the material ID from the category
//       const materialId = getMaterialIdFromCategory(category);
//       setSelectedMaterial(materialId || "");
//       setError("");
//     }
//   }, [category, getMaterialIdFromCategory]);

//   const handleSubmit = (e) => {
//     e.preventDefault();

//     if (!name.trim()) {
//       setError("Please enter a category name");
//       return;
//     }

//     if (!selectedMaterial.trim()) {
//       setError("Please select a material type");
//       return;
//     }

//     onSubmit({
//       name: name.trim(),
//       material_type: selectedMaterial,
//     });
//   };

//   const handleClose = () => {
//     setError("");
//     onHide();
//   };

//   if (!show) return null;

//   return (
//     <div
//       className="modal fade show d-block"
//       style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
//       tabIndex="-1"
//     >
//       <div className="modal-dialog modal-dialog-centered">
//         <div className="modal-content rounded-3">
//           <div className="modal-header border-bottom pb-3">
//             <h5 className="modal-title fw-bold fs-5">Edit Inventory Category</h5>
//             <button
//               type="button"
//               className="btn-close"
//               onClick={handleClose}
//               disabled={loading}
//               aria-label="Close"
//             />
//           </div>

//           {error && (
//             <div className="alert alert-danger m-3 py-2" role="alert">
//               {error}
//             </div>
//           )}

//           <form onSubmit={handleSubmit}>
//             <div className="modal-body">
//               <div className="mb-2">
//                 <label className="form-label fw-medium">
//                   Category Name <span className="text-danger">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   className="form-control form-control-l"
//                   value={name}
//                   onChange={(e) => {
//                     setName(e.target.value);
//                     setError("");
//                   }}
//                   required
//                   disabled={loading}
//                 />
//               </div>

//               <div className="mb-2">
//                 <label className="form-label fw-medium">
//                   Material Type <span className="text-danger">*</span>
//                 </label>
//                 <select
//                   className="form-select form-select-l"
//                   value={selectedMaterial}
//                   onChange={(e) => {
//                     setSelectedMaterial(e.target.value);
//                     setError("");
//                   }}
//                   required
//                   disabled={
//                     loading ||
//                     (materialTypes.length === 0 &&
//                       metals.length === 0 &&
//                       stoneTypes.length === 0)
//                   }
//                 >
//                   <option value="">Select Material Type</option>

//                   {materialTypes.length > 0 && (
//                     <optgroup label="Material Types">
//                       {materialTypes.map((mt) => (
//                         <option
//                           key={`material-${getId(mt)}`}
//                           value={mt.id || mt._id}
//                         >
//                           {mt.material_type || mt.name}
//                           {mt.metal_name && ` (${mt.metal_name})`}
//                         </option>
//                       ))}
//                     </optgroup>
//                   )}

//                   {metals.length > 0 && (
//                     <optgroup label="Metals">
//                       {metals.map((metal) => (
//                         <option
//                           key={`metal-${getId(metal)}`}
//                           value={metal.id || metal._id}
//                         >
//                           {metal.name}
//                         </option>
//                       ))}
//                     </optgroup>
//                   )}

//                   {stoneTypes.length > 0 && (
//                     <optgroup label="Stone Types">
//                       {stoneTypes.map((stone) => (
//                         <option
//                           key={`stone-${getId(stone)}`}
//                           value={stone.id || stone._id}
//                         >
//                           {stone.name || stone.stone_type}
//                         </option>
//                       ))}
//                     </optgroup>
//                   )}
//                 </select>
//               </div>
//             </div>

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
//                 className="btn btn-primary d-flex align-items-center gap-2"
//                 disabled={loading}
//               >
//                 {loading ? (
//                   <>
//                     <span
//                       className="spinner-border spinner-border-sm me-2"
//                       role="status"
//                       aria-hidden="true"
//                     ></span>
//                     Updating...
//                   </>
//                 ) : (
//                   <>
//                     <FiUpload size={16} />
//                     Update Inventory Category
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

// export default EditInventoryCategoryModal;

import React, { useState, useEffect } from "react";
import { FiUpload } from "react-icons/fi";

const EditInventoryCategoryModal = ({
  show,
  onHide,
  onSubmit,
  category,
  loading = false,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (category) {
      setName(category.name || "");
      setDescription(category.description || "");
    }
  }, [category]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter category name");
      return;
    }

    onSubmit({
      name: name.trim(),
      description: description.trim(),
    });
  };

  if (!show || !category) return null;

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
            <h5 className="modal-title fw-bold fs-5">Edit Inventory Category</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onHide}
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
                  placeholder="Enter category description"
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
                onClick={onHide}
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
                    Updating...
                  </>
                ) : (
                  <>
                    <FiUpload size={16} />
                    Update Category
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

export default EditInventoryCategoryModal;