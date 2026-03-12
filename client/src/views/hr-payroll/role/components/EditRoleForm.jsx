import React, { useState, useEffect } from "react";

const EditRoleForm = ({ onClose, onSave, role, loading = false }) => {
  const [role_name, setRoleName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  // Reset form when role changes
  useEffect(() => {
    if (role) {
      setRoleName(role.role_name || "");
      setDescription(role.description || "");
      setError("");
    }
  }, [role]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!role_name.trim()) {
      setError("Please enter a role name");
      return;
    }

    const roleData = {
      role_name: role_name.trim(),
      description: description.trim(),
    };

    try {
      await onSave(roleData);
    } catch (error) {
      console.error("Save failed:", error);
      setError("Failed to save. Please try again.");
    }
  };

  const handleClose = () => {
    setRoleName("");
    setDescription("");
    setError("");
    onClose();
  };

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content rounded-3">
          
          {/* Header */}
          <div className="modal-header border-bottom pb-3">
            <h5 className="modal-title fw-bold fs-5">Edit Role</h5>
            <button
              type="button"
              className="btn-close"
              onClick={handleClose}
              disabled={loading}
              aria-label="Close"
            ></button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="alert alert-danger m-3 py-2" role="alert">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {/* Role Name */}
              <div className="mb-3">
                <label className="form-label fw-medium">
                  Role Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control form-control-lg"
                  placeholder="Enter role name"
                  value={role_name}
                  onChange={(e) => {
                    setRoleName(e.target.value);
                    setError("");
                  }}
                  required
                  disabled={loading}
                />
                <div className="form-text">
                  Enter a descriptive name for the role
                </div>
              </div>

              {/* Description */}
              <div className="mb-3">
                <label className="form-label fw-medium">
                  Description
                </label>
                <textarea
                  className="form-control"
                  placeholder="Enter role description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="3"
                  disabled={loading}
                />
                <div className="form-text">
                  Brief description about the role
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="modal-footer border-top pt-3">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!role_name.trim() || loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Saving...
                  </>
                ) : (
                  "Update Role"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditRoleForm;