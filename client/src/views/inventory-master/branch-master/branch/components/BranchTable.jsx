// import React, { useState, useEffect } from "react";
// import { 
//   FiEdit2, 
//   FiSearch, 
//   FiPlus, 
//   FiChevronLeft, 
//   FiChevronRight, 
//   FiChevronsLeft, 
//   FiChevronsRight 
// } from "react-icons/fi";
// import { RiDeleteBin6Line } from "react-icons/ri";
// import AddBranchForm from "./AddBranchForm";
// import EditBranchForm from "./EditBranchForm";
// import useBranches from "@/hooks/useBranches";

// const BranchTable = () => {
//   const {
//     branches,
//     branchTypes,
//     loading,
//     loadingTypes,
//     error,
//     typesError,
//     addBranch,
//     updateBranch,
//     deleteBranch,
//     fetchBranches,
//   } = useBranches();
//   console.log(branchTypes)

//   const [search, setSearch] = useState("");
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [selectedItem, setSelectedItem] = useState(null);
//   const [actionLoading, setActionLoading] = useState({ type: null, id: null });
  
//   // Pagination state
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage, setItemsPerPage] = useState(10);

//   // Filter branches based on search
//   const filteredBranches = branches.filter(
//     (branch) =>
//       branch.branch_name?.toLowerCase().includes(search.toLowerCase()) ||
//       branch.branch_type?.toLowerCase().includes(search.toLowerCase()) ||
//       branch.address?.toLowerCase().includes(search.toLowerCase())
//   );

//   // Reset to first page when search changes
//   useEffect(() => {
//     setCurrentPage(1);
//   }, [search]);

//   // Calculate pagination
//   const totalItems = filteredBranches.length;
//   const totalPages = Math.ceil(totalItems / itemsPerPage);
  
//   // Get current items for the page
//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentBranches = filteredBranches.slice(indexOfFirstItem, indexOfLastItem);

//   // Add new branch
//   const handleAddBranch = async (branchData) => {
//     setActionLoading({ type: "add", id: null });
//     try {
//       await addBranch(branchData);
//       setShowAddModal(false);
//     } catch (error) {
//       console.error("Add failed:", error);
//     } finally {
//       setActionLoading({ type: null, id: null });
//     }
//   };

//   // Edit branch
//   const handleEditBranch = async (updatedBranch) => {
//     if (!selectedItem) return;

//     setActionLoading({ type: "update", id: selectedItem._id });
//     try {
//       await updateBranch(selectedItem._id, updatedBranch);
//       setShowEditModal(false);
//       setSelectedItem(null);
//     } catch (error) {
//       console.error("Update failed:", error);
//     } finally {
//       setActionLoading({ type: null, id: null });
//     }
//   };

//   // Delete branch
//   const handleDeleteBranch = async () => {
//     if (!selectedItem) return;

//     setActionLoading({ type: "delete", id: selectedItem._id });
//     try {
//       await deleteBranch(selectedItem._id);
//       setShowDeleteModal(false);
//       setSelectedItem(null);
//     } catch (error) {
//       console.error("Delete failed:", error);
//     } finally {
//       setActionLoading({ type: null, id: null });
//     }
//   };

//   // Open edit modal
//   const handleOpenEdit = (branch) => {
//     setSelectedItem(branch);
//     setShowEditModal(true);
//   };

//   // Open delete modal
//   const handleOpenDelete = (branch) => {
//     setSelectedItem(branch);
//     setShowDeleteModal(true);
//   };

//   // Pagination handlers
//   const goToPage = (pageNumber) => {
//     if (pageNumber >= 1 && pageNumber <= totalPages) {
//       setCurrentPage(pageNumber);
//     }
//   };

//   const goToFirstPage = () => goToPage(1);
//   const goToLastPage = () => goToPage(totalPages);
//   const goToNextPage = () => goToPage(currentPage + 1);
//   const goToPrevPage = () => goToPage(currentPage - 1);

//   // Generate page numbers to show
//   const getPageNumbers = () => {
//     const pageNumbers = [];
//     const maxPagesToShow = 5;
    
//     if (totalPages <= maxPagesToShow) {
//       for (let i = 1; i <= totalPages; i++) {
//         pageNumbers.push(i);
//       }
//     } else {
//       let startPage = Math.max(1, currentPage - 2);
//       let endPage = Math.min(totalPages, currentPage + 2);
      
//       if (currentPage <= 3) {
//         endPage = maxPagesToShow;
//       } else if (currentPage >= totalPages - 2) {
//         startPage = totalPages - maxPagesToShow + 1;
//       }
      
//       for (let i = startPage; i <= endPage; i++) {
//         pageNumbers.push(i);
//       }
//     }
    
//     return pageNumbers;
//   };

//   // Delete Confirmation Modal
//   const DeleteConfirmationModal = () => (
//     <div
//       className="modal fade show d-block"
//       style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
//       tabIndex="-1"
//     >
//       <div className="modal-dialog modal-dialog-centered">
//         <div className="modal-content rounded-3">
//           <div className="modal-header border-bottom pb-3">
//             <h5 className="modal-title fw-bold fs-5">Delete Branch</h5>
//             <button
//               type="button"
//               className="btn-close"
//               onClick={() => {
//                 setShowDeleteModal(false);
//                 setSelectedItem(null);
//               }}
//               disabled={actionLoading.type === "delete"}
//               aria-label="Close"
//             ></button>
//           </div>

//           <div className="modal-body">
//             <p>
//               Are you sure you want to delete{" "}
//               <strong>{selectedItem?.branch_name}</strong>?
//             </p>
//             <p className="text-muted small">
//               This action cannot be undone.
//             </p>
//           </div>

//           <div className="modal-footer border-top pt-3">
//             <button
//               type="button"
//               className="btn btn-outline-secondary"
//               onClick={() => {
//                 setShowDeleteModal(false);
//                 setSelectedItem(null);
//               }}
//               disabled={actionLoading.type === "delete"}
//             >
//               Cancel
//             </button>
//             <button
//               type="button"
//               className="btn btn-danger"
//               onClick={handleDeleteBranch}
//               disabled={actionLoading.type === "delete"}
//             >
//               {actionLoading.type === "delete" ? (
//                 <>
//                   <span
//                     className="spinner-border spinner-border-sm me-2"
//                     aria-hidden="true"
//                   ></span>
//                   Deleting...
//                 </>
//               ) : (
//                 "Delete"
//               )}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );

//   return (
//     <div className="container-fluid py-4">
//       {/* Error Display */}
//       {error && (
//         <div className="alert alert-danger alert-dismissible fade show mb-4" role="alert">
//           {error}
//           <button type="button" className="btn-close" onClick={() => {}} />
//         </div>
//       )}

//       {/* HEADER */}
//       <div className="card border-0 shadow-sm mb-4">
//         <div className="card-body">
//           <div className="row align-items-center mb-4">
//             <div className="col-md-6">
//               <h1 className="h3 fw-bold mb-2">Branches</h1>
//               <p className="text-muted mb-0">
//                 Manage your branches in a table layout
//               </p>
//             </div>

//             <div className="col-md-6 d-flex justify-content-end gap-2">
//               <button
//                 className="btn btn-primary d-flex align-items-center gap-2"
//                 onClick={() => setShowAddModal(true)}
//                 disabled={loading || actionLoading.type === "add"}
//               >
//                 <FiPlus size={18} />
//                 Add Branch
//               </button>
//             </div>
//           </div>

//           {/* SEARCH AND FILTERS */}
//           <div className="row align-items-center">
//             <div className="col-md-4">
//               <div className="input-group">
//                 <span className="input-group-text bg-transparent border-end-0">
//                   <FiSearch className="text-muted" />
//                 </span>
//                 <input
//                   type="text"
//                   className="form-control border-start-0"
//                   placeholder="Search branches by name, type, or address..."
//                   value={search}
//                   onChange={(e) => setSearch(e.target.value)}
//                   disabled={loading}
//                 />
//               </div>
//             </div>
            
//             {/* Items per page selector */}
//             <div className="col-md-3 ms-auto">
//               <div className="d-flex align-items-center justify-content-end">
//                 <label className="me-2 text-muted small">Show:</label>
//                 <select
//                   className="form-select form-select-sm w-auto"
//                   value={itemsPerPage}
//                   onChange={(e) => {
//                     setItemsPerPage(Number(e.target.value));
//                     setCurrentPage(1);
//                   }}
//                   disabled={loading}
//                 >
//                   <option value="5">5</option>
//                   <option value="10">10</option>
//                   <option value="20">20</option>
//                   <option value="50">50</option>
//                 </select>
//                 <span className="ms-2 text-muted small">entries</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* TABLE */}
//       <div className="card border-0 shadow-sm">
//         <div className="card-body table-responsive">
//           <table className="table align-middle">
//             <thead>
//               <tr>
//                 <th>#</th>
//                 <th>Branch Name</th>
//                 <th>Branch Type</th>
//                 <th>Address</th>
//                 <th>Number</th>
//                 <th className="text-end">Actions</th>
//               </tr>
//             </thead>

//             <tbody>
//               {loading && branches.length === 0 ? (
//                 <tr>
//                   <td colSpan="6" className="text-center py-4">
//                     <div className="d-flex justify-content-center">
//                       <div
//                         className="spinner-border text-primary"
//                       >
//                         <span className="visually-hidden">Loading...</span>
//                       </div>
//                     </div>
//                   </td>
//                 </tr>
//               ) : filteredBranches.length === 0 ? (
//                 <tr>
//                   <td colSpan="6" className="text-center py-4 text-muted">
//                     {search
//                       ? "No branches found for your search"
//                       : "No branches available"}
//                   </td>
//                 </tr>
//               ) : (
//                 currentBranches.map((branch, index) => (
//                   <tr key={branch._id || index}>
//                     <td>{indexOfFirstItem + index + 1}</td>

//                     <td className="fw-semibold">{branch.branch_name}</td>
                    
//                     <td>
//                       <span className="badge bg-primary fw-semibold">
//                         {branch.branch_type || "No Type"}
//                       </span>
//                     </td>
                    
//                     <td>
//                       <span className="text-muted small">
//                         {branch.address || "No address"}
//                       </span>
//                     </td>
                    
//                        <td>
//                       <span className="text-muted small">
//                         {branch.phone || "No "}
//                       </span>
//                     </td>
//                     {/* ACTION BUTTONS */}
//                     <td>
//                       <div className="d-flex justify-content-end gap-2">
//                         <button
//                           className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
//                           onClick={() => handleOpenEdit(branch)}
//                           disabled={
//                             actionLoading.type &&
//                             actionLoading.id === branch._id
//                           }
//                         >
//                           {actionLoading.type === "update" &&
//                           actionLoading.id === branch._id ? (
//                             <>
//                               <span
//                                 className="spinner-border spinner-border-sm me-1"
//                                 aria-hidden="true"
//                               ></span>
//                               Editing...
//                             </>
//                           ) : (
//                             <>
//                               <FiEdit2 size={16} />
//                               Edit
//                             </>
//                           )}
//                         </button>

//                         <button
//                           className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
//                           onClick={() => handleOpenDelete(branch)}
//                           disabled={
//                             actionLoading.type &&
//                             actionLoading.id === branch._id
//                           }
//                         >
//                           {actionLoading.type === "delete" &&
//                           actionLoading.id === branch._id ? (
//                             <>
//                               <span
//                                 className="spinner-border spinner-border-sm me-1"
//                                 aria-hidden="true"
//                               ></span>
//                               Deleting...
//                             </>
//                           ) : (
//                             <>
//                               <RiDeleteBin6Line size={16} />
//                               Delete
//                             </>
//                           )}
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
          
//           {/* PAGINATION */}
//           {filteredBranches.length > 0 && (
//             <div className="d-flex flex-column flex-md-row justify-content-between align-items-center border-top pt-3 mt-3">
//               <div className="mb-2 mb-md-0">
//                 <p className="text-muted mb-0">
//                   Showing {indexOfFirstItem + 1} to{" "}
//                   {Math.min(indexOfLastItem, totalItems)} of {totalItems} entries
//                 </p>
//               </div>
              
//               <div className="d-flex align-items-center gap-1">
//                 {/* First Page */}
//                 <button
//                   className="btn btn-sm btn-outline-secondary"
//                   onClick={goToFirstPage}
//                   disabled={currentPage === 1 || loading}
//                   aria-label="First page"
//                 >
//                   <FiChevronsLeft size={16} />
//                 </button>
                
//                 {/* Previous Page */}
//                 <button
//                   className="btn btn-sm btn-outline-secondary"
//                   onClick={goToPrevPage}
//                   disabled={currentPage === 1 || loading}
//                   aria-label="Previous page"
//                 >
//                   <FiChevronLeft size={16} />
//                 </button>
                
//                 {/* Page Numbers */}
//                 {getPageNumbers().map((pageNumber) => (
//                   <button
//                     key={pageNumber}
//                     className={`btn btn-sm ${
//                       currentPage === pageNumber
//                         ? "btn-primary"
//                         : "btn-outline-secondary"
//                     }`}
//                     onClick={() => goToPage(pageNumber)}
//                     disabled={loading}
//                     aria-label={`Page ${pageNumber}`}
//                     aria-current={currentPage === pageNumber ? "page" : undefined}
//                   >
//                     {pageNumber}
//                   </button>
//                 ))}
                
//                 {/* Next Page */}
//                 <button
//                   className="btn btn-sm btn-outline-secondary"
//                   onClick={goToNextPage}
//                   disabled={currentPage === totalPages || loading}
//                   aria-label="Next page"
//                 >
//                   <FiChevronRight size={16} />
//                 </button>
                
//                 {/* Last Page */}
//                 <button
//                   className="btn btn-sm btn-outline-secondary"
//                   onClick={goToLastPage}
//                   disabled={currentPage === totalPages || loading}
//                   aria-label="Last page"
//                 >
//                   <FiChevronsRight size={16} />
//                 </button>
//               </div>
              
//               {/* Page info */}
//               <div className="mt-2 mt-md-0">
//                 <span className="text-muted">
//                   Page {currentPage} of {totalPages}
//                 </span>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* ADD MODAL */}
//       {showAddModal && (
//         <AddBranchForm
//           key="add-modal"
//           onClose={() => setShowAddModal(false)}
//           onSave={handleAddBranch}
//           loading={actionLoading.type === "add"}
//           branchTypes={branchTypes}
//           loadingTypes={loadingTypes}
//           typesError={typesError}
//         />
//       )}

//       {/* EDIT MODAL */}
//       {showEditModal && selectedItem && (
//         <EditBranchForm
//           key={`edit-modal-${selectedItem._id}`}
//           onClose={() => {
//             setShowEditModal(false);
//             setSelectedItem(null);
//           }}
//           onSave={handleEditBranch}
//           branch={selectedItem}
//           loading={
//             actionLoading.type === "update" &&
//             actionLoading.id === selectedItem._id
//           }
//           branchTypes={branchTypes}
//           loadingTypes={loadingTypes}
//           typesError={typesError}
//         />
//       )}

//       {/* DELETE MODAL */}
//       {showDeleteModal && selectedItem && (
//         <DeleteConfirmationModal key={`delete-modal-${selectedItem._id}`} />
//       )}
//     </div>
//   );
// };

// export default BranchTable;

import React, { useState, useEffect } from "react";
import { 
  FiEdit2, 
  FiSearch, 
  FiPlus, 
  FiChevronLeft, 
  FiChevronRight, 
  FiChevronsLeft, 
  FiChevronsRight 
} from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import AddBranchForm from "./AddBranchForm";
import EditBranchForm from "./EditBranchForm";
import useBranches from "@/hooks/useBranches";

const BranchTable = () => {
  const {
    branches,
    branchTypes,
    loading,
    loadingTypes,
    error,
    typesError,
    addBranch,
    updateBranch,
    deleteBranch,
  } = useBranches();

  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [actionLoading, setActionLoading] = useState({ type: null, id: null });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filter branches based on search
  const filteredBranches = branches.filter(
    (branch) =>
      branch.branch_name?.toLowerCase().includes(search.toLowerCase()) ||
      branch.branch_type?.toLowerCase().includes(search.toLowerCase()) ||
      branch.contact_person?.toLowerCase().includes(search.toLowerCase()) ||
      branch.address?.toLowerCase().includes(search.toLowerCase()) ||
      branch.phone?.includes(search)
  );

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // Calculate pagination
  const totalItems = filteredBranches.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  // Get current items for the page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBranches = filteredBranches.slice(indexOfFirstItem, indexOfLastItem);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Add new branch
  const handleAddBranch = async (branchData) => {
    setActionLoading({ type: "add", id: null });
    try {
      await addBranch(branchData);
      setShowAddModal(false);
    } catch (error) {
      console.error("Add failed:", error);
    } finally {
      setActionLoading({ type: null, id: null });
    }
  };

  // Edit branch
  const handleEditBranch = async (updatedBranch) => {
    if (!selectedItem) return;

    setActionLoading({ type: "update", id: selectedItem._id });
    try {
      await updateBranch(selectedItem._id, updatedBranch);
      setShowEditModal(false);
      setSelectedItem(null);
    } catch (error) {
      console.error("Update failed:", error);
    } finally {
      setActionLoading({ type: null, id: null });
    }
  };

  // Delete branch
  const handleDeleteBranch = async () => {
    if (!selectedItem) return;

    setActionLoading({ type: "delete", id: selectedItem._id });
    try {
      await deleteBranch(selectedItem._id);
      setShowDeleteModal(false);
      setSelectedItem(null);
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setActionLoading({ type: null, id: null });
    }
  };

  // Open edit modal
  const handleOpenEdit = (branch) => {
    setSelectedItem(branch);
    setShowEditModal(true);
  };

  // Open delete modal
  const handleOpenDelete = (branch) => {
    setSelectedItem(branch);
    setShowDeleteModal(true);
  };

  // Pagination handlers
  const goToPage = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const goToFirstPage = () => goToPage(1);
  const goToLastPage = () => goToPage(totalPages);
  const goToNextPage = () => goToPage(currentPage + 1);
  const goToPrevPage = () => goToPage(currentPage - 1);

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, currentPage + 2);
      
      if (currentPage <= 3) {
        endPage = maxPagesToShow;
      } else if (currentPage >= totalPages - 2) {
        startPage = totalPages - maxPagesToShow + 1;
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
    }
    
    return pageNumbers;
  };

  // Delete Confirmation Modal
  const DeleteConfirmationModal = () => (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content rounded-3">
          <div className="modal-header border-bottom pb-3">
            <h5 className="modal-title fw-bold fs-5">Delete Branch</h5>
            <button
              type="button"
              className="btn-close"
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedItem(null);
              }}
              disabled={actionLoading.type === "delete"}
              aria-label="Close"
            ></button>
          </div>

          <div className="modal-body">
            <p>
              Are you sure you want to delete{" "}
              <strong>{selectedItem?.branch_name}</strong>?
            </p>
            <p className="text-muted small">
              Contact Person: <strong>{selectedItem?.contact_person}</strong><br/>
              Branch Code: <strong>{selectedItem?.branch_code || "N/A"}</strong>
            </p>
            <p className="text-muted small">This action cannot be undone.</p>
          </div>

          <div className="modal-footer border-top pt-3">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedItem(null);
              }}
              disabled={actionLoading.type === "delete"}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleDeleteBranch}
              disabled={actionLoading.type === "delete"}
            >
              {actionLoading.type === "delete" ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    aria-hidden="true"
                  ></span>
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container-fluid py-4">
      {/* Error Display */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show mb-4" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => {}} />
        </div>
      )}

      {/* HEADER */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row align-items-center mb-4">
            <div className="col-md-6">
              <h1 className="h3 fw-bold mb-2">Branches</h1>
              <p className="text-muted mb-0">
                Manage your branches in a table layout
              </p>
            </div>

            <div className="col-md-6 d-flex justify-content-end gap-2">
              <button
                className="btn btn-primary d-flex align-items-center gap-2"
                onClick={() => setShowAddModal(true)}
                disabled={loading || actionLoading.type === "add"}
              >
                <FiPlus size={18} />
                Add Branch
              </button>
            </div>
          </div>

          {/* SEARCH AND FILTERS */}
          <div className="row align-items-center">
            <div className="col-md-4">
              <div className="input-group">
                <span className="input-group-text bg-transparent border-end-0">
                  <FiSearch className="text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search branches by name, contact person, or address..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
            
            {/* Items per page selector */}
            <div className="col-md-3 ms-auto">
              <div className="d-flex align-items-center justify-content-end">
                <label className="me-2 text-muted small">Show:</label>
                <select
                  className="form-select form-select-sm w-auto"
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  disabled={loading}
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                </select>
                <span className="ms-2 text-muted small">entries</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="card border-0 shadow-sm">
        <div className="card-body table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th>#</th>
                <th>Branch Name</th>
                <th>Contact Person</th>
                <th>Branch Code</th>
                <th>Branch Type</th>
                <th>Phone</th>
                <th>Warehouse</th>
                <th>Status</th>
                {/* <th>Created Date</th> */}
                <th className="text-end">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading && branches.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center py-4">
                    <div className="d-flex justify-content-center">
                      <div
                        className="spinner-border text-primary"
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : filteredBranches.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center py-4 text-muted">
                    {search
                      ? "No branches found for your search"
                      : "No branches available"}
                  </td>
                </tr>
              ) : (
                currentBranches.map((branch, index) => (
                  <tr key={branch._id || index}>
                    <td>{indexOfFirstItem + index + 1}</td>
                    <td className="fw-semibold">{branch.branch_name}</td>
                    <td>{branch.contact_person || "N/A"}</td>
                    <td>
                      <span className="badge bg-secondary fw-semibold">
                        {branch.branch_code || "N/A"}
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-primary fw-semibold">
                        {branch.branch_type || "No Type"}
                      </span>
                    </td>
                    <td>{branch.phone || "N/A"}</td>
                    <td>
                      <span className={`badge fw-semibold ${branch.is_warehouse ? 'bg-success' : 'bg-light text-dark'}`}>
                        {branch.is_warehouse ? "Yes" : "No"}
                      </span>
                    </td>
                    <td>
                      <span className={`badge fw-semibold ${branch.status ? 'bg-success' : 'bg-danger'}`}>
                        {branch.status ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <span className="text-muted small">
                        {formatDate(branch.createdAt)}
                      </span>
                    </td>
                    
                    {/* ACTION BUTTONS */}
                    <td>
                      <div className="d-flex justify-content-end gap-2">
                        <button
                          className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                          onClick={() => handleOpenEdit(branch)}
                          disabled={
                            actionLoading.type &&
                            actionLoading.id === branch._id
                          }
                        >
                          {actionLoading.type === "update" &&
                          actionLoading.id === branch._id ? (
                            <>
                              <span
                                className="spinner-border spinner-border-sm me-1"
                                aria-hidden="true"
                              ></span>
                              Editing...
                            </>
                          ) : (
                            <>
                              <FiEdit2 size={16} />
                              Edit
                            </>
                          )}
                        </button>

                        <button
                          className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                          onClick={() => handleOpenDelete(branch)}
                          disabled={
                            actionLoading.type &&
                            actionLoading.id === branch._id
                          }
                        >
                          {actionLoading.type === "delete" &&
                          actionLoading.id === branch._id ? (
                            <>
                              <span
                                className="spinner-border spinner-border-sm me-1"
                                aria-hidden="true"
                              ></span>
                              Deleting...
                            </>
                          ) : (
                            <>
                              <RiDeleteBin6Line size={16} />
                              Delete
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          
          {/* PAGINATION */}
          {filteredBranches.length > 0 && (
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center border-top pt-3 mt-3">
              <div className="mb-2 mb-md-0">
                <p className="text-muted mb-0">
                  Showing {indexOfFirstItem + 1} to{" "}
                  {Math.min(indexOfLastItem, totalItems)} of {totalItems} entries
                </p>
              </div>
              
              <div className="d-flex align-items-center gap-1">
                {/* First Page */}
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={goToFirstPage}
                  disabled={currentPage === 1 || loading}
                  aria-label="First page"
                >
                  <FiChevronsLeft size={16} />
                </button>
                
                {/* Previous Page */}
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={goToPrevPage}
                  disabled={currentPage === 1 || loading}
                  aria-label="Previous page"
                >
                  <FiChevronLeft size={16} />
                </button>
                
                {/* Page Numbers */}
                {getPageNumbers().map((pageNumber) => (
                  <button
                    key={pageNumber}
                    className={`btn btn-sm ${
                      currentPage === pageNumber
                        ? "btn-primary"
                        : "btn-outline-secondary"
                    }`}
                    onClick={() => goToPage(pageNumber)}
                    disabled={loading}
                    aria-label={`Page ${pageNumber}`}
                    aria-current={currentPage === pageNumber ? "page" : undefined}
                  >
                    {pageNumber}
                  </button>
                ))}
                
                {/* Next Page */}
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages || loading}
                  aria-label="Next page"
                >
                  <FiChevronRight size={16} />
                </button>
                
                {/* Last Page */}
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={goToLastPage}
                  disabled={currentPage === totalPages || loading}
                  aria-label="Last page"
                >
                  <FiChevronsRight size={16} />
                </button>
              </div>
              
              {/* Page info */}
              <div className="mt-2 mt-md-0">
                <span className="text-muted">
                  Page {currentPage} of {totalPages}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODALS */}
      {showAddModal && (
        <AddBranchForm
          onClose={() => setShowAddModal(false)}
          onSave={handleAddBranch}
          loading={actionLoading.type === "add"}
          branchTypes={branchTypes}
          loadingTypes={loadingTypes}
          typesError={typesError}
        />
      )}

      {showEditModal && selectedItem && (
        <EditBranchForm
          onClose={() => {
            setShowEditModal(false);
            setSelectedItem(null);
          }}
          onSave={handleEditBranch}
          branch={selectedItem}
          loading={
            actionLoading.type === "update" &&
            actionLoading.id === selectedItem._id
          }
          branchTypes={branchTypes}
          loadingTypes={loadingTypes}
          typesError={typesError}
        />
      )}

      {/* DELETE MODAL */}
      {showDeleteModal && selectedItem && (
        <DeleteConfirmationModal />
      )}
    </div>
  );
};

export default BranchTable;