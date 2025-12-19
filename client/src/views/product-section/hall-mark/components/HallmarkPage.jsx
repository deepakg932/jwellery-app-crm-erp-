import React, { useState, useEffect } from "react";
import { FiEdit2, FiSearch, FiPlus, FiTag, FiImage } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import AddHallmarkModal from "./AddHallMark";
import EditHallmarkModal from "./EditHallmarkModal";
import useHallmark from "@/hooks/useHallmark"; // Your custom hook

const HallmarkPage = () => {
  const { 
    hallmarks, 
    metalTypes, 
    loading, 
    addHallmark, 
    updateHallmark, 
    deleteHallmark,
    refreshHallmarks 
  } = useHallmark();
  
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedHallmark, setSelectedHallmark] = useState(null);
  const [actionLoading, setActionLoading] = useState({ type: null, id: null });

  // Debug: Log the data to see what we're getting
  useEffect(() => {
    console.log("Metal types in HallmarkPage:", metalTypes);
    console.log("Hallmarks in HallmarkPage:", hallmarks);
  }, [metalTypes, hallmarks]);

  // Create options for dropdowns
  const metalOptions = metalTypes.map(metal => ({
    id: metal.id,
    name: metal.name
  }));

  console.log("Metal options for dropdown:", metalOptions);

  // Filter hallmarks based on search
  const filtered = hallmarks.filter((hallmark) =>
    hallmark.name?.toLowerCase().includes(search.toLowerCase()) ||
    hallmark.metal_type_name?.toLowerCase().includes(search.toLowerCase())
  );

  // Add new hallmark with API
  const handleSave = async (hallmarkData) => {
    setActionLoading({ type: "add", id: null });
    try {
      await addHallmark(hallmarkData);
      setShowAddModal(false);
    } catch (error) {
      console.error("Add failed:", error);
    } finally {
      setActionLoading({ type: null, id: null });
    }
  };

  // Edit hallmark with API
  const handleEditHallmark = async (updatedHallmark) => {
    if (!selectedHallmark) return;

    setActionLoading({ type: "update", id: selectedHallmark._id });
    try {
      await updateHallmark(selectedHallmark._id, updatedHallmark);
      setShowEditModal(false);
      setSelectedHallmark(null);
    } catch (error) {
      console.error("Update failed:", error);
    } finally {
      setActionLoading({ type: null, id: null });
    }
  };

  // Delete hallmark with API
  const handleDeleteHallmark = async () => {
    if (!selectedHallmark) return;

    setActionLoading({ type: "delete", id: selectedHallmark._id });
    try {
      await deleteHallmark(selectedHallmark._id);
      setShowDeleteModal(false);
      setSelectedHallmark(null);
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setActionLoading({ type: null, id: null });
    }
  };

  // Open edit modal
  const handleOpenEdit = (hallmark) => {
    setSelectedHallmark(hallmark);
    setShowEditModal(true);
  };

  // Open delete modal
  const handleOpenDelete = (hallmark) => {
    setSelectedHallmark(hallmark);
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
        alt={alt || "Hallmark"}
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
            <h5 className="modal-title fw-bold fs-5">Delete Hallmark</h5>
            <button
              type="button"
              className="btn-close"
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedHallmark(null);
              }}
              disabled={actionLoading.type === "delete"}
            ></button>
          </div>
          
          <div className="modal-body">
            <p>Are you sure you want to delete <strong>{selectedHallmark?.name}</strong>?</p>
          </div>
          
          <div className="modal-footer border-top pt-3">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedHallmark(null);
              }}
              disabled={actionLoading.type === "delete"}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleDeleteHallmark}
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
              <h1 className="h3 fw-bold mb-2">Hallmark Management</h1>
              <p className="text-muted mb-0">
                Manage jewelry hallmarks with marks and metal types
              </p>
            </div>

            <div className="col-md-6 d-flex justify-content-end gap-2">
              <button
                className="btn btn-primary d-flex align-items-center gap-2"
                onClick={() => setShowAddModal(true)}
                disabled={loading || actionLoading.type === "add"}
              >
                <FiPlus size={18} />
                Add Hallmark
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
                  placeholder="Search hallmarks..."
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
                <th>Hallmark Code</th>
                <th>Metal Type</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading && hallmarks.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-4">
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
                  <td colSpan="5" className="text-center py-4 text-muted">
                    {search
                      ? "No hallmarks found for your search"
                      : "No hallmarks available"}
                  </td>
                </tr>
              ) : (
                filtered.map((hallmark, index) => (
                  <tr key={hallmark._id || index}>
                    <td>{index + 1}</td>

                    {/* Image Preview */}
                    <td>
                      <SafeImage
                        src={hallmark.imageUrl}
                        alt={hallmark.name}
                        width="45"
                        height="45"
                        className="rounded border"
                        style={{ objectFit: "cover" }}
                      />
                    </td>

                    {/* Hallmark Code */}
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <FiTag className="text-primary" />
                        <span className="fw-bold">{hallmark.name}</span>
                      </div>
                      {hallmark.description && (
                        <small className="text-muted d-block">
                          {hallmark.description.substring(0, 50)}...
                        </small>
                      )}
                    </td>

                    {/* Metal Type */}
                    <td>
                      <span className="badge bg-secondary">
                        {hallmark.metal_type_name}
                      </span>
                    </td>

                    {/* ACTION BUTTONS */}
                    <td>
                      <div className="d-flex justify-content-end gap-2">
                        <button
                          className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                          onClick={() => handleOpenEdit(hallmark)}
                          disabled={
                            actionLoading.type &&
                            actionLoading.id === hallmark._id
                          }
                        >
                          {actionLoading.type === "update" &&
                          actionLoading.id === hallmark._id ? (
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
                          onClick={() => handleOpenDelete(hallmark)}
                          disabled={
                            actionLoading.type &&
                            actionLoading.id === hallmark._id
                          }
                        >
                          {actionLoading.type === "delete" &&
                          actionLoading.id === hallmark._id ? (
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
        <AddHallmarkModal
          onClose={() => setShowAddModal(false)}
          onSave={handleSave}
          loading={actionLoading.type === "add"}
          metalTypes={metalOptions}
        />
      )}

      {/* EDIT MODAL */}
      {showEditModal && selectedHallmark && (
        <EditHallmarkModal
          key={`edit-modal-${selectedHallmark._id}`}
          show={showEditModal}
          onHide={() => {
            setShowEditModal(false);
            setTimeout(() => setSelectedHallmark(null), 100);
          }}
          onSubmit={handleEditHallmark}
          hallmark={selectedHallmark}
          loading={
            actionLoading.type === "update" &&
            actionLoading.id === selectedHallmark._id
          }
          metalTypes={metalOptions}
        />
      )}

      {/* DELETE MODAL */}
      {showDeleteModal && selectedHallmark && (
        <DeleteConfirmationModal key={`delete-modal-${selectedHallmark._id}`} />
      )}
    </div>
  );
};

export default HallmarkPage;