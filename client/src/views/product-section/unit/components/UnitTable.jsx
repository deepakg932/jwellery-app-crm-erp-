// import React, { useState } from "react";
// import { FiEdit2, FiSearch, FiPlus } from "react-icons/fi";
// import { RiDeleteBin6Line } from "react-icons/ri";
// import useUnits from "@/hooks/useUnits"; // You'll need to create this hook
// import AddUnitModal from "./AddUnitForm";
// import EditUnitModal from "./EditUnitForm";

// export default function UnitsPage() {
//   const {
//     units,
//     loading,
//     addUnit,
//     updateUnit,
//     deleteUnit,
//   } = useUnits();

//   const [search, setSearch] = useState("");
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [selectedItem, setSelectedItem] = useState(null);
//   const [actionLoading, setActionLoading] = useState({ type: null, id: null });

//   // Filter units by search
//   const filteredUnits = (units || []).filter((unit) =>
//     (unit?.name || "").toLowerCase().includes(search.toLowerCase())
//   );

//   // Handle update with loading state
//   const handleUpdate = async (unitName) => {
//     if (!selectedItem) return;

//     setActionLoading({ type: "update", id: selectedItem._id });
//     try {
//       await updateUnit(selectedItem._id, { name: unitName });
//       setShowEditModal(false);
//       setSelectedItem(null);
//     } catch (error) {
//       console.error("Update failed:", error);
//     } finally {
//       setActionLoading({ type: null, id: null });
//     }
//   };

//   // Handle add with loading state
//   const handleAdd = async (unitName) => {
//     setActionLoading({ type: "add", id: null });
//     try {
//       await addUnit(unitName);
//       setShowAddModal(false);
//     } catch (error) {
//       console.error("Add failed:", error);
//     } finally {
//       setActionLoading({ type: null, id: null });
//     }
//   };

//   // Handle delete with confirmation modal
//   const handleDelete = async () => {
//     if (!selectedItem) return;

//     setActionLoading({ type: "delete", id: selectedItem._id });
//     try {
//       await deleteUnit(selectedItem._id);
//       setShowDeleteModal(false);
//       setSelectedItem(null);
//     } catch (error) {
//       console.error("Delete failed:", error);
//     } finally {
//       setActionLoading({ type: null, id: null });
//     }
//   };

//   // Open edit modal
//   const handleOpenEdit = (item) => {
//     if (!item) return;
//     setSelectedItem(item);
//     setShowEditModal(true);
//   };

//   // Open delete modal
//   const handleOpenDelete = (item) => {
//     if (!item) return;
//     setSelectedItem(item);
//     setShowDeleteModal(true);
//   };

//   // Delete Confirmation Modal Component
//   const DeleteConfirmationModal = () => (
//     <div
//       className="modal fade show d-block"
//       style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
//       tabIndex="-1"
//     >
//       <div className="modal-dialog modal-dialog-centered">
//         <div className="modal-content rounded-3">
//           <div className="modal-header border-bottom pb-3">
//             <h5 className="modal-title fw-bold fs-5">Delete Unit</h5>
//             <button
//               type="button"
//               className="btn-close"
//               onClick={() => {
//                 setShowDeleteModal(false);
//                 setSelectedItem(null);
//               }}
//               disabled={actionLoading.type === "delete"}
//             ></button>
//           </div>

//           <div className="modal-body">
//             <p>
//               Are you sure you want to delete{" "}
//               <strong>{selectedItem?.name}</strong>?
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
//               onClick={handleDelete}
//               disabled={actionLoading.type === "delete"}
//             >
//               {actionLoading.type === "delete" ? (
//                 <>
//                   <span
//                     className="spinner-border spinner-border-sm me-2"
//                     role="status"
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
//       {/* HEADER */}
//       <div className="card border-0 shadow-sm mb-4">
//         <div className="card-body">
//           <div className="row align-items-center mb-4">
//             <div className="col-md-6">
//               <h1 className="h3 fw-bold mb-2">Units</h1>
//               <p className="text-muted mb-0">
//                 Manage your units in a table layout
//               </p>
//             </div>

//             <div className="col-md-6 d-flex justify-content-end gap-2">
//               <button
//                 className="btn btn-primary d-flex align-items-center gap-2"
//                 onClick={() => setShowAddModal(true)}
//                 disabled={loading || actionLoading.type === "add"}
//               >
//                 <FiPlus size={18} />
//                 Add Unit
//               </button>
//             </div>
//           </div>

//           {/* SEARCH */}
//           <div className="row">
//             <div className="col-md-4">
//               <div className="input-group">
//                 <span className="input-group-text bg-transparent border-end-0">
//                   <FiSearch className="text-muted" />
//                 </span>
//                 <input
//                   type="text"
//                   className="form-control border-start-0"
//                   placeholder="Search units..."
//                   value={search}
//                   onChange={(e) => setSearch(e.target.value)}
//                   disabled={loading}
//                 />
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
//                 <th>Unit Name</th>
//                 <th className="text-end">Actions</th>
//               </tr>
//             </thead>

//             <tbody>
//               {loading && units.length === 0 ? (
//                 <tr>
//                   <td colSpan="3" className="text-center py-4">
//                     <div className="d-flex justify-content-center">
//                       <div
//                         className="spinner-border text-primary"
//                         role="status"
//                       >
//                         <span className="visually-hidden">Loading...</span>
//                       </div>
//                     </div>
//                   </td>
//                 </tr>
//               ) : filteredUnits.length === 0 ? (
//                 <tr>
//                   <td colSpan="3" className="text-center py-4 text-muted">
//                     {search
//                       ? "No units found for your search"
//                       : "No units available"}
//                   </td>
//                 </tr>
//               ) : (
//                 filteredUnits.map((item, index) => (
//                   <tr key={item._id || index}>
//                     <td>{index + 1}</td>
//                     <td className="fw-semibold">{item.name || "Unnamed"}</td>

//                     {/* ACTION BUTTONS */}
//                     <td>
//                       <div className="d-flex justify-content-end gap-2">
//                         <button
//                           className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
//                           onClick={() => handleOpenEdit(item)}
//                           disabled={
//                             actionLoading.type && actionLoading.id === item._id
//                           }
//                         >
//                           {actionLoading.type === "update" &&
//                           actionLoading.id === item._id ? (
//                             <>
//                               <span
//                                 className="spinner-border spinner-border-sm me-1"
//                                 role="status"
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
//                           onClick={() => handleOpenDelete(item)}
//                           disabled={
//                             actionLoading.type && actionLoading.id === item._id
//                           }
//                         >
//                           {actionLoading.type === "delete" &&
//                           actionLoading.id === item._id ? (
//                             <>
//                               <span
//                                 className="spinner-border spinner-border-sm me-1"
//                                 role="status"
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
//         </div>
//       </div>

//       {/* ADD MODAL */}
//       {showAddModal && (
//         <AddUnitModal
//           onClose={() => setShowAddModal(false)}
//           onSave={handleAdd}
//           loading={actionLoading.type === "add"}
//         />
//       )}

//       {/* EDIT MODAL */}
//       {showEditModal && selectedItem && (
//         <EditUnitModal
//           show={showEditModal}
//           onHide={() => {
//             setShowEditModal(false);
//             setSelectedItem(null);
//           }}
//           onSubmit={handleUpdate}
//           unit={selectedItem}
//           loading={
//             actionLoading.type === "update" &&
//             actionLoading.id === selectedItem._id
//           }
//         />
//       )}

//       {/* DELETE MODAL */}
//       {showDeleteModal && selectedItem && <DeleteConfirmationModal />}
//     </div>
//   );
// }

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
import useUnits from "@/hooks/useUnits";
import AddUnitModal from "./AddUnitModal";
import EditUnitModal from "./EditUnitModal";

export default function UnitsPage() {
  const {
    units,
    loading,
    addUnit,
    updateUnit,
    deleteUnit,
  } = useUnits();

  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [actionLoading, setActionLoading] = useState({ type: null, id: null });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filter units by search
  const filteredUnits = (units || []).filter((unit) =>
    (unit?.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (unit?.code || "").toLowerCase().includes(search.toLowerCase())
  );

  // Pagination
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const totalItems = filteredUnits.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUnits.slice(indexOfFirstItem, indexOfLastItem);

  // Handle update with loading state - FIXED
  const handleUpdate = async (unitData) => {
    if (!selectedItem) return;

    setActionLoading({ type: "update", id: selectedItem._id });
    try {
      // Send the complete unitData object, not just { name: unitData }
      await updateUnit(selectedItem._id, unitData);
      setShowEditModal(false);
      setSelectedItem(null);
    } catch (error) {
      console.error("Update failed:", error);
    } finally {
      setActionLoading({ type: null, id: null });
    }
  };

  // Handle add with loading state - FIXED
  const handleAdd = async (unitData) => {
    setActionLoading({ type: "add", id: null });
    try {
      await addUnit(unitData);
      setShowAddModal(false);
    } catch (error) {
      console.error("Add failed:", error);
    } finally {
      setActionLoading({ type: null, id: null });
    }
  };

  // Handle delete with confirmation modal
  const handleDelete = async () => {
    if (!selectedItem) return;

    setActionLoading({ type: "delete", id: selectedItem._id });
    try {
      await deleteUnit(selectedItem._id);
      setShowDeleteModal(false);
      setSelectedItem(null);
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setActionLoading({ type: null, id: null });
    }
  };

  // Open edit modal
  const handleOpenEdit = (item) => {
    if (!item) return;
    setSelectedItem(item);
    setShowEditModal(true);
  };

  // Open delete modal
  const handleOpenDelete = (item) => {
    if (!item) return;
    setSelectedItem(item);
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

  // Delete Confirmation Modal Component
  const DeleteConfirmationModal = () => (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content rounded-3">
          <div className="modal-header border-bottom pb-3">
            <h5 className="modal-title fw-bold fs-5">Delete Unit</h5>
            <button
              type="button"
              className="btn-close"
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedItem(null);
              }}
              disabled={actionLoading.type === "delete"}
            ></button>
          </div>

          <div className="modal-body">
            <p>
              Are you sure you want to delete{" "}
              <strong>{selectedItem?.name}</strong>?
            </p>
            <p className="text-muted small">
              Code: <strong>{selectedItem?.code}</strong>
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
              onClick={handleDelete}
              disabled={actionLoading.type === "delete"}
            >
              {actionLoading.type === "delete" ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
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
      {/* HEADER */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row align-items-center mb-4">
            <div className="col-md-6">
              <h1 className="h3 fw-bold mb-2">Units Management</h1>
              <p className="text-muted mb-0">
                Manage measurement units with conversion factors
              </p>
            </div>

            <div className="col-md-6 d-flex justify-content-end gap-2">
              <button
                className="btn btn-primary d-flex align-items-center gap-2"
                onClick={() => setShowAddModal(true)}
                disabled={loading || actionLoading.type === "add"}
              >
                <FiPlus size={18} />
                Add Unit
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
                  placeholder="Search by name or code..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

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
                <th>Unit Name</th>
                <th>Code</th>
                <th>Conversion Factor</th>
                <th>Status</th>
                <th>Created Date</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading && units.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    <div className="d-flex justify-content-center">
                      <div
                        className="spinner-border text-primary"
                        role="status"
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : filteredUnits.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">
                    {search
                      ? "No units found for your search"
                      : "No units available"}
                  </td>
                </tr>
              ) : (
                currentItems.map((item, index) => (
                  <tr key={item._id || index}>
                    <td>{indexOfFirstItem + index + 1}</td>
                    <td className="fw-semibold">{item.name || "Unnamed"}</td>
                    <td>
                      <span className="badge bg-secondary fw-semibold">
                        {item.code || "N/A"}
                      </span>
                    </td>
                    <td>{item.conversion_factor || 1}</td>
                    <td>
                      <span className={`badge fw-semibold ${item.is_active ? 'bg-success' : 'bg-danger'}`}>
                        {item.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <span className="text-muted small">
                        {formatDate(item.createdAt)}
                      </span>
                    </td>

                    {/* ACTION BUTTONS */}
                    <td>
                      <div className="d-flex justify-content-end gap-2">
                        <button
                          className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                          onClick={() => handleOpenEdit(item)}
                          disabled={
                            actionLoading.type && actionLoading.id === item._id
                          }
                        >
                          {actionLoading.type === "update" &&
                          actionLoading.id === item._id ? (
                            <>
                              <span
                                className="spinner-border spinner-border-sm me-1"
                                role="status"
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
                          onClick={() => handleOpenDelete(item)}
                          disabled={
                            actionLoading.type && actionLoading.id === item._id
                          }
                        >
                          {actionLoading.type === "delete" &&
                          actionLoading.id === item._id ? (
                            <>
                              <span
                                className="spinner-border spinner-border-sm me-1"
                                role="status"
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
          {filteredUnits.length > 0 && (
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center border-top pt-3 mt-3">
              <div className="mb-2 mb-md-0">
                <p className="text-muted mb-0">
                  Showing {indexOfFirstItem + 1} to{" "}
                  {Math.min(indexOfLastItem, totalItems)} of {totalItems}{" "}
                  entries
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
                    aria-current={
                      currentPage === pageNumber ? "page" : undefined
                    }
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
        <AddUnitModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAdd}
          loading={actionLoading.type === "add"}
        />
      )}

      {showEditModal && selectedItem && (
        <EditUnitModal
          show={showEditModal}
          onHide={() => {
            setShowEditModal(false);
            setSelectedItem(null);
          }}
          onSubmit={handleUpdate}
          unit={selectedItem}
          loading={
            actionLoading.type === "update" &&
            actionLoading.id === selectedItem._id
          }
        />
      )}

      {/* DELETE MODAL */}
      {showDeleteModal && selectedItem && <DeleteConfirmationModal />}
    </div>
  );
}