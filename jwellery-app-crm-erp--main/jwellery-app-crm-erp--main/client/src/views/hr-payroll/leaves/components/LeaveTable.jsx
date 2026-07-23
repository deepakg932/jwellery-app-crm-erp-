import React, { useState } from "react";
import {
  FiSearch,
  FiPlus,
  FiCalendar,
  FiCheck,
  FiX,
  FiEye,
  FiEdit,
  FiEdit2,
} from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import { useLeave } from "@/hooks/useLeave";
import AddLeaveForm from "./AddLeaveForm";
import EditLeaveForm from "./EditLeaveForm";
import { toast } from "react-toastify";

export default function LeaveTable() {
  const {
    leaves,
    employees,
    leaveTypes,
    loading,
    addLeave,
    updateLeave,
    deleteLeave,
  } = useLeave();

  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [actionLoading, setActionLoading] = useState({ type: null, id: null });

  // Filter leaves by search
  const filteredLeaves = (leaves || []).filter(
    (item) =>
      (item?.employee_name || "")
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      (item?.leave_type_name || "")
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      (item?.status || "").toLowerCase().includes(search.toLowerCase()),
  );

  console.log(filteredLeaves);

  // Handle add with loading state
  const handleAdd = async (leaveData) => {
    setActionLoading({ type: "add", id: null });
    try {
      await addLeave(leaveData);
      setShowAddModal(false);
    } catch (error) {
      console.error("Add failed:", error);
    } finally {
      setActionLoading({ type: null, id: null });
    }
  };

  // Handle update with loading state
  const handleUpdate = async (leaveId, updatedData) => {
    setActionLoading({ type: "edit", id: leaveId });
    try {
      await updateLeave(leaveId, updatedData);
      setShowEditModal(false);
    } catch (error) {
      console.error("Update failed:", error);
    } finally {
      setActionLoading({ type: null, id: null });
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedItem) return;

    setActionLoading({ type: "delete", id: selectedItem._id });
    try {
      await deleteLeave(selectedItem._id);
      setShowDeleteModal(false);
      setSelectedItem(null);
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setActionLoading({ type: null, id: null });
    }
  };

  // Open delete modal
  const handleOpenDelete = (item) => {
    if (!item) return;
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  // Open view modal
  const handleOpenView = (item) => {
    setSelectedItem(item);
    setShowViewModal(true);
  };

  // Open edit modal
  const handleOpenEdit = (item) => {
    setSelectedItem(item);
    setShowEditModal(true);
  };

  // Get status badge color
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "bg-success-subtle text-success";
      case "rejected":
        return "bg-danger-subtle text-danger";
      case "pending":
        return "bg-warning-subtle text-warning";
      default:
        return "bg-secondary-subtle text-secondary";
    }
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return "N/A";
    const d = new Date(date);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Get duration display
  const getDurationDisplay = (item) => {
    switch (item.duration_type) {
      case "full_day":
        return "Full Day";
      case "first_half":
        return "First Half";
      case "second_half":
        return "Second Half";
      case "multiple":
        return `${formatDate(item.from_date)} - ${formatDate(item.to_date)}`;
      default:
        return "N/A";
    }
  };

  // Delete Confirmation Modal
  const DeleteConfirmationModal = () => (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content rounded-3">
          <div className="modal-header border-bottom pb-3">
            <h5 className="modal-title fw-bold fs-5">Delete Leave</h5>
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
              Are you sure you want to delete leave application for{" "}
              <strong>{selectedItem?.employee_name}</strong>?
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
                  <span className="spinner-border spinner-border-sm me-2"></span>
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

  // View Leave Modal
  const ViewLeaveModal = () => (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content rounded-3">
          <div className="modal-header border-bottom pb-3">
            <h5 className="modal-title fw-bold fs-5">Leave Details</h5>
            <button
              type="button"
              className="btn-close"
              onClick={() => {
                setShowViewModal(false);
                setSelectedItem(null);
              }}
            ></button>
          </div>
          <div className="modal-body">
            {selectedItem && (
              <div className="row">
                <div className="col-6 mb-3">
                  <label className="text-muted small">Employee</label>
                  <div className="fw-semibold">
                    {selectedItem.employee_name}
                  </div>
                </div>
                <div className="col-6 mb-3">
                  <label className="text-muted small">Leave Type</label>
                  <div className="fw-semibold">
                    {selectedItem.leave_type_name}
                  </div>
                </div>
                <div className="col-6 mb-3">
                  <label className="text-muted small">Duration</label>
                  <div className="fw-semibold">
                    {getDurationDisplay(selectedItem)}
                  </div>
                </div>
                <div className="col-6 mb-3">
                  <label className="text-muted small">Status</label>
                  <div>
                    <span
                      className={`badge ${getStatusBadge(selectedItem.status)}`}
                    >
                      {selectedItem.status}
                    </span>
                  </div>
                </div>
                <div className="col-12 mb-3">
                  <label className="text-muted small">Reason</label>
                  <div className="fw-semibold">
                    {selectedItem.reason || "N/A"}
                  </div>
                </div>
                {selectedItem.attachment && (
                  <div className="col-12 mb-3">
                    <label className="text-muted small">Attachment</label>
                    <div>
                      <a
                        href={selectedItem.attachment}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View Attachment
                      </a>
                    </div>
                  </div>
                )}
                <div className="col-6 mb-3">
                  <label className="text-muted small">Applied On</label>
                  <div>{formatDate(selectedItem.applied_on)}</div>
                </div>
                {selectedItem.approved_on && (
                  <div className="col-6 mb-3">
                    <label className="text-muted small">
                      Approved/Rejected On
                    </label>
                    <div>{formatDate(selectedItem.approved_on)}</div>
                  </div>
                )}
                {selectedItem.remarks && (
                  <div className="col-12 mb-3">
                    <label className="text-muted small">Remarks</label>
                    <div>{selectedItem.remarks}</div>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="modal-footer border-top pt-3">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => {
                setShowViewModal(false);
                setSelectedItem(null);
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row align-items-center mb-4">
            <div className="col-md-6">
              <h1 className="h3 fw-bold mb-2">Leave Management</h1>
              <p className="text-muted mb-0">
                Manage employee leave applications and requests
              </p>
            </div>
            <div className="col-md-6 d-flex justify-content-end gap-2">
              <button
                className="btn btn-primary d-flex align-items-center gap-2"
                onClick={() => setShowAddModal(true)}
                disabled={loading || actionLoading.type === "add"}
              >
                <FiPlus size={18} />
                Apply Leave
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="row">
            <div className="col-md-4">
              <div className="input-group">
                <span className="input-group-text bg-transparent border-end-0">
                  <FiSearch className="text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search by employee, leave type, status..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {/* <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm bg-primary bg-opacity-10">
            <div className="card-body">
              <h6 className="text-muted mb-1">Total Leaves</h6>
              <h3 className="mb-0 fw-bold">{leaves.length}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm bg-warning bg-opacity-10">
            <div className="card-body">
              <h6 className="text-muted mb-1">Pending</h6>
              <h3 className="mb-0 fw-bold">
                {leaves.filter((l) => l.status === "pending").length}
              </h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm bg-success bg-opacity-10">
            <div className="card-body">
              <h6 className="text-muted mb-1">Approved</h6>
              <h3 className="mb-0 fw-bold">
                {leaves.filter((l) => l.status === "approved").length}
              </h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm bg-danger bg-opacity-10">
            <div className="card-body">
              <h6 className="text-muted mb-1">Rejected</h6>
              <h3 className="mb-0 fw-bold">
                {leaves.filter((l) => l.status === "rejected").length}
              </h3>
            </div>
          </div>
        </div>
      </div> */}

      {/* Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-body table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th>#</th>
                <th>Employee</th>
                <th>Leave Type</th>
                <th className="text-center">Duration</th>
                <th>Reason</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && leaves.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-4">
                    <div className="spinner-border text-primary">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredLeaves.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-muted">
                    {search ? "No leaves found" : "No leaves available"}
                  </td>
                </tr>
              ) : (
                filteredLeaves.map((item, index) => (
                  <tr key={item._id || index}>
                    <td>{index + 1}</td>
                    <td className="fw-semibold">{item.employee_name}</td>
                    <td>{item.leave_type_name}</td>
                    <td className="text-center">{getDurationDisplay(item)}</td>
                    {/* <td>
                      {item.duration_type === "multiple"
                        ? `${formatDate(item.from_date)} - ${formatDate(item.to_date)}`
                        : formatDate(item.from_date)}
                    </td> */}
                    <td>
                      <span
                        className="text-truncate d-inline-block"
                        style={{ maxWidth: "150px" }}
                      >
                        {item.reason || "-"}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadge(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex justify-content-end gap-2">
                        <button
                          className="btn btn-sm btn-outline-info"
                          onClick={() => handleOpenView(item)}
                          title="View Details"
                        >
                          <FiEye size={16} />
                        </button>

                        <button
                          className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                          onClick={() => handleOpenEdit(item)}
                          title="Edit"
                          disabled={item.status.toLowerCase() === "approved"}
                        >
                          <FiEdit2 size={16} />
                          Edit
                        </button>

                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleOpenDelete(item)}
                          disabled={
                            actionLoading.type === "delete" &&
                            actionLoading.id === item._id
                          }
                          title="Delete"
                        >
                          <RiDeleteBin6Line size={16} />
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

      {/* Modals */}
      {showAddModal && (
        <AddLeaveForm
          onClose={() => setShowAddModal(false)}
          onSave={handleAdd}
          loading={actionLoading.type === "add"}
          employees={employees}
          leaveTypes={leaveTypes}
        />
      )}
      {showEditModal && selectedItem && (
        <EditLeaveForm
          show={showEditModal}
          onHide={() => setShowEditModal(false)}
          onSubmit={handleUpdate}
          leaveRequest={selectedItem}
          employees={employees}
          leaveTypes={leaveTypes}
          loading={actionLoading.type === "edit"}
        />
      )}

      {showDeleteModal && selectedItem && <DeleteConfirmationModal />}
      {showViewModal && selectedItem && <ViewLeaveModal />}
    </div>
  );
}
