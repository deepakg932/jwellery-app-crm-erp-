import React, { useState, useEffect } from "react";
import { FiEdit2, FiSearch, FiPlus, FiPercent } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import  useGST  from "@/hooks/useGST";
import AddGSTForm from "./AddGSTForm";
import EditGSTForm from "./EditGSTForm";

export default function GSTListTable() {
  const {
    gstList,
    loading,
    addGST,
    updateGST,
    deleteGST,
    fetchGSTList, // Added fetch function for manual refresh
  } = useGST();

  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [actionLoading, setActionLoading] = useState({ type: null, id: null });

  // Filter GST list by total percentage search
  const filteredGSTList = (gstList || []).filter((item) =>
    (item?.total_percentage?.toString() || "").includes(search) ||
    (item?.sgst_percentage?.toString() || "").includes(search) ||
    (item?.cgst_percentage?.toString() || "").includes(search) ||
    (item?.igst_percentage?.toString() || "").includes(search) ||
    (item?.utgst_percentage?.toString() || "").includes(search)
  );

  // Manual refresh function
  const handleRefresh = async () => {
    try {
      setActionLoading({ type: "refresh", id: null });
      await fetchGSTList();
    } catch (error) {
      console.error("Refresh failed:", error);
    } finally {
      setActionLoading({ type: null, id: null });
    }
  };

  // Handle update with loading state
  const handleUpdate = async (gstData) => {
    if (!selectedItem) return;

    setActionLoading({ type: "update", id: selectedItem._id });
    try {
      await updateGST(selectedItem._id, gstData);
      setShowEditModal(false);
      setSelectedItem(null);
    } catch (error) {
      console.error("Update failed:", error);
    } finally {
      setActionLoading({ type: null, id: null });
    }
  };

  // Handle add with loading state
  const handleAdd = async (gstData) => {
    setActionLoading({ type: "add", id: null });
    try {
      await addGST(gstData);
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
      await deleteGST(selectedItem._id);
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

  // Format percentage
  const formatPercentage = (value) => {
    return `${parseFloat(value || 0).toFixed(2)}%`;
  };

  // Get GST total badge color
  const getGSTTotalColor = (totalPercentage) => {
    if (totalPercentage === 0) return 'bg-warning-subtle text-warning';
    if (totalPercentage <= 5) return 'bg-info-subtle text-info';
    if (totalPercentage <= 12) return 'bg-primary-subtle text-primary';
    if (totalPercentage <= 18) return 'bg-secondary-subtle text-secondary';
    return 'bg-danger-subtle text-danger';
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
            <h5 className="modal-title fw-bold fs-5">Delete GST Record</h5>
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
            <p>Are you sure you want to delete this GST record?</p>
            <div className="alert alert-warning py-2 mt-3">
              <small>
                <strong>SGST:</strong> {formatPercentage(selectedItem?.sgst_percentage)}<br/>
                <strong>CGST:</strong> {formatPercentage(selectedItem?.cgst_percentage)}<br/>
                <strong>IGST:</strong> {formatPercentage(selectedItem?.igst_percentage)}<br/>
                <strong>UTGST:</strong> {formatPercentage(selectedItem?.utgst_percentage)}<br/>
                <strong>Total:</strong> {formatPercentage(selectedItem?.total_percentage)}
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
              <h1 className="h3 fw-bold mb-2">GST Rates Management</h1>
              <p className="text-muted mb-0">
                Manage GST percentages and rates
              </p>
            </div>

            <div className="col-md-6 d-flex justify-content-end gap-2">
              <button
                className="btn btn-outline-secondary d-flex align-items-center gap-2"
                onClick={handleRefresh}
                disabled={loading || actionLoading.type === "refresh"}
              >
                {actionLoading.type === "refresh" ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-1" />
                    Refreshing...
                  </>
                ) : (
                  <>
                    <span>⟳</span>
                    Refresh
                  </>
                )}
              </button>
              
              <button
                className="btn btn-primary d-flex align-items-center gap-2"
                onClick={() => setShowAddModal(true)}
                disabled={loading || actionLoading.type}
              >
                <FiPlus size={18} />
                Add GST Rate
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
                  placeholder="Search by percentage..."
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
                <th>SGST</th>
                <th>CGST</th>
                <th>IGST</th>
                <th>UTGST</th>
                <th>Total GST</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading && !actionLoading.type ? (
                <tr>
                  <td colSpan="8" className="text-center py-5">
                    <div className="d-flex flex-column align-items-center">
                      <div className="spinner-border text-primary mb-2">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <small className="text-muted">Loading GST rates...</small>
                    </div>
                  </td>
                </tr>
              ) : filteredGSTList.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-muted">
                    {search
                      ? "No GST rates found for your search"
                      : "No GST rates available"}
                  </td>
                </tr>
              ) : (
                filteredGSTList.map((item, index) => (
                  <tr key={item._id || index}>
                    <td>{index + 1}</td>
                    <td>
                      <span className="badge bg-light text-dark">
                        {formatPercentage(item.sgst_percentage)}
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark">
                        {formatPercentage(item.cgst_percentage)}
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark">
                        {formatPercentage(item.igst_percentage)}
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark">
                        {formatPercentage(item.utgst_percentage)}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${getGSTTotalColor(item.total_percentage)} p-2 fw-bold`}>
                        <FiPercent className="me-1" size={12} />
                        {formatPercentage(item.total_percentage)}
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
        <AddGSTForm
          onClose={() => setShowAddModal(false)}
          onSave={handleAdd}
          loading={actionLoading.type === "add"}
        />
      )}

      {/* EDIT MODAL */}
      {showEditModal && selectedItem && (
        <EditGSTForm
          show={showEditModal}
          onHide={() => {
            setShowEditModal(false);
            setSelectedItem(null);
          }}
          onSubmit={handleUpdate}
          gstData={selectedItem}
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