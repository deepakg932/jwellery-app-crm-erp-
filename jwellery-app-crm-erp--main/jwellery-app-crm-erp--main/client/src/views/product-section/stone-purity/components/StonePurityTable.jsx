import React, { useState } from "react";
import { FiEdit2, FiSearch, FiPlus, FiPercent } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import AddStonePurityForm from "./AddStonePurityForm";
import EditStonePurityForm from "./EditStonePurityForm";
import useStonePurity from "@/hooks/useStonePurity";

const StonePurityTable = () => {
  const { 
    stonePurities = [], 
    stoneTypes = [], 
    loading, 
    error,
    addStonePurity, 
    updateStonePurity, 
    deleteStonePurity,
  } = useStonePurity();
  
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStonePurity, setSelectedStonePurity] = useState(null);
  const [actionLoading, setActionLoading] = useState({ type: null, id: null });

  // Filter purities based on search
  const filtered = stonePurities.filter((purity) =>
    (purity.stone_purity?.toLowerCase() || "").includes(search.toLowerCase()) ||
    (purity.stone_type?.toLowerCase() || "").includes(search.toLowerCase()) ||
    purity.percentage.toString().includes(search)
  );
console.log(stonePurities)
  // Handle add purity
  const handleSave = async (purityData) => {
    setActionLoading({ type: "add", id: null });
    try {
      await addStonePurity(purityData);
      setShowAddModal(false);
    } catch (error) {
      console.error("Add failed:", error);
      // Error is already set in the hook
    } finally {
      setActionLoading({ type: null, id: null });
    }
  };

  // Handle edit purity
  const handleEditPurity = async (purityData) => {
    if (!selectedStonePurity) return;

    setActionLoading({ type: "update", id: selectedStonePurity._id });
    try {
      await updateStonePurity(selectedStonePurity._id, purityData);
      setShowEditModal(false);
      setSelectedStonePurity(null);
    } catch (error) {
      console.error("Update failed:", error);
    } finally {
      setActionLoading({ type: null, id: null });
    }
  };

  // Handle delete purity
  const handleDeletePurity = async () => {
    if (!selectedStonePurity) return;

    setActionLoading({ type: "delete", id: selectedStonePurity._id });
    try {
      await deleteStonePurity(selectedStonePurity._id);
      setShowDeleteModal(false);
      setSelectedStonePurity(null);
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setActionLoading({ type: null, id: null });
    }
  };

  // Open edit modal
  const handleOpenEdit = (purity) => {
    setSelectedStonePurity(purity);
    setShowEditModal(true);
  };

  // Open delete modal
  const handleOpenDelete = (purity) => {
    setSelectedStonePurity(purity);
    setShowDeleteModal(true);
  };

  // Delete Confirmation Modal
  const DeleteConfirmationModal = () => (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content rounded-3">
          <div className="modal-header border-bottom pb-3">
            <h5 className="modal-title fw-bold fs-5">Delete Stone Purity</h5>
            <button
              type="button"
              className="btn-close"
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedStonePurity(null);
              }}
              disabled={actionLoading.type === "delete"}
            ></button>
          </div>
          
          <div className="modal-body">
            <p>Are you sure you want to delete <strong>{selectedStonePurity?.stone_purity}</strong>?</p>
          </div>
          
          <div className="modal-footer border-top pt-3">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedStonePurity(null);
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
              <h1 className="h3 fw-bold mb-2">Stone Purities</h1>
              <p className="text-muted mb-0">
                Manage stone purity levels and percentages
              </p>
            </div>

            <div className="col-md-6 d-flex justify-content-end gap-2">
              <button
                className="btn btn-primary d-flex align-items-center gap-2"
                onClick={() => setShowAddModal(true)}
                disabled={loading || actionLoading.type === "add"}
              >
                <FiPlus size={18} />
                Add Stone Purity
              </button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="alert alert-danger mb-3" role="alert">
              {error}
            </div>
          )}

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
                  placeholder="Search by purity or type..."
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
                <th>Purity Name</th>
                <th>Stone Type</th>
                <th>Percentage</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading && stonePurities.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-4">
                    <div className="d-flex justify-content-center">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-muted">
                    {search
                      ? "No purities found for your search"
                      : "No purities available"}
                  </td>
                </tr>
              ) : (
                filtered.map((purity, index) => (
                  <tr key={purity._id || index}>
                    <td>{index + 1}</td>
                    <td className="fw-semibold">{purity.stone_purity || "N/A"}</td>
                    <td>
                      <span className="badge bg-info text-white">
                        {purity.stone_type || "N/A"}
                        
                      </span>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <FiPercent className="text-primary" />
                        <span className="fw-bold">{purity.percentage}%</span>
                        <div className="progress flex-grow-1" style={{ height: '6px' }}>
                          <div 
                            className="progress-bar bg-primary" 
                            style={{ width: `${Math.min(purity.percentage, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex justify-content-end gap-2">
                        <button
                          className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                          onClick={() => handleOpenEdit(purity)}
                          disabled={actionLoading.type && actionLoading.id === purity._id}
                        >
                          {actionLoading.type === "update" && actionLoading.id === purity._id ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-1"></span>
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
                          disabled={actionLoading.type && actionLoading.id === purity._id}
                        >
                          {actionLoading.type === "delete" && actionLoading.id === purity._id ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-1"></span>
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
        <AddStonePurityForm
          onClose={() => setShowAddModal(false)}
          onSave={handleSave}
          loading={actionLoading.type === "add"}
          stoneOptions={stoneTypes}
        />
      )}

      {/* EDIT MODAL */}
      {showEditModal && selectedStonePurity && (
        <EditStonePurityForm
          show={showEditModal}
          onHide={() => {
            setShowEditModal(false);
            setSelectedStonePurity(null);
          }}
          onSubmit={handleEditPurity}
          stonePurity={selectedStonePurity}
          loading={actionLoading.type === "update" && actionLoading.id === selectedStonePurity._id}
          stoneOptions={stoneTypes}
        />
      )}

      {/* DELETE MODAL */}
      {showDeleteModal && selectedStonePurity && <DeleteConfirmationModal />}
    </div>
  );
};

export default StonePurityTable;