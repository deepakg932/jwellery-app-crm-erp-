import React, { useState } from "react";
import { FiUpload } from "react-icons/fi";

const AddSupplierForm = ({ onClose, onSave, loading = false }) => {
  const [formData, setFormData] = useState({
    supplier_name: "",
    phone: "",
    email: "",
    address: "",
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.supplier_name.trim()) {
      newErrors.supplier_name = "Supplier name is required";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone.trim())) {
      newErrors.phone = "Phone number must be 10 digits";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      supplier_name: formData.supplier_name.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      address: formData.address.trim(),
      status: formData.status,
    };

    console.log("Submitting supplier data:", payload);
    onSave(payload);

    // Reset form
    setFormData({
      supplier_name: "",
      phone: "",
      email: "",
      address: "",
      status: true,
    });
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleClose = () => {
    setFormData({
      supplier_name: "",
      phone: "",
      email: "",
      address: "",
      status: true,
    });
    setErrors({});
    onClose();
  };

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content rounded-3">
          <div className="modal-header border-bottom pb-3">
            <h5 className="modal-title fw-bold fs-5">Add Supplier</h5>
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
              <div className="row">
                {/* Supplier Name */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-medium">
                    Supplier Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="supplier_name"
                    className={`form-control form-control-lg ${
                      errors.supplier_name ? "is-invalid" : ""
                    }`}
                    placeholder="Enter supplier name"
                    value={formData.supplier_name}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  {errors.supplier_name && (
                    <div className="invalid-feedback">
                      {errors.supplier_name}
                    </div>
                  )}
                </div>

                {/* Phone */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-medium">
                    Phone Number <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    name="phone"
                    className={`form-control form-control-lg ${
                      errors.phone ? "is-invalid" : ""
                    }`}
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

                {/* Email */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-medium">
                    Email Address <span className="text-danger">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    className={`form-control form-control-lg ${
                      errors.email ? "is-invalid" : ""
                    }`}
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  {errors.email && (
                    <div className="invalid-feedback">{errors.email}</div>
                  )}
                </div>

                {/* Address */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-medium">
                    Address <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    className={`form-control form-control-lg ${
                      errors.address ? "is-invalid" : ""
                    }`}
                    placeholder="Enter address"
                    value={formData.address}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  {errors.address && (
                    <div className="invalid-feedback">{errors.address}</div>
                  )}
                </div>
              </div>

              {/* Status */}
              <div className="mb-3">
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    role="switch"
                    name="status"
                    id="supplierStatus"
                    checked={formData.status}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  <label
                    className="form-check-label fw-medium"
                    htmlFor="supplierStatus"
                  >
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
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <FiUpload size={16} />
                    Save Supplier
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

export default AddSupplierForm;
