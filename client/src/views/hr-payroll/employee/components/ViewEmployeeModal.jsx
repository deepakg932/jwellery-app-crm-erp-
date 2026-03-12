// components/hr/ViewEmployeeModal.jsx
import React from "react";
import { FiUser, FiX, FiMail, FiPhone, FiCalendar, FiMapPin } from "react-icons/fi";

const ViewEmployeeModal = ({ employee, onClose }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
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
            <h5 className="modal-title fw-bold fs-5">Employee Details</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>

          <div className="modal-body">
            <div className="row">
              {/* Profile Image */}
              <div className="col-12 text-center mb-4">
                <div className="d-flex flex-column align-items-center">
                  <div
                    className="rounded-circle border border-3 border-primary p-1 mb-2"
                    style={{ width: "120px", height: "120px" }}
                  >
                    {employee.fullImageUrl || employee.image ? (
                      <img
                        src={employee.fullImageUrl || employee.image}
                        alt={employee.name}
                        className="rounded-circle w-100 h-100 object-fit-cover"
                      />
                    ) : (
                      <div className="w-100 h-100 rounded-circle bg-light d-flex align-items-center justify-content-center">
                        <FiUser size={48} className="text-muted" />
                      </div>
                    )}
                  </div>
                  <h4 className="mb-1">{employee.salutation} {employee.name}</h4>
                  <p className="text-muted mb-0">Employee ID: {employee.employee_id || "N/A"}</p>
                </div>
              </div>

              {/* Personal Information */}
              <div className="col-md-6 mb-3">
                <div className="card bg-light border-0">
                  <div className="card-body">
                    <h6 className="fw-bold mb-3">Personal Information</h6>
                    
                    <div className="mb-2">
                      <small className="text-muted d-block">Email</small>
                      <span className="fw-medium">{employee.email || "N/A"}</span>
                    </div>

                    <div className="mb-2">
                      <small className="text-muted d-block">Mobile</small>
                      <span className="fw-medium">{employee.mobile || employee.phone || "N/A"}</span>
                    </div>

                    <div className="mb-2">
                      <small className="text-muted d-block">Gender</small>
                      <span className="fw-medium">{employee.gender || "N/A"}</span>
                    </div>

                    <div className="mb-2">
                      <small className="text-muted d-block">Date of Birth</small>
                      <span className="fw-medium">{formatDate(employee.date_of_birth)}</span>
                    </div>

                    <div className="mb-2">
                      <small className="text-muted d-block">Language</small>
                      <span className="fw-medium">{employee.language || "English"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Employment Information */}
              <div className="col-md-6 mb-3">
                <div className="card bg-light border-0">
                  <div className="card-body">
                    <h6 className="fw-bold mb-3">Employment Information</h6>

                    <div className="mb-2">
                      <small className="text-muted d-block">Designation</small>
                      <span className="badge bg-info text-dark">{employee.designation_name || "N/A"}</span>
                    </div>

                    <div className="mb-2">
                      <small className="text-muted d-block">Department</small>
                      <span className="badge bg-primary text-white">{employee.department_name || "N/A"}</span>
                    </div>

                    <div className="mb-2">
                      <small className="text-muted d-block">Role</small>
                      <span className="badge bg-secondary text-white">{employee.role_name || "N/A"}</span>
                    </div>

                    <div className="mb-2">
                      <small className="text-muted d-block">Reporting To</small>
                      <span className="fw-medium">{employee.reporting_to_name || "N/A"}</span>
                    </div>

                    <div className="mb-2">
                      <small className="text-muted d-block">Joining Date</small>
                      <span className="fw-medium">{formatDate(employee.joining_date)}</span>
                    </div>

                 
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="col-md-6 mb-3">
                <div className="card bg-light border-0">
                  <div className="card-body">
                    <h6 className="fw-bold mb-3">Address Information</h6>

                    <div className="mb-2">
                      <small className="text-muted d-block">Address</small>
                      <span className="fw-medium">{employee.address || "N/A"}</span>
                    </div>

                    <div className="mb-2">
                      <small className="text-muted d-block">City</small>
                      <span className="fw-medium">{employee.city || "N/A"}</span>
                    </div>

                    <div className="mb-2">
                      <small className="text-muted d-block">State</small>
                      <span className="fw-medium">{employee.state || "N/A"}</span>
                    </div>

                    <div className="mb-2">
                      <small className="text-muted d-block">Country</small>
                      <span className="fw-medium">{employee.country || "India"}</span>
                    </div>

                    
                  </div>
                </div>
              </div>

         

              {/* About */}
              {employee.about && (
                <div className="col-12 mb-3">
                  <div className="card bg-light border-0">
                    <div className="card-body">
                      <h6 className="fw-bold mb-2">About</h6>
                      <p className="mb-0">{employee.about}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Status */}
              <div className="col-12">
                <div className="d-flex justify-content-between align-items-center">
                  <span className="fw-medium">Status</span>
                  <span
                    className={`badge fw-semibold ${
                      employee.status ? "bg-success" : "bg-danger"
                    }`}
                  >
                    {employee.status ? "Active" : "Inactive"}
                  </span>
                </div>
                <hr className="my-2" />
                <div className="text-muted small text-end">
                  Created: {formatDate(employee.createdAt)}
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer border-top pt-3">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewEmployeeModal;