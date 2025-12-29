import React, { useState, useEffect } from "react";
import { FiUpload } from "react-icons/fi";

const EditBranchForm = ({ 
  onClose, 
  onSave, 
  branch, 
  loading = false,
  branchTypes = [],
  loadingTypes = false,
  typesError = ""
}) => {
  const [formData, setFormData] = useState({
    branch_name: "",
    branch_type: "",
    address: "",
    phone: "",
    status: true,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (branch) {
      setFormData({
        branch_name: branch.branch_name || "",
        branch_type: branch.branch_type_id || branch.branch_type?._id || "",
        address: branch.address || "",
        phone: branch.phone || "",
        status: branch.status !== false,
      });
      setErrors({});
    }
  }, [branch]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.branch_name.trim()) {
      newErrors.branch_name = "Branch name is required";
    }

    if (!formData.branch_type) {
      newErrors.branch_type = "Branch type is required";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone.trim())) {
      newErrors.phone = "Phone number must be 10 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      branch_name: formData.branch_name.trim(),
      branch_type: formData.branch_type,
      address: formData.address.trim(),
      phone: formData.phone.trim(),
      status: formData.status,
    };

    console.log("Updating branch data:", payload);
    onSave(payload);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleClose = () => {
    if (!loading) onClose();
  };

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content rounded-3">
          <div className="modal-header border-bottom pb-3">
            <h5 className="modal-title fw-bold fs-5">Edit Branch</h5>
            <button
              type="button"
              className="btn-close"
              onClick={handleClose}
              disabled={loading}
              aria-label="Close"
            ></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {/* Branch Name */}
              <div className="mb-3">
                <label className="form-label fw-medium">
                  Branch Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="branch_name"
                  className={`form-control form-control-lg ${errors.branch_name ? "is-invalid" : ""}`}
                  placeholder="Enter branch name"
                  value={formData.branch_name}
                  onChange={handleChange}
                  disabled={loading}
                />
                {errors.branch_name && (
                  <div className="invalid-feedback">{errors.branch_name}</div>
                )}
              </div>

              {/* Phone */}
              <div className="mb-3">
                <label className="form-label fw-medium">
                  Phone Number <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  name="phone"
                  className={`form-control form-control-lg ${errors.phone ? "is-invalid" : ""}`}
                  placeholder="Enter 10-digit phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={loading}
                  maxLength="10"
                />
                {errors.phone && (
                  <div className="invalid-feedback">{errors.phone}</div>
                )}
              </div>

              {/* Branch Type */}
              <div className="mb-3">
                <label className="form-label fw-medium">
                  Branch Type <span className="text-danger">*</span>
                </label>
                <select
                  name="branch_type"
                  className={`form-select form-select-lg ${errors.branch_type ? "is-invalid" : ""}`}
                  value={formData.branch_type}
                  onChange={handleChange}
                  disabled={loading || loadingTypes}
                >
                  <option value="">Select Branch Type</option>
                  {branchTypes.map(type => (
                    <option key={type._id} value={type._id}>
                      {type.branch_type}
                    </option>
                  ))}
                </select>
                {errors.branch_type && (
                  <div className="invalid-feedback">{errors.branch_type}</div>
                )}
                {loadingTypes && (
                  <div className="form-text text-info">Loading branch types...</div>
                )}
                {typesError && (
                  <div className="form-text text-danger">{typesError}</div>
                )}
              </div>

              {/* Address */}
              <div className="mb-3">
                <label className="form-label fw-medium">
                  Address <span className="text-danger">*</span>
                </label>
                <textarea
                  name="address"
                  className={`form-control form-control-lg ${errors.address ? "is-invalid" : ""}`}
                  placeholder="Enter branch address"
                  value={formData.address}
                  onChange={handleChange}
                  disabled={loading}
                  rows="3"
                />
                {errors.address && (
                  <div className="invalid-feedback">{errors.address}</div>
                )}
              </div>

              {/* Status */}
              <div className="mb-3">
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    role="switch"
                    name="status"
                    id="editBranchStatus"
                    checked={formData.status}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  <label className="form-check-label fw-medium" htmlFor="editBranchStatus">
                    Status (Active/Inactive)
                  </label>
                </div>
              </div>
            </div>

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
                className="btn btn-primary d-flex align-items-center gap-2"
                disabled={loading || loadingTypes}
              >
                {loading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Updating...
                  </>
                ) : (
                  <>
                    <FiUpload size={16} />
                    Update Branch
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditBranchForm;