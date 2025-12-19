import React, { useState } from "react";
import { FiEdit2, FiSearch, FiPlus, FiDollarSign } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import { usePriceMaking } from "@/hooks/usePriceMaking";
import AddPriceMaking from "./AddPriceMaking";
import EditPriceMaking from "./EditPriceMaking";

export default function PriceMakingTable() {
  const {
    priceMakings,
    loading,
    dropdownData,
    addPriceMaking,
    updatePriceMaking,
    deletePriceMaking,
    refreshPriceMakings,
    error,
    clearError,
  } = usePriceMaking();

  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [actionLoading, setActionLoading] = useState({ type: null, id: null });

  // Filter price makings by search
  const filteredPriceMakings = (priceMakings || []).filter((item) =>
    Object.values(item).some(value =>
      String(value || "").toLowerCase().includes(search.toLowerCase())
    )
  );

  // Handle add with loading state
  const handleAdd = async (priceMakingData) => {
    setActionLoading({ type: "add", id: null });
    try {
      console.log("Adding price making:", priceMakingData);
      await addPriceMaking(priceMakingData);
      setShowAddModal(false);
      await refreshPriceMakings(); // Refresh to get updated data
    } catch (error) {
      console.error("Add failed:", error);
    } finally {
      setActionLoading({ type: null, id: null });
    }
  };

  // Handle update with loading state
  const handleUpdate = async (priceMakingData) => {
    if (!selectedItem) return;

    setActionLoading({ type: "update", id: selectedItem._id });
    try {
      console.log("Updating price making:", selectedItem._id, priceMakingData);
      await updatePriceMaking(selectedItem._id, priceMakingData);
      setShowEditModal(false);
      setSelectedItem(null);
      await refreshPriceMakings(); // Refresh to get updated data
    } catch (error) {
      console.error("Update failed:", error);
    } finally {
      setActionLoading({ type: null, id: null });
    }
  };

  // Handle delete with confirmation modal
  const handleDelete = async () => {
    if (!selectedItem) return;

    setActionLoading({ type: "delete", id: selectedItem._id });
    try {
      await deletePriceMaking(selectedItem._id);
      setShowDeleteModal(false);
      setSelectedItem(null);
      await refreshPriceMakings(); // Refresh to get updated data
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

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  // Get badge color based on making stage
  const getStageColor = (stage) => {
    const stageColors = {
      'making': 'bg-primary-subtle text-primary',
      'makingStage': 'bg-success-subtle text-success',
      'Cutting': 'bg-danger-subtle text-danger',
      'Sewing': 'bg-info-subtle text-info',
      'Finishing': 'bg-warning-subtle text-warning',
      'Packaging': 'bg-secondary-subtle text-secondary',
    };
    return stageColors[stage] || 'bg-light text-dark border';
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
            <h5 className="modal-title fw-bold fs-5">Delete Price Making</h5>
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
              Are you sure you want to delete this price making entry?
            </p>
            {/* <div className="alert alert-warning py-2 mt-3">
              <small>
                <strong>Stage:</strong> {selectedItem?.stage_name}<br/>
                <strong>Sub Stage:</strong> {selectedItem?.sub_stage_name || "Not Assigned"}<br/>
                <strong>Cost Type:</strong> {selectedItem?.cost_type}<br/>
                <strong>Amount:</strong> {formatCurrency(selectedItem?.cost_amount || selectedItem?.amount)}
              </small>
            </div> */}
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
      {error && (
        <div className="alert alert-danger alert-dismissible fade show mb-3" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={clearError}></button>
        </div>
      )}

      {/* HEADER */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row align-items-center mb-4">
            <div className="col-md-6">
              <h1 className="h3 fw-bold mb-2">Price Making Master</h1>
              <p className="text-muted mb-0">
                Manage production costs and pricing for different stages
              </p>
            </div>

            <div className="col-md-6 d-flex justify-content-end gap-2">
              <button
                className="btn btn-primary d-flex align-items-center gap-2"
                onClick={() => setShowAddModal(true)}
                disabled={loading || actionLoading.type === "add"}
              >
                <FiPlus size={18} />
                Add Price Making
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
                  placeholder="Search price makings..."
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
                <th>Sub Making Stage</th>
                <th>Cost Type</th>
                <th>Unit</th>
                <th>Cost Amount</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading && priceMakings.length === 0 ? (
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
              ) : filteredPriceMakings.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">
                    {search
                      ? "No price makings found for your search"
                      : "No price makings available"}
                  </td>
                </tr>
              ) : (
                filteredPriceMakings.map((item, index) => (
                  <tr key={item._id || index}>
                    <td>{index + 1}</td>
                    <td>
                      <span className={`badge ${getStageColor(item.stage_name)} p-2`}>
                        {item.stage_name || "Not Specified"}
                      </span>
                    </td>
                    <td className="fw-semibold">
                      {item.sub_stage_name || "Not Assigned"}
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border">
                        {item.cost_type || "Not Specified"}
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-info-subtle text-info">
                        {item.unit_name || "N/A"}
                      </span>
                    </td>
                    <td className="fw-bold text-success">
                      <FiDollarSign className="me-1" size={14} />
                      {formatCurrency(item.cost_amount || item.amount)}
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
        </div>
      </div>

      {/* ADD MODAL */}
      {showAddModal && (
        <AddPriceMaking
          onClose={() => setShowAddModal(false)}
          onSave={handleAdd}
          dropdownData={dropdownData}
          priceMakings={priceMakings}
          loading={actionLoading.type === "add"}
        />
      )}

      {/* EDIT MODAL */}
      {showEditModal && selectedItem && (
        <EditPriceMaking
          show={showEditModal}
          onHide={() => {
            setShowEditModal(false);
            setSelectedItem(null);
          }}
          onSubmit={handleUpdate}
          priceMaking={selectedItem}
          dropdownData={dropdownData}
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