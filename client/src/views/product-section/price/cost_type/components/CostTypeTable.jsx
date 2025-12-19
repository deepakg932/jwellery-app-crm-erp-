import React, { useState } from "react";
import { FiEdit2, FiSearch, FiPlus, FiTag } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import { useCostType } from "@/hooks/useCostType";
import useCostMaster from "@/hooks/useCostMaster";
import useMakingSubStages from "@/hooks/useMakingSubStages";
import AddCostType from "./AddCostType";
import EditCostType from "./EditCostType";

export default function CostTypeTable() {
  // Use all hooks
  const {
    costTypes,
    loading: costTypeLoading,
    addCostType,
    updateCostType,
    deleteCostType,
    refreshCostTypes,
    error: costTypeError,
    clearError
  } = useCostType();

  const {
    costs,
    loading: costLoading,
  } = useCostMaster();

  const {
    makingSubStages,
    loading: subStagesLoading,
  } = useMakingSubStages();

  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [actionLoading, setActionLoading] = useState({ type: null, id: null });

  // Transform costs for dropdown
  const costNames = costs.map(cost => ({
    _id: cost._id,
    cost_name: cost.cost_name || cost.name || "",
  }));

  // Filter cost types by search
  const filteredCostTypes = (costTypes || []).filter(
    (costType) =>
      (costType?.cost_type || "")
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      (costType?.cost_name || "")
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      (costType?.making_sub_stage_name || "")
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  // Handle add cost type
  const handleAdd = async (costTypeData) => {
    setActionLoading({ type: "add", id: null });
    try {
      await addCostType(costTypeData);
      setShowAddModal(false);
      refreshCostTypes(); // Refresh to get updated data
    } catch (error) {
      console.error("Add failed:", error);
    } finally {
      setActionLoading({ type: null, id: null });
    }
  };

  // Handle update cost type
  const handleUpdate = async (costTypeData) => {
    if (!selectedItem) return;

    setActionLoading({ type: "update", id: selectedItem._id });
    try {
      await updateCostType(selectedItem._id, costTypeData);
      setShowEditModal(false);
      setSelectedItem(null);
      refreshCostTypes(); // Refresh to get updated data
    } catch (error) {
      console.error("Update failed:", error);
    } finally {
      setActionLoading({ type: null, id: null });
    }
  };

  // Handle delete cost type
  const handleDelete = async () => {
    if (!selectedItem) return;

    setActionLoading({ type: "delete", id: selectedItem._id });
    try {
      await deleteCostType(selectedItem._id);
      setShowDeleteModal(false);
      setSelectedItem(null);
      refreshCostTypes(); // Refresh to get updated data
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

  // Get loading state
  const isLoading = costTypeLoading || costLoading || subStagesLoading;

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
            <h5 className="modal-title fw-bold fs-5">Delete Cost Type</h5>
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
              <strong>{selectedItem?.cost_type}</strong>?
            </p>
            <div className="alert alert-warning py-2 mt-3">
              <small>
                <strong>Note:</strong> This will delete the cost type
                association. Associated costs will not be affected.
              </small>
            </div>
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
      {/* Error Alert */}
      {costTypeError && (
        <div className="alert alert-danger alert-dismissible fade show mb-3" role="alert">
          {costTypeError}
          <button type="button" className="btn-close" onClick={clearError}></button>
        </div>
      )}

      {/* HEADER */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row align-items-center mb-4">
            <div className="col-md-6">
              <h1 className="h3 fw-bold mb-2">Cost Type Master</h1>
              <p className="text-muted mb-0">
                Manage cost types and their associations with cost names and
                sub-stages
              </p>
            </div>

            <div className="col-md-6 d-flex justify-content-end gap-2">
              <button
                className="btn btn-primary d-flex align-items-center gap-2"
                onClick={() => setShowAddModal(true)}
                disabled={isLoading || actionLoading.type === "add"}
              >
                <FiPlus size={18} />
                Add Cost Type
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
                  placeholder="Search cost types..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  disabled={isLoading}
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
                <th>Cost Type</th>
                <th>Cost Name</th>
                <th>Sub Stage</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>

            <tbody>
              {isLoading && costTypes.length === 0 ? (
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
              ) : filteredCostTypes.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted">
                    {search
                      ? "No cost types found for your search"
                      : "No cost types available"}
                  </td>
                </tr>
              ) : (
                filteredCostTypes.map((item, index) => (
                  <tr key={item._id || index}>
                    <td>{index + 1}</td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <span className={`fw-semibold p-2`}>
                          {item.cost_type || "Not Specified"}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-primary">
                        {item.cost_name || "Not Assigned"}
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-info">
                        {item.making_sub_stage_name || "Not Assigned"}
                      </span>
                    </td>
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
        <AddCostType
          onClose={() => setShowAddModal(false)}
          onSave={handleAdd}
          loading={actionLoading.type === "add"}
          makingSubStages={makingSubStages}
          costNames={costNames}
        />
      )}

      {/* EDIT MODAL */}
      {showEditModal && selectedItem && (
        <EditCostType
          show={showEditModal}
          onHide={() => {
            setShowEditModal(false);
            setSelectedItem(null);
          }}
          onSubmit={handleUpdate}
          costType={selectedItem}
          loading={
            actionLoading.type === "update" &&
            actionLoading.id === selectedItem._id
          }
          makingSubStages={makingSubStages}
          costNames={costNames}
        />
      )}

      {/* DELETE MODAL */}
      {showDeleteModal && selectedItem && <DeleteConfirmationModal />}
    </div>
  );
}