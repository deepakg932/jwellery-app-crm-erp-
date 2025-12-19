import React, { useState, useEffect } from "react";
import { FiEdit2, FiSearch, FiPlus, FiImage, FiPercent } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import AddPurityModal from "./AddPurityModal";
import EditPurityModal from "./EditPurityModal";
import usePurity from "@/hooks/usePurity"; // Your custom hook

const PurityPage = () => {
  const { 
    purities, 
    metalTypes, 
    loading, 
    addPurity, 
    updatePurity, 
    deletePurity,
    refreshPurities,
    refreshMetalTypes
  } = usePurity();
  
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPurity, setSelectedPurity] = useState(null);
  const [actionLoading, setActionLoading] = useState({ type: null, id: null });

  // Create metal options for dropdowns
  const allMetalOptions = metalTypes.map(metal => ({
    id: metal.id,
    name: metal.name
  }));

  // Filter purities based on search
  const filtered = purities.filter((purity) =>
    purity.purity_name?.toLowerCase().includes(search.toLowerCase()) ||
    purity.metal_type?.toLowerCase().includes(search.toLowerCase()) ||
    purity.percentage.toString().includes(search)
  );

  // Add new purity with API
  const handleSave = async (purityData) => {
    setActionLoading({ type: "add", id: null });
    try {
      await addPurity(purityData);
      setShowAddModal(false);
    } catch (error) {
      console.error("Add failed:", error);
    } finally {
      setActionLoading({ type: null, id: null });
    }
  };

  // Edit purity with API
  const handleEditPurity = async (updatedPurity) => {
    if (!selectedPurity) return;

    setActionLoading({ type: "update", id: selectedPurity._id });
    try {
      await updatePurity(selectedPurity._id, updatedPurity);
      setShowEditModal(false);
      setSelectedPurity(null);
    } catch (error) {
      console.error("Update failed:", error);
    } finally {
      setActionLoading({ type: null, id: null });
    }
  };

  // Delete purity with API
  const handleDeletePurity = async () => {
    if (!selectedPurity) return;

    setActionLoading({ type: "delete", id: selectedPurity._id });
    try {
      await deletePurity(selectedPurity._id);
      setShowDeleteModal(false);
      setSelectedPurity(null);
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setActionLoading({ type: null, id: null });
    }
  };

  // Open edit modal
  const handleOpenEdit = (purity) => {
    setSelectedPurity(purity);
    setShowEditModal(true);
  };

  // Open delete modal
  const handleOpenDelete = (purity) => {
    setSelectedPurity(purity);
    setShowDeleteModal(true);
  };

  // Safe image component to prevent errors
  const SafeImage = ({ src, alt, ...props }) => {
    const [hasError, setHasError] = useState(false);

    if (hasError || !src) {
      return (
        <div
          className="bg-light border rounded d-flex justify-content-center align-items-center"
          style={{ width: 45, height: 45 }}
        >
          <FiImage className="text-muted" />
        </div>
      );
    }

    return (
      <img
        src={src}
        alt={alt || "Purity"}
        {...props}
        onError={() => setHasError(true)}
      />
    );
  };

  // Delete Confirmation Modal Component
  const DeleteConfirmationModal = () => (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content rounded-3">
          <div className="modal-header border-bottom pb-3">
            <h5 className="modal-title fw-bold fs-5">Delete Purity</h5>
            <button
              type="button"
              className="btn-close"
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedPurity(null);
              }}
              disabled={actionLoading.type === "delete"}
            ></button>
          </div>
          
          <div className="modal-body">
            <p>Are you sure you want to delete <strong>{selectedPurity?.purity_name}</strong>?</p>
          </div>
          
          <div className="modal-footer border-top pt-3">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedPurity(null);
              }}
              disabled={actionLoading.type === "delete"}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleDeletePurity}
              disabled={actionLoading.type === "delete"}
            >
              {actionLoading.type === "delete" ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Deleting...
                </>
              ) : (
                'Delete'
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
              <h1 className="h3 fw-bold mb-2">Purities Management</h1>
              <p className="text-muted mb-0">
                Manage metal purities with percentages and images
              </p>
            </div>

            <div className="col-md-6 d-flex justify-content-end gap-2">
              <button
                className="btn btn-primary d-flex align-items-center gap-2"
                onClick={() => setShowAddModal(true)}
                disabled={loading || actionLoading.type === "add"}
              >
                <FiPlus size={18} />
                Add Purity
              </button>
            </div>
          </div>

          {/* SEARCH */}
          <div className="row">
            <div className="col-md-4">
              <div className="input-group">
                <span className="input-group-text bg-transparent border-end-0">
                  <FiSearch className="text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search by purity name, metal, or percentage..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  disabled={loading}
                />
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
                <th>Image</th>
                <th>Purity Name</th>
                <th>Metal Type</th>
                <th>Percentage</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading && purities.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">
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
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted">
                    {search
                      ? "No purities found for your search"
                      : "No purities available"}
                  </td>
                </tr>
              ) : (
                filtered.map((purity, index) => (
                  <tr key={purity._id || index}>
                    <td>{index + 1}</td>

                    {/* IMAGE PREVIEW */}
                    <td>
                      <SafeImage
                        src={purity.imageUrl}
                        alt={purity.purity_name}
                        width="45"
                        height="45"
                        className="rounded border"
                        style={{ objectFit: "cover" }}
                      />
                    </td>

                    <td className="fw-semibold">{purity.purity_name}</td>

                    {/* Metal Type */}
                    <td>
                      <span className="badge bg-warning text-dark">
                        {purity.metal_type}
                      </span>
                    </td>

                    {/* Percentage */}
                    <td>
                      <div className="d-flex align-items-center gap-1">
                        <FiPercent className="text-success" />
                        <span className="fw-bold">{purity.percentage}%</span>
                        <div className="progress flex-grow-1" style={{ height: '6px', width: '80px' }}>
                          <div 
                            className="progress-bar bg-success" 
                            role="progressbar" 
                            style={{ width: `${purity.percentage}%` }}
                            aria-valuenow={purity.percentage}
                            aria-valuemin="0"
                            aria-valuemax="100"
                          ></div>
                        </div>
                      </div>
                    </td>

                    {/* ACTION BUTTONS */}
                    <td>
                      <div className="d-flex justify-content-end gap-2">
                        <button
                          className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                          onClick={() => handleOpenEdit(purity)}
                          disabled={
                            actionLoading.type &&
                            actionLoading.id === purity._id
                          }
                        >
                          {actionLoading.type === "update" &&
                          actionLoading.id === purity._id ? (
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
                          onClick={() => handleOpenDelete(purity)}
                          disabled={
                            actionLoading.type &&
                            actionLoading.id === purity._id
                          }
                        >
                          {actionLoading.type === "delete" &&
                          actionLoading.id === purity._id ? (
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
        </div>
      </div>

      {/* ADD MODAL */}
      {showAddModal && (
        <AddPurityModal
          onClose={() => setShowAddModal(false)}
          onSave={handleSave}
          loading={actionLoading.type === "add"}
          metalOptions={allMetalOptions}
        />
      )}

      {/* EDIT MODAL */}
      {showEditModal && selectedPurity && (
        <EditPurityModal
          key={`edit-modal-${selectedPurity._id}`}
          show={showEditModal}
          onHide={() => {
            setShowEditModal(false);
            setTimeout(() => setSelectedPurity(null), 100);
          }}
          onSubmit={handleEditPurity}
          purity={selectedPurity}
          loading={
            actionLoading.type === "update" &&
            actionLoading.id === selectedPurity._id
          }
          metalOptions={allMetalOptions}
        />
      )}

      {/* DELETE MODAL */}
      {showDeleteModal && selectedPurity && (
        <DeleteConfirmationModal key={`delete-modal-${selectedPurity._id}`} />
      )}
    </div>
  );
};

export default PurityPage;