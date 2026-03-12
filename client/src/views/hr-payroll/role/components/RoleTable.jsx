import React, { useState } from "react";
import { FiEdit2, FiSearch, FiPlus } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import AddRoleForm from "./AddRoleForm";
import EditRoleForm from "./EditRoleForm";
import useRoles from "@/hooks/useRoles";

export default function RoleTable() {
  const {
    roles,
    loading,
    error,
    addRole,
    updateRole,
    deleteRole,
    fetchRoles,
  } = useRoles();

  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [actionLoading, setActionLoading] = useState({ type: null, id: null });

  // Filter roles by search
  const filteredRoles = (roles || []).filter((item) =>
    (item?.role_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (item?.description || "").toLowerCase().includes(search.toLowerCase())
  );

  // Handle update with loading state
  const handleUpdate = async (roleData) => {
    if (!selectedItem) return;

    setActionLoading({ type: "update", id: selectedItem._id });
    try {
      await updateRole(selectedItem._id, roleData);
      setShowEditModal(false);
      setSelectedItem(null);
    } catch (error) {
      console.error("Update failed:", error);
    } finally {
      setActionLoading({ type: null, id: null });
    }
  };

  // Handle add with loading state
  const handleAdd = async (roleData) => {
    setActionLoading({ type: "add", id: null });
    try {
      await addRole(roleData);
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
      await deleteRole(selectedItem._id);
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

  // Handle refresh
  const handleRefresh = () => {
    fetchRoles();
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
            <h5 className="modal-title fw-bold fs-5">Delete Role</h5>
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
              <strong>{selectedItem?.role_name}</strong> role?
            </p>
            {selectedItem?.description && (
              <p className="text-muted">
                Description: {selectedItem.description}
              </p>
            )}
            <p className="text-muted small">
              This action cannot be undone.
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
      {/* Error Display */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show mb-4" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => {}} />
        </div>
      )}

      {/* HEADER */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row align-items-center mb-4">
            <div className="col-md-6">
              <h1 className="h3 fw-bold mb-2">Roles</h1>
              <p className="text-muted mb-0">
                Manage user roles and their descriptions
              </p>
            </div>

            <div className="col-md-6 d-flex justify-content-end gap-2">
              <button
                className="btn btn-outline-secondary d-flex align-items-center gap-2"
                onClick={handleRefresh}
                disabled={loading}
              >
                Refresh
              </button>
              <button
                className="btn btn-primary d-flex align-items-center gap-2"
                onClick={() => setShowAddModal(true)}
                disabled={loading || actionLoading.type === "add"}
              >
                <FiPlus size={18} />
                Add Role
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
                  placeholder="Search roles by name or description..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
            <div className="col-md-8 text-end">
              <small className="text-muted">
                Total: {roles.length} roles
              </small>
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
                <th>Role Name</th>
                <th>Description</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading && roles.length === 0 ? (
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
              ) : filteredRoles.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-muted">
                    {search
                      ? "No roles found for your search"
                      : "No roles available"}
                  </td>
                </tr>
              ) : (
                filteredRoles.map((item, index) => (
                  <tr key={item._id || index}>
                    <td>{index + 1}</td>
                    <td className="fw-semibold">{item.role_name || "Unnamed"}</td>
                    <td className="text-truncate" style={{ maxWidth: "200px" }}>
                      {item.description || "No description"}
                    </td>
                    <td>
                      <span className={`badge ${item.status ? 'bg-success' : 'bg-danger'}`}>
                        {item.status ? "Active" : "Inactive"}
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

      {/* MODALS */}
      {showAddModal && (
        <AddRoleForm
          onClose={() => setShowAddModal(false)}
          onSave={handleAdd}
          loading={actionLoading.type === "add"}
        />
      )}

      {showEditModal && selectedItem && (
        <EditRoleForm
          key={`edit-modal-${selectedItem._id}`}
          onClose={() => {
            setShowEditModal(false);
            setSelectedItem(null);
          }}
          onSave={handleUpdate}
          role={selectedItem}
          loading={
            actionLoading.type === "update" &&
            actionLoading.id === selectedItem._id
          }
        />
      )}

      {showDeleteModal && selectedItem && <DeleteConfirmationModal />}
    </div>
  );
}