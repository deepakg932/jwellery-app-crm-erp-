// components/hr/LeaveTypeTable.jsx
import React, { useState } from "react";
import { FiEdit2, FiSearch, FiPlus } from "react-icons/fi";
import { RiDeleteBin6Line, RiCalendarTodoLine } from "react-icons/ri";
import { useLeaveType } from "@/hooks/useLeaveType";
import AddLeaveTypeForm from "./AddLeaveTypeForm";
import EditLeaveTypeForm from "./EditLeaveTypeForm";

export default function LeaveTypeTable() {
  const {
    leaveTypes,
    loading,
    addLeaveType,
    updateLeaveType,
    deleteLeaveType,
  } = useLeaveType();

  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [actionLoading, setActionLoading] = useState({ type: null, id: null });

  // Filter leave types by search
  const filteredLeaveTypes = (leaveTypes || []).filter((item) =>
    (item?.leave_type_name || "").toLowerCase().includes(search.toLowerCase()),
  );

  // Handle update with loading state
  const handleUpdate = async (leaveTypeData) => {
    if (!selectedItem) return;

    setActionLoading({ type: "update", id: selectedItem._id });
    try {
      await updateLeaveType(selectedItem._id, leaveTypeData);
      setShowEditModal(false);
      setSelectedItem(null);
    } catch (error) {
      console.error("Update failed:", error);
    } finally {
      setActionLoading({ type: null, id: null });
    }
  };

  // Handle add with loading state
  const handleAdd = async (leaveTypeData) => {
    setActionLoading({ type: "add", id: null });
    try {
      await addLeaveType(leaveTypeData);
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
      await deleteLeaveType(selectedItem._id);
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

  // Get badge color based on paid status
  const getPaidStatusBadge = (status) => {
    const statusColors = {
      Paid: "bg-success-subtle text-success",
      Unpaid: "bg-secondary-subtle text-secondary",
      Partial: "bg-warning-subtle text-warning",
    };
    return statusColors[status] || "bg-info-subtle text-info";
  };

  // Get badge color based on allotment type
  const getAllotmentTypeBadge = (type) => {
    return type === "All Employees"
      ? "bg-primary-subtle text-primary"
      : "bg-info-subtle text-info";
  };

  // Get leave type badge color based on name
  const getLeaveTypeColor = (name) => {
    const colors = [
      "bg-primary-subtle text-primary",
      "bg-success-subtle text-success",
      "bg-info-subtle text-info",
      "bg-warning-subtle text-warning",
      "bg-danger-subtle text-danger",
      "bg-secondary-subtle text-secondary",
      "bg-dark-subtle text-dark",
    ];

    // Use a hash of the name to pick a consistent color
    const hash =
      name?.split("").reduce((acc, char) => {
        return char.charCodeAt(0) + ((acc << 5) - acc);
      }, 0) || 0;

    return colors[Math.abs(hash) % colors.length];
  };

  // Delete Confirmation Modal Component
  const DeleteConfirmationModal = () => (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      tabIndex="-1"
    >
      <div
        className="modal-dialog modal-dialog-centered"
        style={{ maxWidth: "520px" }}
      >
        <div className="modal-content rounded-3">
          <div className="modal-header border-bottom pb-3">
            <h5 className="modal-title fw-bold fs-5">Delete Leave Type</h5>
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
              Are you sure you want to delete leave type{" "}
              <strong className="text-danger">
                {selectedItem?.leave_type_name}
              </strong>
              ?
            </p>
            <p className="text-muted small">
              This action cannot be undone. This may affect existing leave
              applications.
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
                    aria-hidden="true"
                  ></span>
                  Deleting...
                </>
              ) : (
                "Delete Leave Type"
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
              <h1 className="h3 fw-bold mb-2">Leave Types</h1>
              <p className="text-muted mb-0">
                Manage different types of leaves for employees
              </p>
            </div>

            <div className="col-md-6 d-flex justify-content-end gap-2">
              <button
                className="btn btn-primary d-flex align-items-center gap-2"
                onClick={() => setShowAddModal(true)}
                disabled={loading || actionLoading.type === "add"}
              >
                <FiPlus size={18} />
                Add Leave Type
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
                  placeholder="Search leave types..."
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
                <th style={{ width: "60px" }}>#</th>
                <th>Leave Type Name</th>
                <th>Paid Status</th>
                <th>Allotment Type</th>
                <th>No. of Leaves</th>
                <th>Monthly Limit</th>
                <th style={{ width: "100px" }}>Status</th>
                <th style={{ width: "150px" }} className="text-end">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {loading && leaveTypes.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-4">
                    <div className="d-flex justify-content-center">
                      <div className="spinner-border text-primary">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : filteredLeaveTypes.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-muted">
                    {search
                      ? "No leave types found for your search"
                      : "No leave types available"}
                  </td>
                </tr>
              ) : (
                filteredLeaveTypes.map((item, index) => (
                  <tr key={item._id || index}>
                    <td>
                      <span className="fw-medium text-muted">{index + 1}</span>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <span
                          className={`badge ${getLeaveTypeColor(item.leave_type_name)} me-2 p-2`}
                        >
                          <RiCalendarTodoLine size={14} />
                        </span>
                        <span className="fw-semibold">
                          {item.leave_type_name || "N/A"}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`badge ${getPaidStatusBadge(item.leave_paid_status)} px-3 py-2`}
                      >
                        {item.leave_paid_status || "Paid"}
                      </span>
                    </td>
                    <td>
                      {item.leave_allotment_type ? (
                        <span
                          className={`badge ${getAllotmentTypeBadge(item.leave_allotment_type)} px-3 py-2`}
                        >
                          {item.leave_allotment_type === "All Employees"
                            ? "Monthly"
                            : "Yearly"}
                        </span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td>
                      <span className="fw-medium">
                        {item.no_of_leaves || "0"}
                      </span>
                    </td>
                    <td>
                      <span className="fw-medium">
                        {item.monthly_limit || "0"}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${item.is_active ? "bg-success-subtle text-success" : "bg-secondary-subtle text-secondary"} px-3 py-2`}
                      >
                        {item.is_active ? "Active" : "Inactive"}
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
        <AddLeaveTypeForm
          onClose={() => setShowAddModal(false)}
          onSave={handleAdd}
          loading={actionLoading.type === "add"}
        />
      )}

      {/* EDIT MODAL */}
      {showEditModal && selectedItem && (
        <EditLeaveTypeForm
          show={showEditModal}
          onHide={() => {
            setShowEditModal(false);
            setSelectedItem(null);
          }}
          onSubmit={handleUpdate}
          leaveType={selectedItem}
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
