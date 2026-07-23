// components/hr/DepartmentTable.jsx
import React, { useState } from "react";
import { FiEdit2, FiSearch, FiPlus, FiMail, FiPhone, FiMapPin, FiUsers } from "react-icons/fi";
import { RiDeleteBin6Line, RiBuildingLine } from "react-icons/ri";
import { MdOutlineAttachMoney } from "react-icons/md";
import { useDepartment } from "@/hooks/useDepartment";
import AddDepartmentForm from "./AddDepartmentForm";
import EditDepartmentForm from "./EditDepartmentForm";

export default function DepartmentTable() {
  const {
    departments,
    loading,
    addDepartment,
    updateDepartment,
    deleteDepartment,
  } = useDepartment();

  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [actionLoading, setActionLoading] = useState({ type: null, id: null });

  // Filter departments by search
  const filteredDepartments = (departments || []).filter((item) =>
    (item?.department_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (item?.department_code || "").toLowerCase().includes(search.toLowerCase()) ||
    (item?.department_head || "").toLowerCase().includes(search.toLowerCase())
  );

  // Handle update with loading state
  const handleUpdate = async (departmentData) => {
    if (!selectedItem) return;

    setActionLoading({ type: "update", id: selectedItem._id });
    try {
      await updateDepartment(selectedItem._id, departmentData);
      setShowEditModal(false);
      setSelectedItem(null);
    } catch (error) {
      console.error("Update failed:", error);
    } finally {
      setActionLoading({ type: null, id: null });
    }
  };

  // Handle add with loading state
  const handleAdd = async (departmentData) => {
    setActionLoading({ type: "add", id: null });
    try {
      await addDepartment(departmentData);
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
      await deleteDepartment(selectedItem._id);
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

  // Get department badge color based on name
  const getDepartmentColor = (name) => {
    const colors = {
      'Human Resources': 'bg-primary-subtle text-primary',
      'Information Technology': 'bg-info-subtle text-info',
      'Finance': 'bg-success-subtle text-success',
      'Marketing': 'bg-warning-subtle text-warning',
      'Operations': 'bg-secondary-subtle text-secondary',
      'Sales': 'bg-danger-subtle text-danger',
    };
    
    for (const [key, value] of Object.entries(colors)) {
      if (name?.toLowerCase().includes(key.toLowerCase())) {
        return value;
      }
    }
    return 'bg-light text-dark border';
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
            <h5 className="modal-title fw-bold fs-5">Delete Department</h5>
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
              Are you sure you want to delete department{" "}
              <strong>{selectedItem?.department_name}</strong>?
            </p>
            <p className="text-muted small">
              This action cannot be undone. This will also affect all employees in this department.
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
                "Delete Department"
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
              <h1 className="h3 fw-bold mb-2">Departments</h1>
              <p className="text-muted mb-0">
                Manage departments, budgets, and employee assignments
              </p>
            </div>

            <div className="col-md-6 d-flex justify-content-end gap-2">
              <button
                className="btn btn-primary d-flex align-items-center gap-2"
                onClick={() => setShowAddModal(true)}
                disabled={loading || actionLoading.type === "add"}
              >
                <FiPlus size={18} />
                Add Department
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
                  placeholder="Search by name, code, or head..."
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
                <th>Department</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading && departments.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center py-4">
                    <div className="d-flex justify-content-center">
                      <div className="spinner-border text-primary">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : filteredDepartments.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center py-4 text-muted">
                    {search
                      ? "No departments found for your search"
                      : "No departments available"}
                  </td>
                </tr>
              ) : (
                filteredDepartments.map((item, index) => (
                  <tr key={item._id || index}>
                    <td>
                      <div className="d-flex align-items-center">
                        <span className={`badge ${getDepartmentColor(item.department_name)} me-2 p-2`}>
                        </span>
                        <div>
                          <div className="fw-semibold">{item.department_name || "N/A"}</div>
                          {item.location && (
                            <small className="text-muted d-flex align-items-center gap-1">
                              <FiMapPin size={12} /> {item.location}
                            </small>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${item.status ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'}`}>
                        {item.status ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    {/* ACTION BUTTONS */}
                    <td className="text-end">
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
        <AddDepartmentForm
          onClose={() => setShowAddModal(false)}
          onSave={handleAdd}
          loading={actionLoading.type === "add"}
        />
      )}

      {/* EDIT MODAL */}
      {showEditModal && selectedItem && (
        <EditDepartmentForm
          show={showEditModal}
          onHide={() => {
            setShowEditModal(false);
            setSelectedItem(null);
          }}
          onSubmit={handleUpdate}
          department={selectedItem}
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