import React from "react";
import { FiX, FiFileText, FiCalendar, FiDollarSign } from "react-icons/fi";

const CustomerQuotationsModal = ({ customer, quotations, onClose }) => {
  if (!customer || !quotations) return null;

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { color: "secondary", label: "Draft" },
      sent: { color: "info", label: "Sent" },
      accepted: { color: "success", label: "Accepted" },
      rejected: { color: "danger", label: "Rejected" },
      expired: { color: "warning", label: "Expired" },
      converted: { color: "primary", label: "Converted" },
    };

    const config = statusConfig[status] || {
      color: "secondary",
      label: status,
    };

    return (
      <span className={`badge bg-${config.color} text-white fw-semibold`}>
        {config.label}
      </span>
    );
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
            <h5 className="modal-title fw-bold fs-5">
              Quotations for {customer.name || customer.customer_name}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>

          <div className="modal-body">
            <div className="customer-info mb-4 p-3 bg-light rounded-3">
              <h6 className="fw-bold mb-2">Customer Details</h6>
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-1">
                    <span className="text-muted">Name:</span>
                    <span className="fw-medium ms-2">
                      {customer.name || customer.customer_name}
                    </span>
                  </div>
                  <div className="mb-1">
                    <span className="text-muted">Mobile:</span>
                    <span className="fw-medium ms-2">
                      {customer.mobile || customer.phone}
                    </span>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-1">
                    <span className="text-muted">Email:</span>
                    <span className="fw-medium ms-2">
                      {customer.email || "N/A"}
                    </span>
                  </div>
                  <div className="mb-1">
                    <span className="text-muted">Customer Code:</span>
                    <span className="fw-medium ms-2">
                      {customer.customer_code || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {quotations.length === 0 ? (
              <div className="text-center py-5">
                <FiFileText size={48} className="text-muted mb-3" />
                <h5 className="text-muted">No quotations found</h5>
                <p className="text-muted">
                  This customer doesn't have any quotations yet.
                </p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Quotation #</th>
                      <th>Date</th>
                      <th>Expiry</th>
                      <th>Status</th>
                      <th className="text-end">Amount</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quotations.map((quotation) => (
                      <tr key={quotation._id}>
                        <td className="fw-bold">{quotation.quotation_number}</td>
                        <td>
                          <div className="d-flex align-items-center">
                            <FiCalendar className="me-2" size={14} />
                            {formatDate(quotation.quotation_date)}
                          </div>
                        </td>
                        <td>{formatDate(quotation.expiry_date)}</td>
                        <td>{getStatusBadge(quotation.status)}</td>
                        <td className="text-end fw-bold">
                          <div className="d-flex align-items-center justify-content-end">
                            <FiDollarSign className="me-1" size={14} />
                            {formatCurrency(quotation.grand_total)}
                          </div>
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => {
                              // Navigate to quotation details or open view modal
                              window.open(`/quotations/${quotation._id}`, "_blank");
                            }}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="modal-footer border-top pt-3">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={onClose}
            >
              Close
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                // Navigate to create new quotation for this customer
                window.open(`/quotations/new?customer=${customer._id}`, "_blank");
              }}
            >
              Create New Quotation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerQuotationsModal;