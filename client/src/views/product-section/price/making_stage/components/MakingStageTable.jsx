import React, { useState } from "react";
import { FiEdit2, FiSearch, FiPlus } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import {useMakingStage} from "@/hooks/useMakingStage"; // You'll need to create this hook

import AddMakingStageForm from "./AddMakingStageForm";
import EditMakingStageForm from "./EditMakingStageForm";

export default function MakingStageTable() {
  const {
    stages,
    loading,
    addStage,
    updateStage,
    deleteStage,
  } = useMakingStage();

  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [actionLoading, setActionLoading] = useState({ type: null, id: null });

  // Filter MakingStage by search
  const filteredMakingStage = (stages || []).filter((stages) =>
    (stages?.stage_name || "").toLowerCase().includes(search.toLowerCase())
  );

  // Handle update with loading state
  const handleUpdate = async (makingStage) => {
    if (!selectedItem) return;

    setActionLoading({ type: "update", id: selectedItem._id });
    try {
      await updateStage(selectedItem._id, makingStage );
      setShowEditModal(false);
      setSelectedItem(null);
    } catch (error) {
      console.error("Update failed:", error);
    } finally {
      setActionLoading({ type: null, id: null });
    }
  };

  // Handle add with loading state
  const handleAdd = async (makingStage) => {
    console.log("dkadksamkmsa")
    setActionLoading({ type: "add", id: null });
    try {
      await addStage(makingStage);
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
      await deleteStage(selectedItem._id);
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
              <strong>{selectedItem?.stage_name}</strong>?
            </p>
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
              <h1 className="h3 fw-bold mb-2">Making Stage</h1>
              <p className="text-muted mb-0">
                Manage your making stage in a table layout
              </p>
            </div>

            <div className="col-md-6 d-flex justify-content-end gap-2">
              <button
                className="btn btn-primary d-flex align-items-center gap-2"
                onClick={() => setShowAddModal(true)}
                disabled={loading || actionLoading.type === "add"}
              >
                <FiPlus size={18} />
                Add Making Stage
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
                  placeholder="Search units..."
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
                <th>Making Stage</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading && stages.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center py-4">
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
              ) : filteredMakingStage.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center py-4 text-muted">
                    {search
                      ? "No units found for your search"
                      : "No units available"}
                  </td>
                </tr>
              ) : (
                filteredMakingStage.map((item, index) => (
                  <tr key={item._id || index}>
                    <td>{index + 1}</td>
                    <td className="fw-semibold">{item.stage_name || "Unnamed"}</td>

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
        </div>
      </div>

      {/* ADD MODAL */}
      {showAddModal && (
        <AddMakingStageForm
          onClose={() => setShowAddModal(false)}
          onSave={handleAdd}
          loading={actionLoading.type === "add"}
        />
      )}

      {/* EDIT MODAL */}
      {showEditModal && selectedItem && (
        <EditMakingStageForm
          show={showEditModal}
          onHide={() => {
            setShowEditModal(false);
            setSelectedItem(null);
          }}
          onSubmit={handleUpdate}
          stage_name={selectedItem}
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